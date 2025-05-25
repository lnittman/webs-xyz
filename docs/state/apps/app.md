# App State Documentation

## Overview

The `app` is the main frontend interface for Webs - an AI-native internet interface that processes URLs with optional prompts. Users interact with a terminal-inspired command interface to submit URLs and browse their collection of processed "webs".

## Core Concepts

### Webs
A "web" represents a URL that has been submitted for AI processing. Each web contains:
- **URL**: The target website to process
- **Domain**: Extracted domain for organization (e.g., "github.com")
- **Title**: Page title (extracted or AI-generated)
- **Description**: AI-generated summary or meta description
- **Prompt**: Optional user instructions for processing
- **Status**: Processing state (PENDING → PROCESSING → COMPLETE/FAILED)
- **Messages**: Processing logs and AI responses

### Interface Modes
- **Grid View**: Card-based layout showing webs as tiles
- **List View**: Compact row-based layout similar to Reddit/HN

## State Management

### Global State (Jotai)
```typescript
// Chat/prompt focus state
const promptFocusedAtom = atom(false);
```

### Data Fetching (SWR)
```typescript
// Fetch all webs for a workspace
const { webs, isLoading, error } = useWebs(workspaceId);

// Fetch individual web
const { web, isLoading, error } = useWeb(webId);
```

### Mutations
```typescript
// Create new web
const { createWeb, isLoading } = useCreateWeb();
await createWeb({ workspaceId, url, prompt });

// Update existing web
const { updateWeb } = useUpdateWeb();
await updateWeb(webId, { status: 'COMPLETE' });
```

## User Flows

### 1. Submit URL for Processing
1. User enters URL in command interface
2. Optional: Add text prompt after URL
3. System extracts URL and prompt
4. Creates new web with PENDING status
5. Triggers AI processing pipeline

### 2. Browse Webs Dashboard
1. View all processed webs in grid/list
2. Filter by domain or status
3. Click web to view details
4. Real-time status updates via polling

### 3. Web Detail View
1. Display web metadata and AI summary
2. Show processing messages/logs
3. View raw data for debugging
4. Link to original URL

## API Integration

### Endpoints
- `GET /api/webs` - List webs for workspace
- `POST /api/webs` - Create new web
- `GET /api/webs/[id]` - Get web details
- `PATCH /api/webs/[id]` - Update web

### Data Flow
```
User Input → Command Parser → API Call → Database → AI Processing → Status Updates
```

## UI Components

### Core Components
- **PromptBar**: URL/command input interface
- **WebCard**: Grid view web display
- **WebListItem**: List view web display
- **WebDetail**: Full web information page

### Design System
- Terminal-inspired aesthetic with Sacred CSS influence
- Monospace fonts and grid-based layouts
- Status indicators with color coding
- Minimal, functional interface design

## Performance Considerations

- SWR caching for web data
- Polling for real-time status updates
- Lazy loading for large web collections
- Optimistic updates for better UX 