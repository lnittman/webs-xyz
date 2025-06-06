import { mutate } from 'swr';
import { createSpace, assignWebToSpace } from '@/app/actions/spaces';
import type { CreateSpaceInput, Space } from '@/types/space';

export function useCreateSpace() {
  const create = async (input: CreateSpaceInput): Promise<Space> => {
    const result = await createSpace(input);
    
    if ('error' in result) {
      throw new Error(result.error);
    }
    
    // Revalidate both spaces and webs lists
    mutate('/api/spaces');
    mutate('/api/webs');
    
    return result.data;
  };

  return {
    createSpace: create,
  };
}

export function useAssignWebToSpace() {
  const assign = async (webId: string, spaceId: string | null): Promise<void> => {
    const result = await assignWebToSpace(webId, spaceId);
    
    if ('error' in result) {
      throw new Error(result.error);
    }
    
    // Revalidate both spaces and webs lists
    mutate('/api/spaces');
    mutate('/api/webs');
  };

  return {
    assignWebToSpace: assign,
  };
} 