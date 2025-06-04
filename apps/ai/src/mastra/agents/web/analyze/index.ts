import { Agent } from "@mastra/core/agent";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";

import { loadPrompt } from "../../../utils/loadPrompt";

const openRouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

const prompt = loadPrompt("agents/web/analyze/prompt.xml", "", {
  toolsDir: "tools",
  rootDir: process.cwd(),
});

/**
 * The Webs agent analyzes scraped web content and returns structured data
 */
export const webAnalyzeAgent = new Agent({
  name: "web-analyze",
  instructions: prompt,
  model: openRouter("anthropic/claude-sonnet-4"),
});

export default webAnalyzeAgent;
