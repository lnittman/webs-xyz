'use server';

import { auth } from '@repo/auth/server';
import { websService } from '@repo/api';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const deleteWebSchema = z.object({
  webId: z.string().uuid('Invalid web ID format'),
});

export const deleteWeb = async (
  input: z.infer<typeof deleteWebSchema>
): Promise<
  | {
      success: true;
      message: string;
    }
  | {
      error: string;
    }
> => {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { error: 'Not authenticated' };
    }

    // Validate input
    const validatedData = deleteWebSchema.parse(input);

    // Check if the web exists and belongs to the user
    const existingWeb = await websService.getWebById(validatedData.webId);
    
    if (!existingWeb) {
      return { error: 'Web not found' };
    }

    if (existingWeb.userId !== userId) {
      return { error: 'You do not have access to this web' };
    }

    // Delete the web using the service
    await websService.deleteWeb(validatedData.webId);

    // Revalidate relevant pages
    revalidatePath('/');
    revalidatePath('/w');

    return {
      success: true,
      message: 'Web deleted successfully',
    };
  } catch (error) {
    console.error('Error deleting web:', error);
    
    if (error instanceof z.ZodError) {
      return { error: 'Invalid input data' };
    }

    return { error: 'Failed to delete web' };
  }
}; 