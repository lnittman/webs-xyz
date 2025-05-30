import { Agent } from "@mastra/core/agent";
import { Memory } from '@mastra/memory';
import { createOpenRouter } from "@openrouter/ai-sdk-provider";

import { storage } from "../../storage";
import { loadPrompt } from "../../utils/loadPrompt";
import { scrapeWithJina } from "../../tools";

const openRouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

const prompt = loadPrompt("agents/webs/prompt.xml", "", {
  toolsDir: "tools",
  rootDir: process.cwd(),
});

/**
 * The Webs agent analyzes scraped web content and returns structured data
 */
export const websAgent = new Agent({
  name: "webs",
  instructions: prompt,
  model: openRouter("google/gemini-2.5-flash-preview-05-20"),
  tools: {
    "scrape-web-content-jina": scrapeWithJina,
  },
  memory: new Memory({
    storage,
    options: {
      lastMessages: 5,
      semanticRecall: false,
      threads: {
        generateTitle: false
      }
    },
  }),
});

export default websAgent;