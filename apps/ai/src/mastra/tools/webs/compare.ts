import { createTool } from "@mastra/core/tools";
import { z } from 'zod';

/**
 * Tool for comparing multiple webs
 */
export const compareWebsTool = createTool({
  id: "compare-webs",
  description: 'Compare insights and topics across multiple webs',
  inputSchema: z.object({
    webIds: z.array(z.string()).min(2).max(5).describe('IDs of webs to compare'),
    comparisonType: z.enum(['topics', 'sentiment', 'entities', 'all']).default('all'),
  }),
  execute: async ({ context }) => {
    // This tool is meant to be handled client-side
    // Return a signal that this action needs client-side handling
    return {
      action: 'compare-webs',
      webIds: context.webIds,
      comparisonType: context.comparisonType,
      requiresClientAction: true
    };
  }
}); 