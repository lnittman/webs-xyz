import { createWorkflow } from "@mastra/core/workflows";

import { analyzeWebInputSchema, analyzeWebOutputSchema } from "./schema";
import { analysisStep } from "./steps/analysis";
import { combineStep } from "./steps/combine";
import { fetchStep } from "./steps/fetch";
import { mapperStep } from "./steps/mapper";
import { quickMetadataStep } from "./steps/quick-metadata";


// 1. fetchStep - fetches content from URLs
// 2. quickMetadataStep and analysisStep run in parallel (both use fetchStep output)
// 3. mapperStep - transforms parallel output to combine input format
// 4. combineStep - combines all results
export const analyzeWeb = createWorkflow({
  id: "analyzeWeb",
  description: "Analyzes web content from one or more URLs",
  inputSchema: analyzeWebInputSchema,
  outputSchema: analyzeWebOutputSchema,
  steps: [fetchStep, quickMetadataStep, analysisStep, mapperStep, combineStep],
})
  .then(fetchStep)
  .parallel([quickMetadataStep, analysisStep])
  .then(mapperStep)
  .then(combineStep)
  .commit();

// Export the workflow for registration with Mastra
export default analyzeWeb;