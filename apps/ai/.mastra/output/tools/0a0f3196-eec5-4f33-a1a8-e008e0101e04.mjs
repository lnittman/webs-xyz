export { s as scrapeWithJina } from '../scrape-with-jina.mjs';
import { tool } from 'ai';
import { z } from 'zod';
import '@mastra/core/tools';

const addUrlToWebTool = tool({
  description: "Add a new URL to an existing web analysis for expanded insights",
  parameters: z.object({
    webId: z.string().describe("The ID of the web to add the URL to"),
    url: z.string().url().describe("The URL to add"),
    reason: z.string().optional().describe("Reason for adding this URL")
  })
  // No execute function - this will be handled client-side
});
const reanalyzeWebTool = tool({
  description: "Trigger a fresh analysis on a web with updated URLs",
  parameters: z.object({
    webId: z.string().describe("The ID of the web to reanalyze"),
    focusAreas: z.array(z.string()).optional().describe("Specific areas to focus the analysis on")
  })
  // No execute function - this will be handled client-side
});
const compareWebsTool = tool({
  description: "Compare insights and topics across multiple webs",
  parameters: z.object({
    webIds: z.array(z.string()).min(2).max(5).describe("IDs of webs to compare"),
    comparisonType: z.enum(["topics", "sentiment", "entities", "all"]).default("all")
  })
  // No execute function - this will be handled client-side
});

export { addUrlToWebTool, compareWebsTool, reanalyzeWebTool };
