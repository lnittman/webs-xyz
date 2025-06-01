# AI SDK UI Implementation for Webs App

This document outlines how to apply the Vercel AI SDK UI concepts specifically to the webs application for achieving the "Cursor for the Internet" vision.

## Current Implementation Status

### ✅ What's Already Built

1. **Enhanced Workflow Structure** (`apps/ai/src/mastra/workflows/analyze-web.ts`)
   - Multi-step workflow with parallel URL fetching
   - Quick metadata generation for fast UI feedback
   - Enhanced analysis with cross-URL insights
   - But NOT aligned with AI SDK streaming protocols

2. **Basic Chat Component** (`apps/app/src/components/shared/web-chat.tsx`)
   - UI structure in place
   - Placeholder integration with chat agent
   - Ready for AI SDK useChat integration

3. **Custom Streaming** (`apps/app/src/app/api/webs/[id]/stream/route.ts`)
   - Server-Sent Events implementation
   - Database polling mechanism
   - NOT using AI SDK data stream protocol

4. **Agents & Tools** (`apps/ai/src/mastra/agents/`)
   - `websAgent`: For web analysis with Jina scraping
   - `chatAgent`: For conversational interface
   - Basic tool structure in place

## Implementation Plan

### Phase 1: Stream Protocol Alignment

#### 1.1 Create Stream Adapter
```typescript
// apps/ai/src/mastra/utils/stream-adapter.ts
import { DataStreamWriter } from 'ai';
import type { Workflow } from '@mastra/core/workflows';

export async function streamAnalyzeWebWorkflow(
  workflow: Workflow,
  runId: string,
  dataStream: DataStreamWriter,
  webId: string
) {
  workflow.watch({ runId }, (record) => {
    const { activePaths, results } = record;
    
    // Stream quick metadata immediately when available
    if (results['generate-quick-metadata']?.status === 'success') {
      const quickData = results['generate-quick-metadata'].output;
      dataStream.writeData([{
        type: 'quick-metadata',
        webId,
        title: quickData.quickTitle,
        emoji: quickData.quickEmoji,
        description: quickData.quickDescription,
      }]);
    }
    
    // Stream individual URL analyses
    if (results['detailed-analysis']?.status === 'success') {
      const analyses = results['detailed-analysis'].output.urlAnalyses;
      dataStream.writeData([{
        type: 'url-analyses',
        webId,
        analyses: analyses.map(a => ({
          url: a.url,
          title: a.title,
          topics: a.topics,
          insights: a.insights.slice(0, 3),
        })),
      }]);
    }
    
    // Stream final enhanced results
    if (results['final-assembly']?.status === 'success') {
      dataStream.writeData([{
        type: 'analysis-complete',
        webId,
        result: results['final-assembly'].output,
      }]);
    }
  });
}
```

#### 1.2 Update API Routes
```typescript
// apps/app/src/app/api/webs/[id]/analyze/route.ts
import { createDataStreamResponse } from 'ai';
import { mastra } from '@/lib/mastra';
import { streamAnalyzeWebWorkflow } from '@ai/mastra/utils/stream-adapter';

export async function POST(request: Request, { params }) {
  const { id: webId } = await params;
  const { urls, prompt } = await request.json();
  
  return createDataStreamResponse({
    execute: async (dataStream) => {
      // Initial status
      dataStream.writeMessageAnnotation({
        webId,
        status: 'starting',
        urls,
      });
      
      // Get workflow and create run
      const workflow = mastra.getWorkflow('analyzeWeb');
      const { runId } = await workflow.createRun();
      
      // Set up streaming
      await streamAnalyzeWebWorkflow(workflow, runId, dataStream, webId);
      
      // Start workflow
      workflow.start({
        runId,
        triggerData: { urls, prompt },
      });
    },
  });
}
```

### Phase 2: Chat Integration with useChat

#### 2.1 Create Chat API Route
```typescript
// apps/app/src/app/api/webs/[id]/chat/route.ts
import { streamText } from 'ai';
import { mastra } from '@/lib/mastra';
import { database } from '@repo/database';

export async function POST(req: Request, { params }) {
  const { id: webId } = await params;
  const { messages } = await req.json();
  
  // Get web context
  const web = await database.web.findUnique({
    where: { id: webId },
    include: { entities: true },
  });
  
  // Get chat agent
  const chatAgent = mastra.getAgent('chat');
  
  const result = streamText({
    model: chatAgent.model,
    messages,
    system: `${chatAgent.instructions}
    
    Web Context:
    - Title: ${web.title}
    - URLs: ${web.urls.join(', ')}
    - Topics: ${web.topics.join(', ')}
    - Key Insights: ${web.insights.slice(0, 5).join('; ')}
    
    You can help users explore this web analysis, find connections, 
    and discover deeper insights.`,
    tools: {
      deepDiveUrl: {
        description: 'Analyze a specific aspect of a URL in detail',
        parameters: z.object({
          url: z.string().url(),
          aspect: z.string(),
        }),
        execute: async ({ url, aspect }) => {
          const result = await mastra.run('deepDiveUrl', { url, aspect, webId });
          return result;
        },
      },
      findConnections: {
        description: 'Find connections between URLs',
        parameters: z.object({
          urls: z.array(z.string().url()).min(2),
          connectionType: z.enum(['content', 'topics', 'entities']),
        }),
      },
      addRelatedUrl: {
        description: 'Add a related URL to the analysis',
        parameters: z.object({
          url: z.string().url(),
          reason: z.string(),
        }),
      },
    },
    maxSteps: 5,
    toolCallStreaming: true,
  });
  
  return result.toDataStreamResponse();
}
```

#### 2.2 Update Chat Component
```typescript
// apps/app/src/components/shared/web-chat.tsx
import { useChat } from 'ai/react';
import { ToolCallIndicator } from './tool-call-indicator';
import { DeepDiveCard } from './generative-ui/deep-dive-card';
import { ConnectionsGraph } from './generative-ui/connections-graph';

export function WebChat({ web }: { web: Web }) {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    addToolResult,
  } = useChat({
    id: web.id,
    api: `/api/webs/${web.id}/chat`,
    body: {
      webId: web.id,
    },
    maxSteps: 5,
    sendExtraMessageFields: true,
    onToolCall: async ({ toolCall }) => {
      // Handle client-side tool execution
      if (toolCall.toolName === 'addRelatedUrl') {
        const confirmed = await confirmAddUrl(toolCall.args);
        if (confirmed) {
          await addUrlToWeb(web.id, toolCall.args.url);
          return { success: true, added: toolCall.args.url };
        }
        return { success: false, reason: 'User declined' };
      }
    },
  });
  
  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 p-4">
        {messages.map((message) => (
          <div key={message.id} className="mb-4">
            {message.role === 'user' ? (
              <UserMessage>{message.content}</UserMessage>
            ) : (
              <AssistantMessage>
                {/* Render text content */}
                {message.content}
                
                {/* Render tool invocations */}
                {message.toolInvocations?.map((invocation) => (
                  <div key={invocation.toolCallId} className="mt-2">
                    <ToolCallIndicator
                      toolName={invocation.toolName}
                      args={invocation.args}
                      state={invocation.state}
                    />
                    
                    {invocation.state === 'result' && (
                      <>
                        {invocation.toolName === 'deepDiveUrl' && (
                          <DeepDiveCard
                            url={invocation.args.url}
                            aspect={invocation.args.aspect}
                            result={invocation.result}
                          />
                        )}
                        
                        {invocation.toolName === 'findConnections' && (
                          <ConnectionsGraph
                            connections={invocation.result}
                            urls={invocation.args.urls}
                          />
                        )}
                      </>
                    )}
                  </div>
                ))}
              </AssistantMessage>
            )}
          </div>
        ))}
      </ScrollArea>
      
      <ChatInput
        value={input}
        onChange={handleInputChange}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        placeholder="Ask about the analysis..."
      />
    </div>
  );
}
```

### Phase 3: Generative UI Components

#### 3.1 Deep Dive Card
```typescript
// apps/app/src/components/generative-ui/deep-dive-card.tsx
export function DeepDiveCard({ url, aspect, result }) {
  return (
    <Card className="mt-3">
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Search className="h-4 w-4" />
          Deep Dive: {aspect}
        </CardTitle>
        <CardDescription>{new URL(url).hostname}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {result.findings.map((finding, i) => (
            <div key={i} className="flex gap-2">
              <Badge variant="outline" className="mt-0.5">
                {i + 1}
              </Badge>
              <p className="text-sm">{finding}</p>
            </div>
          ))}
        </div>
        
        {result.relevantQuotes && (
          <div className="mt-4 space-y-2">
            {result.relevantQuotes.map((quote, i) => (
              <blockquote key={i} className="border-l-2 pl-3 text-sm italic">
                "{quote}"
              </blockquote>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

#### 3.2 Connections Visualization
```typescript
// apps/app/src/components/generative-ui/connections-graph.tsx
import { ForceGraph2D } from 'react-force-graph';

export function ConnectionsGraph({ connections, urls }) {
  const graphData = {
    nodes: urls.map(url => ({
      id: url,
      name: new URL(url).hostname,
      group: 1,
    })),
    links: connections.connections.map(conn => ({
      source: conn.between[0],
      target: conn.between[1],
      value: conn.strength,
      label: conn.evidence[0],
    })),
  };
  
  return (
    <Card className="mt-3">
      <CardHeader>
        <CardTitle className="text-sm">URL Connections</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ForceGraph2D
            graphData={graphData}
            nodeLabel="name"
            linkLabel="label"
            linkWidth={link => link.value * 5}
            nodeCanvasObject={(node, ctx, globalScale) => {
              const label = node.name;
              const fontSize = 12/globalScale;
              ctx.font = `${fontSize}px Sans-Serif`;
              ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
              ctx.fillText(label, node.x, node.y);
            }}
          />
        </div>
        
        <div className="mt-4 space-y-2">
          {connections.connections.map((conn, i) => (
            <div key={i} className="text-sm">
              <strong>Connection {i + 1}:</strong> {conn.evidence.join(', ')}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
```

### Phase 4: Domain-Specific Tools

#### 4.1 Web Management Tools
```typescript
// apps/ai/src/mastra/tools/web-tools.ts
import { createTool } from '@mastra/core';
import { database } from '@repo/database';

export const extractKeyEntity = createTool({
  id: 'extract-key-entity',
  description: 'Extract and save a key entity from the web analysis',
  inputSchema: z.object({
    webId: z.string(),
    entityType: z.enum(['person', 'organization', 'product', 'concept']),
    value: z.string(),
    context: z.string(),
    importance: z.enum(['high', 'medium', 'low']),
  }),
  execute: async ({ webId, entityType, value, context }) => {
    const entity = await database.webEntity.create({
      data: {
        webId,
        type: entityType,
        value,
      },
    });
    
    // Also create a relationship graph entry
    await createEntityRelationship(entity.id, context);
    
    return {
      entity: {
        id: entity.id,
        type: entityType,
        value,
      },
      relatedEntities: await findRelatedEntities(value, webId),
    };
  },
});

export const generateWebSummary = createTool({
  id: 'generate-web-summary',
  description: 'Generate a custom summary based on specific criteria',
  inputSchema: z.object({
    webId: z.string(),
    focusAreas: z.array(z.string()),
    summaryType: z.enum(['executive', 'technical', 'creative']),
    maxLength: z.number().optional(),
  }),
  execute: async ({ webId, focusAreas, summaryType }) => {
    const web = await database.web.findUnique({
      where: { id: webId },
      include: { entities: true },
    });
    
    // Generate focused summary using AI
    const summary = await generateFocusedSummary(web, focusAreas, summaryType);
    
    return {
      summary: summary.text,
      keyPoints: summary.keyPoints,
      recommendations: summary.recommendations,
    };
  },
});
```

#### 4.2 Workflow Trigger Tools
```typescript
// apps/ai/src/mastra/tools/workflow-triggers.ts
export const triggerComparativeAnalysis = createTool({
  id: 'trigger-comparative-analysis',
  description: 'Run comparative analysis between multiple webs',
  inputSchema: z.object({
    webIds: z.array(z.string()).min(2).max(5),
    comparisonCriteria: z.array(z.string()),
    outputFormat: z.enum(['report', 'chart', 'timeline']),
  }),
  execute: async ({ webIds, comparisonCriteria, outputFormat }) => {
    // Create comparison workflow run
    const workflow = mastra.getWorkflow('compareWebs');
    const { runId } = await workflow.createRun();
    
    // Start workflow
    const result = await workflow.startAsync({
      runId,
      triggerData: {
        webIds,
        criteria: comparisonCriteria,
        format: outputFormat,
      },
    });
    
    return {
      runId,
      status: 'started',
      estimatedCompletion: Date.now() + 30000,
      previewUrl: `/analysis/compare/${runId}`,
    };
  },
});
```

### Phase 5: Real-time Workflow Visualization

#### 5.1 Workflow Progress Component
```typescript
// apps/app/src/components/workflow-visualizer.tsx
import { useWebAnalysis } from '@/hooks/use-web-analysis';
import { WorkflowStep } from './workflow-step';

export function WorkflowVisualizer({ webId }: { webId: string }) {
  const { analysisData, isAnalyzing } = useWebAnalysis(webId);
  const [steps, setSteps] = useState<StepProgress[]>([]);
  
  useEffect(() => {
    if (!analysisData) return;
    
    analysisData.forEach((event) => {
      switch (event.type) {
        case 'workflow-step-start':
          setSteps(prev => [...prev, {
            id: event.stepId,
            name: formatStepName(event.stepId),
            status: 'running',
            startTime: Date.now(),
          }]);
          break;
          
        case 'workflow-step-complete':
          setSteps(prev => prev.map(step =>
            step.id === event.stepId
              ? { ...step, status: 'complete', result: event.result }
              : step
          ));
          break;
          
        case 'quick-metadata':
          // Update UI immediately with quick results
          updateWebQuickData(webId, event);
          break;
      }
    });
  }, [analysisData]);
  
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-4">
        <div className={cn(
          "h-2 w-2 rounded-full animate-pulse",
          isAnalyzing ? "bg-blue-500" : "bg-green-500"
        )} />
        <span className="text-sm font-medium">
          {isAnalyzing ? 'Analyzing...' : 'Analysis Complete'}
        </span>
      </div>
      
      <AnimatePresence>
        {steps.map((step, index) => (
          <WorkflowStep
            key={step.id}
            step={step}
            index={index}
            isLast={index === steps.length - 1}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
```

## Next Steps & Improvements

### 1. Enhanced Tool Ecosystem
- Create tools for browser automation (open tabs, navigate)
- Implement collaborative browsing tools
- Add tools for creating web collections/boards

### 2. Advanced Generative UI
- Rich preview cards for URLs
- Interactive entity relationship graphs
- Timeline visualizations for content changes
- Comparison matrices for multiple URLs

### 3. Workflow Enhancements
- Add branching logic based on content type
- Implement conditional analysis depth
- Create specialized workflows for different domains
- Add real-time collaboration features

### 4. Performance Optimizations
- Implement result caching for repeated analyses
- Add incremental updates for long-running workflows
- Use WebSocket for bidirectional streaming
- Optimize for mobile and low-bandwidth scenarios

### 5. AI-Native Features
- Proactive suggestions based on browsing patterns
- Automatic related content discovery
- Smart summarization with user preferences
- Cross-web knowledge graph building

## Key Integration Points

1. **Mastra Workflow → AI SDK Stream**: Use `createDataStreamResponse` with custom adapter
2. **Chat Agent → useChat Hook**: Full tool support with generative UI
3. **Tools → Database Entities**: Domain-specific operations on Prisma models
4. **Workflow Steps → UI Updates**: Real-time progress visualization
5. **Client Tools → Browser Actions**: Deep integration with browsing experience

This implementation creates a truly AI-native browsing experience where users can:
- Get instant insights as they browse
- Have conversations about web content
- See AI reasoning through tool usage
- Interact with generated UI components
- Build their personal web knowledge graph 