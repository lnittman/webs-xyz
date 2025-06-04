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
  status?: string;
}

interface UseWebStreamOptions {
  onQuickMetadata?: (metadata: WebUpdate) => void;
  onStepComplete?: (step: WorkflowStep) => void;
  onWorkflowComplete?: (result: any) => void;
  onError?: (error: string) => void;
  pollingInterval?: number;
}

/**
 * Hook for monitoring web analysis workflow progress using Server-Sent Events
 */
export function useWebStream(webId: string | null, options: UseWebStreamOptions = {}) {
  const [steps, setSteps] = useState<WorkflowStep[]>([]);
  const [webUpdate, setWebUpdate] = useState<WebUpdate | null>(null);
  const [isStarted, setIsStarted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isWorkflowComplete, setIsWorkflowComplete] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
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
        // Automatically start SSE connection for PROCESSING webs
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
  
  // Start SSE connection to workflow stream
  const startStreaming = useCallback(() => {
    if (!webId || eventSourceRef.current || isWorkflowComplete) return;
    
    console.log('[WebStream] Starting SSE connection for web:', webId);
    
    const eventSource = new EventSource(`/api/webs/${webId}/stream`);
    eventSourceRef.current = eventSource;
    
    eventSource.onopen = () => {
      console.log('[WebStream] SSE connection opened');
      setIsConnected(true);
      setError(null);
      // Clear any pending reconnect
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };
    
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('[WebStream] Received SSE event:', data);
        
        handleStreamEvent(data);
      } catch (error) {
        console.error('[WebStream] Error parsing SSE event:', error);
      }
    };
    
    eventSource.onerror = (error) => {
      console.error('[WebStream] SSE error:', error);
      setError('Connection error');
      setIsConnected(false);
      closeConnection();
      
      // Only retry if workflow is not complete and we're still in PROCESSING status
      if (!isWorkflowComplete && web?.status === 'PROCESSING') {
        reconnectTimeoutRef.current = setTimeout(() => {
          if (!isWorkflowComplete && web?.status === 'PROCESSING') {
            startStreaming();
          }
        }, 5000);
      }
    };
  }, [webId, web?.status, isWorkflowComplete]);
  
  // Handle different types of stream events
  const handleStreamEvent = useCallback((data: any) => {
    const { type } = data;
    
    switch (type) {
      case 'connected':
        console.log('[WebStream] Connected to workflow stream');
        setIsConnected(true);
        break;
        
      case 'step-progress':
        console.log('[WebStream] Step progress:', data.stepId, data.status);
        
        // Update steps array
        setSteps(prev => {
          const existing = prev.find(s => s.id === data.stepId);
          if (existing) {
            return prev.map(s => 
              s.id === data.stepId 
                ? { ...s, status: mapStepStatus(data.status), result: data.output }
                : s
            );
          } else {
            return [...prev, {
              id: data.stepId,
              name: getStepDisplayName(data.stepId),
              status: mapStepStatus(data.status),
              result: data.output,
              startTime: Date.now(),
            }];
          }
        });
        
        // Handle quick metadata updates
        if (data.stepId === 'metadata' && data.status === 'completed' && data.output) {
          const update = {
            title: data.output.quickTitle,
            emoji: data.output.quickEmoji,
            description: data.output.quickDescription,
            topics: data.output.suggestedTopics,
          };
          
          setWebUpdate(update);
          options.onQuickMetadata?.(update);
          
          // Refresh web data to get database updates
          mutateWeb();
        }
        
        // Notify step completion
        if (data.status === 'completed') {
          options.onStepComplete?.({
            id: data.stepId,
            name: getStepDisplayName(data.stepId),
            status: 'complete',
            result: data.output,
          });
        }
        break;
        
      case 'workflow-status':
        console.log('[WebStream] Workflow status:', data.status);
        break;
        
      case 'workflow-waiting':
        console.log('[WebStream] Workflow waiting:', data.message);
        // Don't set as complete, but close this connection and let it reconnect after a delay
        setTimeout(() => {
          closeConnection();
          if (!isWorkflowComplete && web?.status === 'PROCESSING') {
            setTimeout(() => startStreaming(), 3000); // Wait 3 seconds before reconnecting
          }
        }, 100);
        break;
        
      case 'workflow-complete':
        console.log('[WebStream] Workflow completed');
        setIsWorkflowComplete(true);
        // Refresh web data to get final results
        mutateWeb();
        mutate('/api/webs'); // Also refresh the list
        // Close connection after completion
        setTimeout(() => closeConnection(), 100);
        break;
        
      case 'workflow-failed':
        console.log('[WebStream] Workflow failed');
        setError('Workflow failed');
        setIsWorkflowComplete(true);
        options.onError?.('Workflow failed');
        // Close connection after failure
        setTimeout(() => closeConnection(), 100);
        break;
        
      case 'error':
        console.error('[WebStream] Stream error:', data.error);
        setError(data.error);
        options.onError?.(data.error);
        break;
        
      default:
        console.log('[WebStream] Unknown event type:', type);
    }
  }, [options, mutateWeb]);
  
  // Close SSE connection
  const closeConnection = useCallback(() => {
    if (eventSourceRef.current) {
      console.log('[WebStream] Closing SSE connection');
      eventSourceRef.current.close();
      eventSourceRef.current = null;
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
    if (isStarted && !eventSourceRef.current) {
      startStreaming();
    }
  }, [isStarted, startStreaming]);
  
  // Start analysis function
  const startAnalysis = useCallback(async () => {
    if (!webId || isStarted) return;
    
    console.log('[WebStream] Starting analysis for web:', webId);
    setIsStarted(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/webs/${webId}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to start analysis');
      }
      
      const result = await response.json();
      console.log('[WebStream] Analysis response:', result);
      
      // Force immediate refresh to get the PROCESSING status
      mutateWeb();
    } catch (err) {
      console.error('[WebStream] Failed to start analysis:', err);
      setError(err instanceof Error ? err.message : 'Failed to start analysis');
      options.onError?.(err instanceof Error ? err.message : 'Failed to start analysis');
      setIsStarted(false);
    }
  }, [webId, isStarted, mutateWeb, options]);
  
  // Helper functions
  function mapStepStatus(status: string): WorkflowStep['status'] {
    switch (status) {
      case 'running': return 'running';
      case 'completed': return 'complete';
      case 'complete': return 'complete';
      case 'failed': return 'error';
      default: return 'pending';
    }
  }
  
  function getStepDisplayName(stepId: string): string {
    const names: Record<string, string> = {
      'fetch': 'Fetching URLs',
      'metadata': 'Generating Metadata',
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
    // Stream control
    startAnalysis: webId && web?.status !== 'PROCESSING' ? startAnalysis : undefined,
    
    // State
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