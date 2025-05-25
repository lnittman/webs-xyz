import useSWR from 'swr';
import type { UserSettings } from '@/types/user-settings';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useUserSettings() {
  const { data, error, mutate } = useSWR<UserSettings>(
    '/api/user-settings',
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  return {
    settings: data,
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
} 