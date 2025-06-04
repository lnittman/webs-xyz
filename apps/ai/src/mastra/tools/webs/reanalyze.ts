import { createTool } from "@mastra/core/tools";
import { z } from 'zod';

/**
 * Tool for triggering a new analysis on a web
 */
export const reanalyzeWebTool = createTool({
  id: "reanalyze-web",
  description: 'Trigger a fresh analysis on a web with updated URLs',
  inputSchema: z.object({
    webId: z.string().describe('The ID of the web to reanalyze'),
    focusAreas: z.array(z.string()).optional().describe('Specific areas to focus the analysis on'),
  }),
  execute: async ({ context }) => {
    // This tool is meant to be handled client-side
    // Return a signal that this action needs client-side handling
    return {
      action: 'reanalyze-web',
      webId: context.webId,
      focusAreas: context.focusAreas,
      requiresClientAction: true
    };
  }
});
