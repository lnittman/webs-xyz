import { Agent } from "@mastra/core/agent";
import { Memory } from '@mastra/memory';
import { createOpenRouter } from "@openrouter/ai-sdk-provider";

import { storage } from "../../storage";
import { loadPrompt } from "../../utils/loadPrompt";

const openRouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

const prompt = loadPrompt("agents/chat/prompt.xml", "", {
  toolsDir: "tools",
  rootDir: process.cwd(),
});

/**
 * The Chat agent combines planning, execution, and summarization into a single conversational interface
 */
export const chatAgent = new Agent({
  name: "chat",
  instructions: prompt,
  model: openRouter("openai/gpt-4.1"),
  memory: new Memory({
    storage,
    options: {
      lastMessages: 10,
      semanticRecall: false,
      threads: {
        generateTitle: false
      }
    },
  }),
});

export default chatAgent; 