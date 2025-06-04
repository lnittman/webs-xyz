'use server';

import { auth } from '@repo/auth/server';
import { websService } from '@repo/api';
import { revalidatePath } from 'next/cache';

export async function clearAllUserData(): Promise<
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

    // Get all user webs
    const webs = await websService.listWebs(userId);

    // Delete all webs (this will cascade delete messages and entities)
    await Promise.all(
      webs.map(web => websService.deleteWeb(web.id))
    );

    // Revalidate pages
    revalidatePath('/');
    revalidatePath('/settings');

    return {
      success: true,
      message: `Successfully deleted ${webs.length} webs and all associated data`,
    };
  } catch (error) {
    console.error('Error clearing user data:', error);
    
    if (error instanceof Error) {
      return { error: error.message };
    }

    return { error: 'Failed to clear data' };
  }
} 