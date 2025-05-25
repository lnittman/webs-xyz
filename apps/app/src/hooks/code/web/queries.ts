import useSWR from 'swr';
import type { Web } from '@/types/web';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useWebs(workspaceId = 'default') {
  const { data, error, mutate } = useSWR<Web[]>(
    `/api/webs?workspaceId=${workspaceId}`,
    fetcher,
    {
      refreshInterval: 5000, // Poll every 5 seconds for updates
    }
  );

  return {
    webs: data,
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