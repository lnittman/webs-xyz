import useSWR from 'swr';
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
  const { data, error, mutate } = useSWR<Web[]>(
    `/api/webs?workspaceId=${workspaceId}`,
    fetcher,
    {
      refreshInterval: 5000, // Poll every 5 seconds for updates
      fallbackData: [], // Provide empty array as fallback
    }
  );

  return {
    webs: data || [],
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
}

export function useWeb(webId: string) {
  const { data, error, mutate } = useSWR<Web>(
    webId ? `/api/webs/${webId}` : null,
    fetcher,
    {
      refreshInterval: 2000, // Poll more frequently for individual web
    }
  );

  return {
    web: data,
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
} 