# Mastra Webhook

## Overview

The Mastra webhook endpoint receives notifications when Mastra workflows complete execution. It uses a dedicated web service layer to handle database operations.

## Endpoint

`POST /webhooks/mastra`

## Request Format

```json
{
  "workflowName": "analyzeWeb",
  "result": {
    "title": "Example Website",
    "description": "Analysis of the website",
    "topics": ["technology", "web development"],
    "sentiment": "positive",
    "confidence": 0.95,
    "readingTime": 5,
    "insights": ["Key insight 1", "Key insight 2"],
    "relatedUrls": ["https://related.example.com"],
    "entities": [
      {
        "type": "organization",
        "value": "Example Corp"
      }
    ]
  },
  "metadata": {
    "webId": "web_123456"
  }
}
```

## Response

### Success (200 OK)
```json
{
  "success": true,
  "message": "Web analysis completed successfully"
}
```

### Error Responses

#### Missing webId (400 Bad Request)
```json
{
  "error": "Missing webId in metadata"
}
```

#### Unknown workflow (400 Bad Request)
```json
{
  "error": "Unknown workflow type"
}
```

#### Server error (500 Internal Server Error)
```json
{
  "error": "Internal server error"
}
```

## Supported Workflows

### analyzeWeb
Updates a web analysis record with the results from the Mastra workflow execution.

Required metadata:
- `webId`: The ID of the web record to update

The webhook will:
1. Update the web record status to 'COMPLETE'
2. Store all analysis results including title, description, topics, sentiment, etc.
3. Create associated entity records
4. Mark the record as 'FAILED' if any errors occur during processing

## Architecture

The webhook uses a service layer (`lib/services/webs.ts`) to handle database operations:
- `updateWebWithAnalysis()` - Updates web record with analysis results
- `markWebAsFailed()` - Marks web record as failed
- `getWebById()` - Retrieves web record by ID

This separation allows for better testing and maintainability. 