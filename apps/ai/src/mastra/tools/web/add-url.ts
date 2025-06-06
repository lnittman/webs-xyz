import { createTool } from "@mastra/core/tools";
import { z } from 'zod';

/**
 * Tool for adding a URL to an existing web analysis
 * This is a client-side tool that requires user confirmation
 */
export const addUrlTool = createTool({
  id: "add-url",
  description: 'Add a new URL to an existing web analysis for expanded insights',
  inputSchema: z.object({
    webId: z.string().describe('The ID of the web to add the URL to'),
    url: z.string().url().describe('The URL to add'),
    reason: z.string().optional().describe('Reason for adding this URL'),
  }),
  execute: async ({ context }) => {
    // This tool is meant to be handled client-side
    // Return a signal that this action needs client-side handling
    return {
      action: 'add-url',
      webId: context.webId,
      url: context.url,
      reason: context.reason,
      requiresClientAction: true
    };
  }
});

