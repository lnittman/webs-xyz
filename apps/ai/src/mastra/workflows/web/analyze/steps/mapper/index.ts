import { createStep } from "@mastra/core";
import z from "zod";

import { combineInputSchema } from "../combine";
import { fetchStep } from "../fetch";

// Create a mapper step to transform parallel output to combine input
export const mapperStep = createStep({
  id: "mapper",
  description: "Maps parallel step outputs to combine step input",
  inputSchema: z.object({
    metadata: z.any(),
    analysis: z.any(),
  }),
  outputSchema: combineInputSchema,
  execute: async ({ inputData, getStepResult }) => {
    // Get the fetch step result for urls and prompt
    const fetchData = getStepResult(fetchStep);
    
    return {
      urls: fetchData.urls,
      prompt: fetchData.prompt,
      quickMetadata: inputData.metadata,
      urlAnalyses: inputData.analysis.urlAnalyses,
    };
  },
});
