'use server';

import { auth, clerkClient } from '@repo/auth/server';
import { sendWelcomeNotification } from '@repo/notifications/server';

export const ensureWelcomeNotification = async (): Promise<
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

    // Get user's name from Clerk
    let userName: string | undefined;
    try {
      const clerk = await clerkClient();
      const user = await clerk.users.getUser(userId);
      userName = user.firstName || undefined;
    } catch (error) {
      console.warn('Failed to get user name from Clerk:', error);
      // Continue without name
    }

    // Send welcome notification (service handles deduplication)
    await sendWelcomeNotification(userId, userName);

    return { success: true, message: 'Welcome notification processed successfully' };
  } catch (error) {
    console.error('Failed to ensure welcome notification:', error);
    return { error: 'Failed to send welcome notification' };
  }
}; 