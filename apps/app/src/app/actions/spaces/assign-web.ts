'use server';

import { auth } from '@repo/auth/server';
import { spaceService } from '@repo/api';
import { revalidatePath } from 'next/cache';

export async function assignWebToSpace(
  webId: string,
  spaceId: string | null
): Promise<
  | {
      success: true;
      message: string;
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

    // Assign web to space using the service
    await spaceService.assignWebToSpace(webId, spaceId, userId);

    // Revalidate relevant pages
    revalidatePath('/');
    revalidatePath('/spaces');
    revalidatePath(`/w/${webId}`);

    return {
      success: true,
      message: spaceId 
        ? 'Web assigned to space successfully' 
        : 'Web removed from space successfully',
    };
  } catch (error) {
    console.error('Error assigning web to space:', error);
    
    if (error instanceof Error) {
      return { error: error.message };
    }

    return { error: 'Failed to assign web to space' };
  }
} 