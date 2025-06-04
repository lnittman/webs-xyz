import { useState, useEffect } from 'react';

import { mutate } from 'swr';

import { updateWebEmoji } from '@/app/actions/webs';
import type { CreateWebInput, Web } from '@/types/web';

import { useWebStream } from './use-web-stream';

export function useCreateWeb() {
  const createWeb = async (input: CreateWebInput): Promise<Web> => {
    console.log('[useCreateWeb] Creating web with input:', input);
    
    const response = await fetch('/api/webs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create web');
    }

    const web = await response.json();

    console.log('[useCreateWeb] Web created:', web);
    
    // Revalidate the webs list
    mutate('/api/webs');
    
    return web;
  };

  return {
    createWeb,
    trigger: createWeb, // Alias for compatibility
  };
}

/**
 * Hook that creates a web and automatically streams analysis progress
 * This is the recommended hook for UI components that need real-time updates
 */
export function useCreateAndStreamWeb() {
  const [web, setWeb] = useState<Web | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  
  // Use the streaming hook for the created web
  const streamState = useWebStream(web?.id || null, {
    onQuickMetadata: (metadata) => {
      console.log('[CreateAndStream] Quick metadata received:', metadata);
    },
    onWorkflowComplete: (result) => {
      console.log('[CreateAndStream] Workflow complete:', result);
    },
    onError: (error) => {
      console.error('[CreateAndStream] Stream error:', error);
    }
  });

  // Auto-start analysis when web is created
  useEffect(() => {
    if (web?.id && streamState.startAnalysis && !streamState.isLoading) {
      console.log('[CreateAndStream] Starting analysis for web:', web.id);
      streamState.startAnalysis();
    }
  }, [web?.id, streamState.startAnalysis, streamState.isLoading]);

  const createWeb = async (input: CreateWebInput): Promise<Web> => {
    setIsCreating(true);
    setCreateError(null);

    try {
      const response = await fetch('/api/webs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create web');
      }

      const newWeb = await response.json();
      setWeb(newWeb);
      
      // Revalidate the webs list
      mutate('/api/webs');
      
      return newWeb;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create web';
      setCreateError(errorMessage);
      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  return {
    // Creation
    createWeb,
    isCreating,
    createError,
    
    // Streaming
    ...streamState
  };
}

export function useRetryWeb() {
  const retryWeb = async (webId: string): Promise<Web> => {
    const response = await fetch(`/api/webs/${webId}/retry`, {
      method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to retry web analysis');
      }

    const data = await response.json();
      
    // Revalidate the webs list
    mutate('/api/webs');
      
    return data;
  };

  return {
    retryWeb,
    trigger: retryWeb, // Alias for compatibility
  };
}

export function useUpdateWebEmoji() {
  const updateEmoji = async (webId: string, emoji: string): Promise<{ id: string; emoji: string; updatedAt: string }> => {
    const result = await updateWebEmoji({ webId, emoji });
    
    if ('error' in result) {
      throw new Error(result.error);
    }
    
    // Revalidate the webs list to update the UI
    mutate('/api/webs');
    
    return result.data;
  };

  return {
    updateEmoji,
    trigger: updateEmoji, // Alias for compatibility
  };
} 