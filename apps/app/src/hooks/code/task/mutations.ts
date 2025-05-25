import { useSWRConfig } from 'swr';
import { Task } from './queries';

interface CreateTaskInput {
  workspaceId: string;
  prompt: string;
}

interface UpdateTaskInput {
  taskId: string;
  status?: Task['status'];
  result?: string;
  error?: string;
}

export function useCreateTask() {
  const { mutate } = useSWRConfig();

  const createTask = async (input: CreateTaskInput) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        throw new Error('Failed to create task');
      }

      const newTask = await response.json();
      
      // Revalidate the tasks list
      mutate(`/api/tasks?workspaceId=${input.workspaceId}`);
      
      return newTask;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  };

  return { createTask };
}

export function useUpdateTask() {
  const { mutate } = useSWRConfig();

  const updateTask = async (input: UpdateTaskInput) => {
    try {
      const response = await fetch(`/api/tasks/${input.taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: input.status,
          result: input.result,
          error: input.error,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }

      const updatedTask = await response.json();
      
      // Revalidate both specific task and tasks list
      mutate(`/api/tasks/${input.taskId}`);
      mutate((key: string) => key.startsWith('/api/tasks?'), undefined, { revalidate: true });
      
      return updatedTask;
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  };

  return { updateTask };
}

export function useDeleteTask() {
  const { mutate } = useSWRConfig();

  const deleteTask = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete task');
      }
      
      // Revalidate tasks list
      mutate((key: string) => key.startsWith('/api/tasks?'), undefined, { revalidate: true });
      
      return true;
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  };

  return { deleteTask };
} 