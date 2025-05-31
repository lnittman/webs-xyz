import { useEffect, useRef, useState } from 'react';
import type { Web } from '@/types/web';

interface StreamEvent {
  type: 'status' | 'update' | 'complete' | 'error';
  status?: string;
  web?: Partial<Web>;
  error?: string;
  timestamp: string;
}

interface UseWebStreamOptions {
  onUpdate?: (web: Partial<Web>) => void;
  onComplete?: (status: string) => void;
  onError?: (error: string) => void;
}

export function useWebStream(webId: string | null, options: UseWebStreamOptions = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<StreamEvent | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!webId) return;

    // Create EventSource for streaming
    const eventSource = new EventSource(`/api/webs/${webId}/stream`);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      console.log('[WebStream] Connected to workflow stream');
      setIsConnected(true);
    };

    eventSource.onmessage = (event) => {
      try {
        const data: StreamEvent = JSON.parse(event.data);
        setLastEvent(data);

        console.log('[WebStream] Received event:', data);

        switch (data.type) {
          case 'update':
            if (data.web && options.onUpdate) {
              options.onUpdate(data.web);
            }
            break;
          case 'complete':
            if (data.status && options.onComplete) {
              options.onComplete(data.status);
            }
            // Close connection on completion
            eventSource.close();
            setIsConnected(false);
            break;
          case 'error':
            if (data.error && options.onError) {
              options.onError(data.error);
            }
            eventSource.close();
            setIsConnected(false);
            break;
        }
      } catch (error) {
        console.error('[WebStream] Failed to parse event data:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('[WebStream] EventSource error:', error);
      setIsConnected(false);
      if (options.onError) {
        options.onError('Connection error');
      }
    };

    // Cleanup on unmount
    return () => {
      eventSource.close();
      setIsConnected(false);
    };
  }, [webId, options.onUpdate, options.onComplete, options.onError]);

  const disconnect = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      setIsConnected(false);
    }
  };

  return {
    isConnected,
    lastEvent,
    disconnect,
  };
}

// Hook for streaming workflow progress with automatic UI updates
export function useWebStreamWithUpdates(webId: string | null) {
  const [webUpdate, setWebUpdate] = useState<Partial<Web> | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { isConnected } = useWebStream(webId, {
    onUpdate: (web) => {
      setWebUpdate(web);
    },
    onComplete: (status) => {
      setIsComplete(true);
      console.log('[WebStream] Workflow completed with status:', status);
    },
    onError: (err) => {
      setError(err);
      console.error('[WebStream] Stream error:', err);
    },
  });

  return {
    isConnected,
    webUpdate,
    isComplete,
    error,
    clearUpdate: () => setWebUpdate(null),
    clearError: () => setError(null),
  };
} 