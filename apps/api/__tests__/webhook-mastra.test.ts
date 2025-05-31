import { expect, test, vi } from 'vitest';

const mockUpdateWebWithAnalysis = vi.fn();
const mockMarkWebAsFailed = vi.fn();

vi.mock('../lib/services', () => ({
  updateWebWithAnalysis: mockUpdateWebWithAnalysis,
  markWebAsFailed: mockMarkWebAsFailed,
}));

const mockLog = {
  info: vi.fn(),
  error: vi.fn(),
  warn: vi.fn()
};

vi.mock('@repo/observability/log', () => ({
  log: mockLog
}));

import { POST } from '../app/webhooks/mastra/route';

const buildRequest = (body: any) => 
  new Request('http://example.com/webhooks/mastra', { 
    method: 'POST', 
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' }
  });

test('mastra webhook handles analyzeWeb completion successfully', async () => {
  const analysisResult = {
    title: 'Test Website',
    description: 'Test description',
    topics: ['technology'],
    sentiment: 'positive',
    confidence: 0.95,
    readingTime: 5,
    insights: ['Test insight'],
    relatedUrls: ['https://related.example.com'],
    entities: [{ type: 'organization', value: 'Test Corp' }]
  };

  const requestBody = {
    workflowName: 'analyzeWeb',
    result: analysisResult,
    metadata: { webId: 'web_123' }
  };

  mockUpdateWebWithAnalysis.mockResolvedValueOnce({ id: 'web_123' });

  const response = await POST(buildRequest(requestBody));
  
  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({
    success: true,
    message: 'Web analysis completed successfully'
  });

  expect(mockUpdateWebWithAnalysis).toHaveBeenCalledWith('web_123', analysisResult);

  expect(mockLog.info).toHaveBeenCalledWith('Mastra webhook received', {
    workflowName: 'analyzeWeb',
    metadata: { webId: 'web_123' }
  });
});

test('mastra webhook returns 400 for missing webId', async () => {
  const requestBody = {
    workflowName: 'analyzeWeb',
    result: {},
    metadata: {} // Missing webId
  };

  const response = await POST(buildRequest(requestBody));
  
  expect(response.status).toBe(400);
  expect(await response.json()).toEqual({
    error: 'Missing webId in metadata'
  });
});

test('mastra webhook returns 400 for unknown workflow', async () => {
  const requestBody = {
    workflowName: 'unknownWorkflow',
    result: {},
    metadata: { webId: 'web_123' }
  };

  const response = await POST(buildRequest(requestBody));
  
  expect(response.status).toBe(400);
  expect(await response.json()).toEqual({
    error: 'Unknown workflow type'
  });

  expect(mockLog.warn).toHaveBeenCalledWith('Unknown workflow received', {
    workflowName: 'unknownWorkflow'
  });
});

test('mastra webhook handles database errors gracefully', async () => {
  const requestBody = {
    workflowName: 'analyzeWeb',
    result: { title: 'Test' },
    metadata: { webId: 'web_123' }
  };

  // First call fails, second call (marking as failed) succeeds
  mockUpdateWebWithAnalysis
    .mockRejectedValueOnce(new Error('Database error'));
  mockMarkWebAsFailed
    .mockResolvedValueOnce({ id: 'web_123' });

  const response = await POST(buildRequest(requestBody));
  
  expect(response.status).toBe(500);
  expect(await response.json()).toEqual({
    error: 'Internal server error'
  });

  // Should have tried to mark as failed
  expect(mockMarkWebAsFailed).toHaveBeenCalledWith('web_123');
}); 