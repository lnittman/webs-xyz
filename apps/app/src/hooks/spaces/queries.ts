import useSWR from 'swr';
import type { Space } from '@/types/space';

const fetcher = async (url: string) => {
  const res = await fetch(url);
  const json = await res.json();
  
  if (!res.ok) {
    throw new Error(json.message || 'Failed to fetch');
  }
  
  // Extract data from the response envelope
  return json.data || json;
};

export function useSpaces() {
  const { data, error, mutate } = useSWR<Space[]>(
    '/api/spaces',
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateOnMount: true,
      dedupingInterval: 0,
    }
  );

  return {
    spaces: data || [],
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
}

export function useSpace(spaceId: string | null) {
  const { data, error, mutate } = useSWR<Space>(
    spaceId ? `/api/spaces/${spaceId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  return {
    space: data,
    isLoading: !error && !data && spaceId,
    isError: error,
    mutate,
  };
} 