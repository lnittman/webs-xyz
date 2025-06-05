import { useEffect, useState, useCallback, useRef } from 'react';
import { mutate } from 'swr';
import { useWeb } from './queries';

export interface WorkflowStep {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'complete' | 'error';
  startTime?: number;
  result?: any;
  error?: string;
}

export interface WebUpdate {
  title?: string;
  emoji?: string;
  description?: string;
  topics?: string[];
  insights?: string[];
  progress?: number;
}

interface UseWebStreamOptions {
  onQuickMetadata?: (metadata: WebUpdate) => void;
  onStepComplete?: (step: WorkflowStep) => void;
  onWorkflowComplete?: (result: any) => void;
  onError?: (error: string) => void;
}

/**
 * Hook for monitoring web analysis workflow progress using Mastra streaming API
 */
export function useWebStream(webId: string | null, options: UseWebStreamOptions = {}) {
  const [steps, setSteps] = useState<WorkflowStep[]>([]);
  const [webUpdate, setWebUpdate] = useState<WebUpdate | null>(null);
  const [isStarted, setIsStarted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isWorkflowComplete, setIsWorkflowComplete] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const previousStatusRef = useRef<string | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Use the web query hook
  const { web, isLoading, mutate: mutateWeb } = useWeb(webId);
  
  // Track status changes and handle different states
  useEffect(() => {
    if (!web || !webId) return;
    
    // Check if status changed
    if (previousStatusRef.current !== web.status) {
      console.log('[WebStream] Status changed:', previousStatusRef.current, '->', web.status);
      previousStatusRef.current = web.status;
      
      // Handle status transitions
      if (web.status === 'PROCESSING' && !isWorkflowComplete) {
        // Automatically start streaming connection for PROCESSING webs
        setIsStarted(true);
        // Start streaming will be called in a separate effect
      } else if (web.status === 'COMPLETE') {
        setSteps(prev => prev.map(s => ({ ...s, status: 'complete' as const })));
        setIsWorkflowComplete(true);
        options.onWorkflowComplete?.(web);
        setIsStarted(false);
        // Close connection will be called in cleanup
      } else if (web.status === 'FAILED') {
        setSteps(prev => prev.map(s => ({ ...s, status: 'error' as const })));
        setError('Analysis failed');
        setIsWorkflowComplete(true);
        options.onError?.('Analysis failed');
        setIsStarted(false);
        // Close connection will be called in cleanup
      }
    }
  }, [web, webId, isWorkflowComplete, options]);
  
  // Start streaming connection to workflow
  const startStreaming = useCallback(async () => {
    if (!webId || abortControllerRef.current || isWorkflowComplete) return;
    
    console.log('[WebStream] Starting streaming connection for web:', webId);
    
    // Create an AbortController for the fetch request
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    
    try {
      // Use fetch to connect to the server's streaming endpoint
      const response = await fetch(`/api/webs/${webId}/stream`, {
        signal: abortController.signal,
        headers: {
          'Accept': 'text/event-stream',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }
      
      if (!response.body) {
        throw new Error('Response body is null');
      }

      setIsConnected(true);
      setError(null);
      
      // Use the streaming API to process the response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      
      // Process the stream chunk by chunk
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        // Decode the chunk and add it to the buffer
        buffer += decoder.decode(value, { stream: true });
        
        // Process complete messages in the buffer
        const messages = buffer.split('\n\n');
        buffer = messages.pop() || ''; // Keep the last incomplete message in the buffer
        
        for (const message of messages) {
          if (message.startsWith('data: ')) {
            try {
              const data = JSON.parse(message.slice(6)); // Remove 'data: ' prefix
              handleStreamEvent(data);
            } catch (error) {
              console.error('[WebStream] Error parsing event data:', error);
            }
          }
        }
      }
      
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('[WebStream] Streaming error:', error);
        setError('Connection error');
        setIsConnected(false);
        
        // Only retry if workflow is not complete and we're still in PROCESSING status
        if (!isWorkflowComplete && web?.status === 'PROCESSING') {
          reconnectTimeoutRef.current = setTimeout(() => {
            if (!isWorkflowComplete && web?.status === 'PROCESSING') {
              closeConnection();
              startStreaming();
            }
          }, 5000);
        }
      }
    }
  }, [webId, web?.status, isWorkflowComplete]);
  
  // Handle different types of stream events from Mastra
  const handleStreamEvent = useCallback((data: any) => {
    const { type, payload } = data;
    
    switch (type) {
      case 'start':
        console.log('[WebStream] Workflow started:', payload);
        setIsConnected(true);
        break;
        
      case 'step-start':
        console.log('[WebStream] Step started:', payload.id);
        // Add or update step in steps array
        setSteps(prev => {
          const existing = prev.find(s => s.id === payload.id);
          if (existing) {
            return prev.map(s => 
              s.id === payload.id 
                ? { ...s, status: 'running' as const, startTime: Date.now() }
                : s
            );
          } else {
            return [...prev, {
              id: payload.id,
              name: getStepDisplayName(payload.id),
              status: 'running' as const,
              startTime: Date.now(),
            }];
          }
        });
        break;
        
      case 'step-result':
        console.log('[WebStream] Step result:', payload.id, payload.status);
        
        // Update step status and result
        setSteps(prev => {
          return prev.map(s => 
            s.id === payload.id 
              ? { 
                  ...s, 
                  status: payload.status === 'success' ? 'complete' as const : 'error' as const,
                  result: payload.output,
                  error: payload.status === 'error' ? payload.error : undefined
                }
              : s
          );
        });
        
        // Handle quick metadata updates
        if (payload.id === 'quick-metadata' && payload.status === 'success' && payload.output) {
          const update = {
            title: payload.output.quickTitle,
            emoji: payload.output.quickEmoji,
            description: payload.output.quickDescription,
            topics: payload.output.suggestedTopics,
          };
          
          setWebUpdate(update);
          options.onQuickMetadata?.(update);
          
          // Refresh web data to get database updates
          mutateWeb();
        }
        
        // Notify step completion
        if (payload.status === 'success') {
          options.onStepComplete?.({
            id: payload.id,
            name: getStepDisplayName(payload.id),
            status: 'complete',
            result: payload.output,
          });
        }
        break;
        
      case 'step-finish':
        console.log('[WebStream] Step finished:', payload.id);
        break;
        
      case 'finish':
        console.log('[WebStream] Workflow completed');
        setIsWorkflowComplete(true);
        // Refresh web data to get final results
        mutateWeb();
        mutate('/api/webs'); // Also refresh the list
        // Close connection after completion
        setTimeout(() => closeConnection(), 100);
        break;
        
      case 'error':
        console.error('[WebStream] Stream error:', data.error || 'Unknown error');
        setError(data.error || 'Unknown error');
        options.onError?.(data.error || 'Unknown error');
        break;
        
      // Handle tool calls for more granular progress updates
      case 'tool-call':
      case 'tool-call-streaming-start':
        console.log('[WebStream] Tool call:', data.toolName);
        break;
        
      case 'tool-call-delta':
        // Could use this for more granular progress updates
        break;
        
      default:
        console.log('[WebStream] Unknown event type:', type);
    }
  }, [options, mutateWeb]);
  
  // Close streaming connection
  const closeConnection = useCallback(() => {
    if (abortControllerRef.current) {
      console.log('[WebStream] Closing stream connection');
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsConnected(false);
    }
    
    // Clear any pending reconnect
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      closeConnection();
    };
  }, [closeConnection]);
  
  // Start streaming when isStarted becomes true
  useEffect(() => {
    if (isStarted && !abortControllerRef.current) {
      startStreaming();
    }
  }, [isStarted, startStreaming]);
  
  // Helper function to get display names for steps
  function getStepDisplayName(stepId: string): string {
    const names: Record<string, string> = {
      'fetch': 'Fetching URLs',
      'metadata': 'Generating Metadata',
      'quick-metadata': 'Generating Metadata',
      'analysis': 'Analyzing Content',
      'mapper': 'Processing Results',
      'combine': 'Finalizing Analysis',
    };
    return names[stepId] || stepId;
  }
  
  // Calculate progress
  const totalSteps = steps.length || 5; // Expected steps
  const completedSteps = steps.filter(s => s.status === 'complete').length;
  const progress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;
  
  // Current running step
  const currentStep = steps.find(s => s.status === 'running');
  
  // Check if complete
  const isComplete = web?.status === 'COMPLETE';
  
  return {
    steps,
    currentStep,
    progress,
    isLoading: isLoading || (isStarted && !web),
    isComplete,
    isConnected,
    error,
    webUpdate,
    
    // Raw data for debugging
    web,
    isProcessing: web?.status === 'PROCESSING',
  };
} 