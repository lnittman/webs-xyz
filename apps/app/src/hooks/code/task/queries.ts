import useSWR from 'swr';

export interface Task {
  id: string;
  prompt: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: string;
  error?: string;
  workspaceId: string;
  createdAt: Date;
  updatedAt: Date;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useTasks(workspaceId = 'default') {
  const { data, error, mutate } = useSWR<Task[]>(
    `/api/tasks?workspaceId=${workspaceId}`,
    fetcher,
    {
      refreshInterval: 5000, // Poll every 5 seconds for task updates
    }
  );

  return {
    tasks: data,
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
}

export function useTask(taskId: string) {
  const { data, error, mutate } = useSWR<Task>(
    taskId ? `/api/tasks/${taskId}` : null,
    fetcher,
    {
      refreshInterval: 2000, // Poll more frequently for individual task
    }
  );

  return {
    task: data,
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
} 