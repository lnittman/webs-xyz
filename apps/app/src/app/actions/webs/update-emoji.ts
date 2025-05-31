'use server';

import { auth } from '@repo/auth/server';
import { database } from '@repo/database';
import { z } from 'zod';

const updateEmojiSchema = z.object({
  webId: z.string().uuid('Invalid web ID format'),
  emoji: z.string().min(1).max(10), // Allow emoji characters
});

export const updateWebEmoji = async (
  input: z.infer<typeof updateEmojiSchema>
): Promise<
  | {
      success: true;
      data: {
        id: string;
        emoji: string;
        updatedAt: string;
      };
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
    const validatedData = updateEmojiSchema.parse(input);

    // Check if the web exists and belongs to the user
    const existingWeb = await database.web.findFirst({
      where: {
        id: validatedData.webId,
        userId,
      },
    });

    if (!existingWeb) {
      return { error: 'Web not found or access denied' };
    }

    // Update the emoji
    const updatedWeb = await database.web.update({
      where: {
        id: validatedData.webId,
      },
      data: {
        emoji: validatedData.emoji,
      },
    });

    return {
      success: true,
      data: {
        id: updatedWeb.id,
        emoji: updatedWeb.emoji || '',
        updatedAt: updatedWeb.updatedAt.toISOString(),
      },
    };
  } catch (error) {
    console.error('Error updating web emoji:', error);
    
    if (error instanceof z.ZodError) {
      return { error: 'Invalid input data' };
    }

    return { error: 'Failed to update emoji' };
  }
}; 