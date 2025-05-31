"use server";

import { Knock } from "@knocklabs/node";
import { keys } from '../keys';

const knock = new Knock(keys().KNOCK_SECRET_API_KEY || '');

interface NotificationData {
  [key: string]: any;
}

/**
 * Check if a user has any notifications in their feed
 */
export async function checkUserHasNotifications(userId: string): Promise<boolean> {
  try {
    const channelId = keys().NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID;
    if (!channelId) {
      console.warn('No feed channel ID configured');
      return false;
    }

    const feed = await knock.users.getFeed(userId, channelId);
    return feed.entries && feed.entries.length > 0;
  } catch (error) {
    console.error('Failed to check user notifications:', error);
    return false;
  }
}

/**
 * Trigger a web analysis complete notification
 */
export async function sendWebAnalysisCompleteNotification(
  userId: string,
  webData: {
    id: string;
    title: string;
    url: string;
    status: string;
    analysis?: any;
  }
) {
  try {
    await knock.workflows.trigger("web-analysis-complete", {
      recipients: [userId],
      data: {
        title: `Analysis complete: ${webData.title || webData.url}`,
        body: `Your web analysis for **[${webData.title || webData.url}](/w/${webData.id})** has completed successfully. Click to view the results.`,
        categories: ["success"],
        webId: webData.id,
        webTitle: webData.title,
        webUrl: webData.url,
        actions: [
          {
            label: "View Results",
            primary: true,
            url: `/w/${webData.id}`
          }
        ]
      }
    });
  } catch (error) {
    console.error("Failed to send web analysis complete notification:", error);
  }
}

/**
 * Trigger a welcome notification for new users
 */
export async function sendWelcomeNotification(userId: string, userName?: string) {
  try {
    // Check if user already has notifications to avoid duplicate welcomes
    const hasNotifications = await checkUserHasNotifications(userId);
    if (hasNotifications) {
      console.log('User already has notifications, skipping welcome notification');
      return;
    }

    await knock.workflows.trigger("user-welcome", {
      recipients: [userId],
      data: {
        title: "Welcome to Webs! 🎉",
        body: `Hi${userName ? ` ${userName}` : ""}! Welcome to Webs. We're excited to have you here. To get started, try analyzing your first website by entering a URL in the search bar above. Need help? Check out our [documentation](/docs) or [contact support](mailto:support@example.com).`,
        categories: ["info"],
        actions: [
          {
            label: "Get Started",
            primary: true,
            url: "/"
          },
          {
            label: "Read Docs",
            url: "/docs"
          }
        ]
      }
    });
    
    console.log('Welcome notification sent successfully for user:', userId);
  } catch (error) {
    console.error("Failed to send welcome notification:", error);
    throw error; // Re-throw so the caller knows it failed
  }
}

/**
 * Trigger a web analysis failed notification
 */
export async function sendWebAnalysisFailedNotification(
  userId: string,
  webData: {
    id: string;
    url: string;
    error?: string;
  }
) {
  try {
    await knock.workflows.trigger("web-analysis-failed", {
      recipients: [userId],
      data: {
        title: `Analysis failed: ${webData.url}`,
        body: `We encountered an error while analyzing **${webData.url}**. ${webData.error ? `Error: ${webData.error}` : "Please try again or contact support if the issue persists."}`,
        categories: ["error"],
        webId: webData.id,
        webUrl: webData.url,
        actions: [
          {
            label: "Retry Analysis",
            primary: true,
            method: "POST",
            endpoint: `/api/webs/${webData.id}/retry`
          },
          {
            label: "Contact Support",
            url: "mailto:support@example.com"
          }
        ]
      }
    });
  } catch (error) {
    console.error("Failed to send web analysis failed notification:", error);
  }
}

/**
 * Send a custom notification
 */
export async function sendCustomNotification(
  userId: string,
  workflowKey: string,
  data: NotificationData
) {
  try {
    await knock.workflows.trigger(workflowKey, {
      recipients: [userId],
      data
    });
  } catch (error) {
    console.error(`Failed to send notification ${workflowKey}:`, error);
  }
} 