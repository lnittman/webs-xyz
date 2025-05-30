import useSWR from 'swr';
import { useEffect, useState } from 'react';
import type { Web } from '@/types/web';

const fetcher = async (url: string) => {
  const res = await fetch(url);
  const json = await res.json();
  
  if (!res.ok) {
    throw new Error(json.message || 'Failed to fetch');
  }
  
  // Extract data from the response envelope
  return json.data || json;
};

export function useWebs(workspaceId = 'default') {
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const { data, error, mutate, isValidating } = useSWR<Web[]>(
    `/api/webs?workspaceId=${workspaceId}`,
    fetcher,
    {
      refreshInterval: 5000, // Poll every 5 seconds for updates
      fallbackData: [], // Provide empty array as fallback
    }
  );

  // Track when we've successfully loaded data for the first time
  useEffect(() => {
    if (data && !error && !isValidating) {
      setHasLoadedOnce(true);
    }
  }, [data, error, isValidating]);

  return {
    webs: data || [],
    isLoading: !hasLoadedOnce && isValidating,
    isError: error,
    mutate,
  };
}

export function useWeb(webId: string) {
  const { data, error, mutate } = useSWR<Web>(
    webId ? `/api/webs/${webId}` : null,
    fetcher,
    {
      refreshInterval: (data) => {
        // Poll more frequently if the web is still processing
        if (data?.status === 'PROCESSING') {
          return 1000; // Poll every second
        }
        // Otherwise poll less frequently
        return 5000; // Poll every 5 seconds
      },
    }
  );

  return {
    web: data,
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
} 