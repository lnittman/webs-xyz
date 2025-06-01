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
 * Hook for monitoring web analysis workflow progress
 * Uses polling to check for updates from webhook processing
 */
export function useWebStream(webId: string | null, options: UseWebStreamOptions = {}) {
  const [steps, setSteps] = useState<WorkflowStep[]>([]);
  const [webUpdate, setWebUpdate] = useState<WebUpdate | null>(null);
  const [isStarted, setIsStarted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const previousStatusRef = useRef<string | null>(null);
  const previousDataRef = useRef<any>(null);
  
  // Use the web query hook with appropriate polling interval
  const { web, isLoading, mutate: mutateWeb } = useWeb(webId);
  
  // Track status changes and extract updates
  useEffect(() => {
    if (!web || !isStarted) return;
    
    // Check if status changed
    if (previousStatusRef.current !== web.status) {
      console.log('[WebStream] Status changed:', previousStatusRef.current, '->', web.status);
      previousStatusRef.current = web.status;
      
      // Handle status transitions
      if (web.status === 'PROCESSING') {
        setSteps([{
          id: 'analyze-web',
          name: 'Analyzing Web Content',
          status: 'running',
          startTime: Date.now()
        }]);
      } else if (web.status === 'COMPLETE') {
        setSteps(prev => prev.map(s => ({ ...s, status: 'complete' as const })));
        options.onWorkflowComplete?.(web);
        setIsStarted(false); // Stop polling
      } else if (web.status === 'FAILED') {
        setSteps(prev => prev.map(s => ({ ...s, status: 'error' as const })));
        setError('Analysis failed');
        options.onError?.('Analysis failed');
        setIsStarted(false); // Stop polling
      }
    }
    
    // Check for data updates (quick metadata)
    if (web.title || web.emoji || web.description) {
      const hasNewData = 
        previousDataRef.current?.title !== web.title ||
        previousDataRef.current?.emoji !== web.emoji ||
        previousDataRef.current?.description !== web.description;
      
      if (hasNewData) {
        console.log('[WebStream] New metadata detected');
        const update = {
          title: web.title || undefined,
          emoji: web.emoji || undefined,
          description: web.description || undefined,
          topics: web.topics || undefined,
        };
        
        setWebUpdate(update);
        options.onQuickMetadata?.(update);
        
        previousDataRef.current = {
          title: web.title,
          emoji: web.emoji,
          description: web.description,
        };
      }
    }
  }, [web, isStarted, options]);
  
  // Auto-refresh while processing
  useEffect(() => {
    if (!webId || !isStarted || web?.status !== 'PROCESSING') return;
    
    const interval = setInterval(() => {
      console.log('[WebStream] Polling for updates...');
      mutateWeb();
      mutate('/api/webs'); // Also refresh the list
    }, options.pollingInterval || 2000); // Poll every 2 seconds by default
    
    return () => clearInterval(interval);
  }, [webId, isStarted, web?.status, mutateWeb, options.pollingInterval]);
  
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
        const error = await response.json();
        throw new Error(error.message || 'Failed to start analysis');
      }
      
      const result = await response.json();
      console.log('[WebStream] Analysis started:', result);
      
      // Force immediate refresh
      mutateWeb();
    } catch (err) {
      console.error('[WebStream] Failed to start analysis:', err);
      setError(err instanceof Error ? err.message : 'Failed to start analysis');
      options.onError?.(err instanceof Error ? err.message : 'Failed to start analysis');
      setIsStarted(false);
    }
  }, [webId, isStarted, mutateWeb, options]);
  
  // Calculate progress
  const totalSteps = 1; // Simplified for webhook approach
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
    error,
    webUpdate,
    
    // Raw data for debugging
    web,
    isProcessing: web?.status === 'PROCESSING',
  };
} 