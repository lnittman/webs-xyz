import { Agent } from "@mastra/core/agent";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";

import { loadPrompt } from "../../../utils/loadPrompt";

const openRouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

const prompt = loadPrompt("agents/web/metadata/prompt.xml", "", {
  toolsDir: "tools",
  rootDir: process.cwd(),
});

/**
 * The Web Metadata agent generates fast title, emoji, description, and topics for web content
 * Uses Gemini 2.5 Flash for speed
 */
export const webMetadataAgent = new Agent({
  name: "web-metadata",
  instructions: prompt,
  model: openRouter("google/gemini-2.5-flash-preview-05-20"),
});

export default webMetadataAgent; 