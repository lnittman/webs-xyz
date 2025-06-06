'use server';

import { auth } from '@repo/auth/server';
import { spaceService } from '@repo/api';
import { revalidatePath } from 'next/cache';

export interface CreateSpaceInput {
  name: string;
  description?: string;
  color?: string;
  emoji?: string;
  isDefault?: boolean;
}

export async function createSpace(
  input: CreateSpaceInput
): Promise<
  | {
      success: true;
      data: any;
    }
  | {
      error: string;
    }
> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { error: 'Not authenticated' };
    }

    // Create space using the service
    const space = await spaceService.createSpace({
      ...input,
      userId,
    });

    // Revalidate relevant pages
    revalidatePath('/');
    revalidatePath('/spaces');

    return {
      success: true,
      data: space,
    };
  } catch (error) {
    console.error('Error creating space:', error);
    
    if (error instanceof Error) {
      return { error: error.message };
    }

    return { error: 'Failed to create space' };
  }
} 