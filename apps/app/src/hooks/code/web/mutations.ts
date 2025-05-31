import { mutate } from 'swr';
import type { CreateWebInput, Web } from '@/types/web';
import { updateWebEmoji } from '@/app/actions/webs';

export function useCreateWeb() {
  const createWeb = async (input: CreateWebInput): Promise<Web> => {
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

    const data = await response.json();
    
    // Revalidate the webs list
    mutate('/api/webs');
    
    return data;
  };

  return {
    createWeb,
    trigger: createWeb, // Alias for compatibility
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