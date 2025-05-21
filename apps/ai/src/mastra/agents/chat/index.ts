import { Agent } from "@mastra/core/agent";
import { Memory } from '@mastra/memory';
import { createOpenRouter } from "@openrouter/ai-sdk-provider";

//import { memory } from "./memory";
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
  model: openRouter("anthropic/claude-3.7-sonnet"),
  memory: new Memory({
    options: {
      semanticRecall: false,
    },
  }),
});

export default chatAgent; 