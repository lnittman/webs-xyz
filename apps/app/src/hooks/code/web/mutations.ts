import { useState } from 'react';
import { mutate } from 'swr';
import type { CreateWebInput, Web } from '@/types/web';

export function useCreateWeb() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createWeb = async (input: CreateWebInput) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/webs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create web');
      }

      const result = await response.json();
      const newWeb = result.data as Web;
      
      // Invalidate and refetch webs list
      await mutate('/api/webs?workspaceId=default');
      
      return newWeb;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createWeb,
    isLoading,
    error,
  };
}

export function useUpdateWeb() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updateWeb = async (id: string, updates: Partial<Web>) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/webs/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update web');
      }

      const updatedWeb = await response.json() as Web;
      
      // Invalidate the specific web
      await mutate(`/api/webs/${id}`);
      
      return updatedWeb;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    updateWeb,
    isLoading,
    error,
  };
} 