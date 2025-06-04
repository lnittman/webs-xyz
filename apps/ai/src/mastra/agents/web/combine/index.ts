import { Agent } from "@mastra/core/agent";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";

import { loadPrompt } from "../../../utils/loadPrompt";

const openRouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

const prompt = loadPrompt("agents/web/combine/prompt.xml", "", {
  toolsDir: "tools",
  rootDir: process.cwd(),
});

/**
 * The Web Combine agent intelligently combines individual URL analyses
 * and generates final structured output with enhanced insights and cross-URL connections
 */
export const webCombineAgent = new Agent({
  name: "web-combine",
  instructions: prompt,
  model: openRouter("anthropic/claude-sonnet-4"),
});

export default webCombineAgent; 
