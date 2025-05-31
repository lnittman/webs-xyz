# Vercel AI SDK UI Integration with Mastra

This guide covers the integration of Vercel AI SDK UI with Mastra in a turborepo architecture, enabling streaming workflows, generative UI, and advanced tool usage patterns.

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Stream Protocol Alignment](#stream-protocol-alignment)
3. [Workflow Streaming](#workflow-streaming)
4. [Chat Integration with useChat](#chat-integration-with-usechat)
5. [Generative UI Implementation](#generative-ui-implementation)
6. [Tool Usage Patterns](#tool-usage-patterns)
7. [Domain-Specific Tools](#domain-specific-tools)
8. [Implementation Examples](#implementation-examples)

## Architecture Overview

In a turborepo setup with Mastra:
- **apps/app**: Next.js frontend using AI SDK UI hooks
- **apps/ai**: Mastra backend with agents, workflows, and tools
- **apps/api**: API gateway for webhooks and integration points

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   app/app   │────▶│   app/api   │────▶│   app/ai    │
│  (Next.js)  │◀────│  (Gateway)  │◀────│  (Mastra)   │
└─────────────┘     └─────────────┘     └─────────────┘
     useChat         Data Streams        Workflows/Agents
```

## Stream Protocol Alignment

### Vercel AI SDK Data Stream Format

The AI SDK uses a specific format for streaming data: `TYPE_ID:CONTENT_JSON\n`

Key stream parts:
- **Text**: `0:"text content"\n`
- **Tool Call**: `9:{"toolCallId":"id","toolName":"name","args":{}}\n`
- **Tool Result**: `a:{"toolCallId":"id","result":{}}\n`
- **Data**: `2:[{"custom":"data"}]\n`
- **Error**: `3:"error message"\n`
- **Finish Step**: `e:{"finishReason":"stop","usage":{}}\n`
- **Finish Message**: `d:{"finishReason":"stop","usage":{}}\n`

### Mastra to AI SDK Stream Adapter

Create a stream adapter that converts Mastra workflow events to AI SDK format:

```typescript
// apps/ai/src/mastra/utils/stream-adapter.ts
import { DataStreamWriter } from 'ai';
import { Workflow } from '@mastra/core/workflows';

export async function streamMastraWorkflow(
  workflow: Workflow,
  runId: string,
  dataStream: DataStreamWriter
) {
  // Watch workflow execution
  workflow.watch({ runId }, (record) => {
    const { activePaths, results, timestamp } = record;
    
    // Convert workflow steps to AI SDK format
    Object.entries(activePaths).forEach(([stepId, pathInfo]) => {
      if (pathInfo.status === 'executing') {
        // Stream step start
        dataStream.writeData([{
          type: 'workflow-step-start',
          stepId,
          timestamp,
        }]);
      }
    });
    
    // Stream step results
    Object.entries(results).forEach(([stepId, result]) => {
      if (result.status === 'success') {
        dataStream.writeData([{
          type: 'workflow-step-complete',
          stepId,
          result: result.output,
          timestamp,
        }]);
      }
    });
    
    // Check if workflow is complete
    const allComplete = Object.values(activePaths).every(
      path => path.status !== 'executing'
    );
    
    if (allComplete) {
      dataStream.writeData([{
        type: 'workflow-complete',
        results,
        timestamp,
      }]);
    }
  });
}
```

## Workflow Streaming

### Server-Side Implementation

Update your API routes to use AI SDK's data stream response:

```typescript
// apps/app/src/app/api/webs/[id]/analyze/route.ts
import { createDataStreamResponse } from 'ai';
import { streamMastraWorkflow } from '@/lib/mastra/stream-adapter';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { urls, prompt } = await request.json();
  
  return createDataStreamResponse({
    execute: async (dataStream) => {
      try {
        // Write initial status
        dataStream.writeData([{
          type: 'analysis-started',
          webId: id,
          urls,
        }]);
        
        // Start Mastra workflow
        const workflow = mastra.getWorkflow('analyzeWeb');
        const { runId } = await workflow.createRun();
        
        // Stream workflow progress
        await streamMastraWorkflow(workflow, runId, dataStream);
        
        // Start workflow execution
        workflow.start({
          runId,
          triggerData: { urls, prompt },
        });
        
      } catch (error) {
        dataStream.writeData([{
          type: 'error',
          error: error.message,
        }]);
      }
    },
    onError: (error) => {
      // Mask sensitive errors in production
      return process.env.NODE_ENV === 'development' 
        ? error.message 
        : 'An error occurred during analysis';
    },
  });
}
```

### Client-Side Consumption

Use AI SDK hooks to consume the stream:

```typescript
// apps/app/src/hooks/use-web-analysis.ts
import { useCompletion } from 'ai/react';
import { useEffect } from 'react';

export function useWebAnalysis(webId: string) {
  const {
    complete,
    completion,
    isLoading,
    data,
    error,
  } = useCompletion({
    api: `/api/webs/${webId}/analyze`,
    streamProtocol: 'data',
  });
  
  // Process workflow step updates
  useEffect(() => {
    if (!data) return;
    
    data.forEach((item) => {
      if (item.type === 'workflow-step-complete') {
        // Handle step completion
        console.log('Step completed:', item.stepId, item.result);
      }
    });
  }, [data]);
  
  return {
    startAnalysis: (urls: string[], prompt?: string) => {
      return complete(prompt || '', {
        body: { urls, prompt },
      });
    },
    isAnalyzing: isLoading,
    analysisData: data,
    error,
  };
}
```

## Chat Integration with useChat

### Server Implementation with Tools

```typescript
// apps/app/src/app/api/chat/route.ts
import { streamText } from 'ai';
import { chatAgent } from '@ai/mastra/agents/chat';
import { z } from 'zod';

export async function POST(req: Request) {
  const { messages, id: chatId, webContext } = await req.json();
  
  const result = streamText({
    model: chatAgent.model,
    messages,
    system: `${chatAgent.instructions}\n\nWeb Context: ${JSON.stringify(webContext)}`,
    tools: {
      analyzeUrl: {
        description: 'Analyze a specific URL from the web context',
        parameters: z.object({
          url: z.string().url(),
          aspect: z.string().describe('What aspect to analyze'),
        }),
        execute: async ({ url, aspect }) => {
          // Execute analysis on specific URL
          const result = await analyzeSpecificUrl(url, aspect);
          return result;
        },
      },
      compareUrls: {
        description: 'Compare multiple URLs from the analysis',
        parameters: z.object({
          urls: z.array(z.string().url()),
          criteria: z.string(),
        }),
      },
      addUrlToWeb: {
        description: 'Add a new URL to the current web analysis',
        parameters: z.object({
          url: z.string().url(),
          reason: z.string(),
        }),
      },
    },
    maxSteps: 5,
    onFinish: async ({ response }) => {
      // Save chat messages
      await saveChatMessages(chatId, response.messages);
    },
  });
  
  return result.toDataStreamResponse();
}
```

### Client Implementation with Tool UI

```typescript
// apps/app/src/components/web-chat-enhanced.tsx
'use client';

import { useChat } from 'ai/react';
import { UrlAnalysisCard } from './url-analysis-card';
import { ComparisonChart } from './comparison-chart';
import { AddUrlConfirmation } from './add-url-confirmation';

export function WebChatEnhanced({ web }: { web: Web }) {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    data,
    addToolResult,
  } = useChat({
    api: '/api/chat',
    body: {
      webContext: {
        id: web.id,
        urls: web.urls,
        topics: web.topics,
        insights: web.insights,
      },
    },
    maxSteps: 5,
    onToolCall: async ({ toolCall }) => {
      // Handle client-side tools
      if (toolCall.toolName === 'addUrlToWeb') {
        // Could show confirmation UI before executing
        const confirmed = await showConfirmation(toolCall.args);
        if (confirmed) {
          await addUrlToWebAction(web.id, toolCall.args.url);
          return { added: true, url: toolCall.args.url };
        }
        return { added: false, reason: 'User cancelled' };
      }
    },
  });
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id}>
            {/* Render message content */}
            <div>{message.content}</div>
            
            {/* Render tool invocations as UI components */}
            {message.toolInvocations?.map((invocation) => {
              switch (invocation.toolName) {
                case 'analyzeUrl':
                  return (
                    <UrlAnalysisCard
                      key={invocation.toolCallId}
                      url={invocation.args.url}
                      aspect={invocation.args.aspect}
                      result={invocation.result}
                      isLoading={invocation.state === 'call'}
                    />
                  );
                  
                case 'compareUrls':
                  return (
                    <ComparisonChart
                      key={invocation.toolCallId}
                      comparison={invocation.result}
                      isLoading={invocation.state === 'call'}
                    />
                  );
                  
                case 'addUrlToWeb':
                  return (
                    <AddUrlConfirmation
                      key={invocation.toolCallId}
                      url={invocation.args.url}
                      reason={invocation.args.reason}
                      onConfirm={() => addToolResult({
                        toolCallId: invocation.toolCallId,
                        result: { confirmed: true },
                      })}
                      onCancel={() => addToolResult({
                        toolCallId: invocation.toolCallId,
                        result: { confirmed: false },
                      })}
                    />
                  );
              }
            })}
          </div>
        ))}
      </div>
      
      {/* Input area */}
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="Ask about this web analysis..."
          disabled={isLoading}
        />
      </form>
    </div>
  );
}
```

## Generative UI Implementation

### Creating Tool Result Components

```typescript
// apps/app/src/components/generative-ui/url-analysis-card.tsx
import { motion } from 'framer-motion';
import { Skeleton } from '@repo/design/components/ui/skeleton';

interface UrlAnalysisCardProps {
  url: string;
  aspect: string;
  result?: {
    summary: string;
    findings: string[];
    sentiment: 'positive' | 'neutral' | 'negative';
    relevantQuotes: string[];
  };
  isLoading: boolean;
}

export function UrlAnalysisCard({
  url,
  aspect,
  result,
  isLoading,
}: UrlAnalysisCardProps) {
  if (isLoading) {
    return (
      <div className="p-4 border rounded-lg space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 border rounded-lg space-y-3"
    >
      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-medium">Analysis: {aspect}</h4>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground hover:underline"
          >
            {new URL(url).hostname}
          </a>
        </div>
        <SentimentBadge sentiment={result?.sentiment} />
      </div>
      
      <p className="text-sm">{result?.summary}</p>
      
      {result?.findings && (
        <ul className="text-sm space-y-1">
          {result.findings.map((finding, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-green-600">•</span>
              <span>{finding}</span>
            </li>
          ))}
        </ul>
      )}
      
      {result?.relevantQuotes && result.relevantQuotes.length > 0 && (
        <div className="border-l-2 border-muted pl-3 space-y-2">
          {result.relevantQuotes.map((quote, i) => (
            <blockquote key={i} className="text-sm italic text-muted-foreground">
              "{quote}"
            </blockquote>
          ))}
        </div>
      )}
    </motion.div>
  );
}
```

### Tool Calling Visualization

```typescript
// apps/app/src/components/tool-call-indicator.tsx
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Wrench } from 'lucide-react';

interface ToolCallIndicatorProps {
  toolName: string;
  args: any;
  state: 'partial-call' | 'call' | 'result';
}

export function ToolCallIndicator({
  toolName,
  args,
  state,
}: ToolCallIndicatorProps) {
  const toolDescriptions: Record<string, string> = {
    analyzeUrl: 'Analyzing webpage content',
    compareUrls: 'Comparing multiple sources',
    addUrlToWeb: 'Adding URL to analysis',
    searchRelated: 'Finding related content',
  };
  
  return (
    <AnimatePresence>
      {state !== 'result' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="flex items-center gap-2 p-2 bg-blue-50 rounded-md text-sm"
        >
          {state === 'partial-call' ? (
            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
          ) : (
            <Wrench className="h-4 w-4 text-blue-600" />
          )}
          <span className="text-blue-700">
            {toolDescriptions[toolName] || `Using ${toolName}`}
          </span>
          {args && (
            <code className="text-xs bg-blue-100 px-1 rounded">
              {Object.entries(args)
                .map(([k, v]) => `${k}: ${v}`)
                .join(', ')}
            </code>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

## Tool Usage Patterns

### Server-Side Tools

Tools that execute on the server and return results:

```typescript
// apps/ai/src/mastra/tools/web-analysis-tools.ts
import { createTool } from '@mastra/core';
import { z } from 'zod';

export const deepDiveUrlTool = createTool({
  id: 'deep-dive-url',
  description: 'Perform deep analysis on a specific URL section',
  inputSchema: z.object({
    url: z.string().url(),
    section: z.string(),
    analysisType: z.enum(['technical', 'content', 'seo', 'performance']),
  }),
  execute: async ({ url, section, analysisType }) => {
    // Fetch and analyze specific section
    const content = await fetchUrlSection(url, section);
    const analysis = await performAnalysis(content, analysisType);
    
    return {
      url,
      section,
      analysisType,
      findings: analysis.findings,
      metrics: analysis.metrics,
      recommendations: analysis.recommendations,
    };
  },
});

export const crossReferenceUrlsTool = createTool({
  id: 'cross-reference-urls',
  description: 'Find connections between multiple URLs',
  inputSchema: z.object({
    urls: z.array(z.string().url()),
    connectionType: z.enum(['content', 'links', 'topics', 'entities']),
  }),
  execute: async ({ urls, connectionType }) => {
    const connections = await findConnections(urls, connectionType);
    
    return {
      urls,
      connectionType,
      connections: connections.map(conn => ({
        between: conn.urls,
        strength: conn.strength,
        evidence: conn.evidence,
      })),
      graph: generateConnectionGraph(connections),
    };
  },
});
```

### Client-Side Tools

Tools that require user interaction or client state:

```typescript
// apps/app/src/lib/client-tools.ts
export const clientTools = {
  highlightContent: {
    description: 'Highlight specific content in the UI',
    parameters: z.object({
      elementId: z.string(),
      color: z.string().optional(),
      duration: z.number().optional(),
    }),
    // Client-side execution in onToolCall
  },
  
  copyToClipboard: {
    description: 'Copy analysis results to clipboard',
    parameters: z.object({
      content: z.string(),
      format: z.enum(['plain', 'markdown', 'json']),
    }),
  },
  
  openInNewTab: {
    description: 'Open URL in a new browser tab',
    parameters: z.object({
      url: z.string().url(),
      focused: z.boolean().optional(),
    }),
  },
  
  saveToWorkspace: {
    description: 'Save analysis to user workspace',
    parameters: z.object({
      title: z.string(),
      content: z.any(),
      tags: z.array(z.string()).optional(),
    }),
  },
};
```

## Domain-Specific Tools

### Database Entity Tools

Create tools that interact with your Prisma schema:

```typescript
// apps/ai/src/mastra/tools/entity-tools.ts
import { database } from '@repo/database';
import { createTool } from '@mastra/core';
import { z } from 'zod';

export const webManagementTools = {
  updateWebMetadata: createTool({
    id: 'update-web-metadata',
    description: 'Update web analysis metadata',
    inputSchema: z.object({
      webId: z.string(),
      updates: z.object({
        title: z.string().optional(),
        description: z.string().optional(),
        emoji: z.string().optional(),
        topics: z.array(z.string()).optional(),
      }),
    }),
    execute: async ({ webId, updates }) => {
      const web = await database.web.update({
        where: { id: webId },
        data: updates,
      });
      
      return {
        success: true,
        web: {
          id: web.id,
          ...updates,
        },
      };
    },
  }),
  
  addRelatedUrl: createTool({
    id: 'add-related-url',
    description: 'Add a related URL to web analysis',
    inputSchema: z.object({
      webId: z.string(),
      url: z.string().url(),
      relationship: z.string(),
      autoAnalyze: z.boolean().optional(),
    }),
    execute: async ({ webId, url, relationship, autoAnalyze }) => {
      // Update web with new related URL
      const web = await database.web.update({
        where: { id: webId },
        data: {
          relatedUrls: {
            push: url,
          },
        },
      });
      
      // Optionally trigger analysis
      if (autoAnalyze) {
        await triggerUrlAnalysis(url, webId);
      }
      
      return {
        added: true,
        url,
        relationship,
        webId,
      };
    },
  }),
  
  createWebEntity: createTool({
    id: 'create-web-entity',
    description: 'Extract and save an entity from web content',
    inputSchema: z.object({
      webId: z.string(),
      type: z.string(),
      value: z.string(),
      context: z.string().optional(),
    }),
    execute: async ({ webId, type, value, context }) => {
      const entity = await database.webEntity.create({
        data: {
          webId,
          type,
          value,
        },
      });
      
      return {
        created: true,
        entity: {
          id: entity.id,
          type: entity.type,
          value: entity.value,
        },
      };
    },
  }),
};
```

### Workflow Integration Tools

Tools that trigger or interact with Mastra workflows:

```typescript
// apps/ai/src/mastra/tools/workflow-tools.ts
export const workflowTools = {
  runDeepAnalysis: createTool({
    id: 'run-deep-analysis',
    description: 'Run deep analysis workflow on URLs',
    inputSchema: z.object({
      urls: z.array(z.string().url()),
      analysisDepth: z.enum(['basic', 'detailed', 'comprehensive']),
      extractEntities: z.boolean().optional(),
      findRelatedContent: z.boolean().optional(),
    }),
    execute: async (params) => {
      const workflow = mastra.getWorkflow('deepAnalyzeWeb');
      const { runId } = await workflow.createRun();
      
      // Start workflow
      const result = await workflow.startAsync({
        runId,
        triggerData: params,
      });
      
      return {
        runId,
        status: 'started',
        estimatedTime: calculateEstimatedTime(params),
      };
    },
  }),
  
  compareWebSnapshots: createTool({
    id: 'compare-snapshots',
    description: 'Compare web content over time',
    inputSchema: z.object({
      webId: z.string(),
      timeRange: z.object({
        from: z.string().datetime(),
        to: z.string().datetime(),
      }),
    }),
    execute: async ({ webId, timeRange }) => {
      // Fetch historical snapshots
      const snapshots = await fetchWebSnapshots(webId, timeRange);
      
      // Run comparison workflow
      const comparison = await runComparisonWorkflow(snapshots);
      
      return {
        changes: comparison.changes,
        timeline: comparison.timeline,
        insights: comparison.insights,
      };
    },
  }),
};
```

## Implementation Examples

### Complete Chat Integration

```typescript
// apps/app/src/app/api/chat/route.ts
import { streamText } from 'ai';
import { createDataStreamResponse } from 'ai';
import { chatAgent } from '@ai/mastra/agents/chat';
import { webManagementTools, workflowTools } from '@ai/mastra/tools';

export async function POST(req: Request) {
  const { messages, id: chatId, webContext } = await req.json();
  
  // Combine all tools
  const tools = {
    ...webManagementTools,
    ...workflowTools,
    // Client-notification tools
    notifyUser: {
      description: 'Send notification to user',
      parameters: z.object({
        message: z.string(),
        type: z.enum(['info', 'success', 'warning', 'error']),
      }),
    },
  };
  
  const result = streamText({
    model: chatAgent.model,
    messages,
    system: enhanceSystemPrompt(chatAgent.instructions, webContext),
    tools,
    maxSteps: 5,
    toolCallStreaming: true,
    onFinish: async ({ response }) => {
      await saveChatSession(chatId, messages, response);
    },
  });
  
  return result.toDataStreamResponse({
    getErrorMessage: (error) => {
      console.error('Chat error:', error);
      return 'An error occurred during the conversation';
    },
  });
}

function enhanceSystemPrompt(baseInstructions: string, webContext: any) {
  return `
${baseInstructions}

Current Web Context:
- Web ID: ${webContext.id}
- URLs: ${webContext.urls.join(', ')}
- Topics: ${webContext.topics?.join(', ') || 'Not analyzed yet'}
- Status: ${webContext.status}

You have access to tools for:
1. Analyzing specific aspects of the URLs
2. Comparing content between URLs
3. Managing web metadata and entities
4. Running advanced analysis workflows
5. Notifying the user of important findings

Always explain what tools you're using and why.
`;
}
```

### Streaming Workflow Progress

```typescript
// apps/app/src/components/workflow-progress.tsx
import { useEffect, useState } from 'react';
import { Progress } from '@repo/design/components/ui/progress';

export function WorkflowProgress({ webId }: { webId: string }) {
  const [steps, setSteps] = useState<WorkflowStep[]>([]);
  const { data, isConnected } = useWebWorkflowStream(webId);
  
  useEffect(() => {
    if (!data) return;
    
    // Update steps based on stream data
    data.forEach((event) => {
      if (event.type === 'workflow-step-start') {
        setSteps(prev => [...prev, {
          id: event.stepId,
          status: 'running',
          startTime: event.timestamp,
        }]);
      } else if (event.type === 'workflow-step-complete') {
        setSteps(prev => prev.map(step => 
          step.id === event.stepId
            ? { ...step, status: 'complete', result: event.result }
            : step
        ));
      }
    });
  }, [data]);
  
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className={cn(
          "h-2 w-2 rounded-full",
          isConnected ? "bg-green-500" : "bg-gray-300"
        )} />
        <span className="text-sm text-muted-foreground">
          {isConnected ? 'Live' : 'Disconnected'}
        </span>
      </div>
      
      {steps.map((step) => (
        <div key={step.id} className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span>{formatStepName(step.id)}</span>
            <StatusBadge status={step.status} />
          </div>
          {step.status === 'running' && (
            <Progress value={calculateProgress(step)} className="h-1" />
          )}
          {step.result && (
            <div className="text-xs text-muted-foreground">
              {summarizeResult(step.result)}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
```

## Best Practices

### 1. Stream Protocol Compliance
- Always use AI SDK's data stream format
- Include proper headers (`x-vercel-ai-data-stream: v1`)
- Handle errors gracefully with proper error parts

### 2. Tool Design
- Keep server-side tools for data operations
- Use client-side tools for UI interactions
- Provide clear descriptions for LLM understanding
- Return structured data for generative UI

### 3. Performance
- Stream early and often for better UX
- Use `createDataStreamResponse` for immediate streaming
- Implement proper cleanup with `consumeStream()`
- Cache tool results when appropriate

### 4. Security
- Validate all tool inputs with Zod schemas
- Mask sensitive errors in production
- Implement proper authentication for tools
- Audit tool usage for compliance

### 5. User Experience
- Show tool invocations in the UI
- Provide loading states for long operations
- Allow users to cancel/retry tool calls
- Give context for why tools are being used 