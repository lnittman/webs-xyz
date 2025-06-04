# Mastra Services

This directory contains service classes for interacting with the Mastra AI platform.

## Services

### MastraWorkflowService

Handles all workflow-related operations:

- `triggerAnalyzeWeb(data)` - Triggers the analyzeWeb workflow
- `getWorkflowStatus(workflowId, runId)` - Gets the status of a workflow run
- `getWorkflowResult(workflowId, runId)` - Gets the final result of a completed workflow
- `streamWorkflowExecution(workflowId, runId)` - Streams workflow execution events

### MastraAgentService

Handles all agent-related operations:

- `sendMessage(agentId, messages)` - Sends a message to an agent and gets a response
- `streamMessage(agentId, messages)` - Streams a conversation with an agent
- `getAgent(agentId)` - Gets information about a specific agent
- `listAgents()` - Lists all available agents

## Usage

```typescript
import { mastraWorkflowService, mastraAgentService } from '@repo/api';

// Trigger a workflow
const runId = await mastraWorkflowService.triggerAnalyzeWeb({
  urls: ['https://example.com'],
  prompt: 'Analyze this website',
  webId: 'web-123'
});

// Send a message to an agent
const response = await mastraAgentService.sendMessage('chat', [
  { role: 'user', content: 'Hello!' }
]);
```

## Architecture

These services abstract the Mastra API interactions and provide a clean interface for the rest of the application. They handle:

- HTTP requests to the Mastra AI service
- Error handling and logging
- Type safety with TypeScript interfaces
- Streaming support for real-time updates

The services are singleton instances that can be imported and used throughout the application. 