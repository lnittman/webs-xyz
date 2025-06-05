import { createStep } from "@mastra/core/workflows";

import { quickMetadataInputSchema, quickMetadataOutputSchema } from "./schema";

import { webMetadataAgent } from "../../../../../agents";
import { logStep, logError, logTiming } from "../../../../../utils/logger";

// Import fetchStep for reference
import { fetchStep } from "../fetch";

// Step 2: Generate quick metadata using AI agent
export const quickMetadataStep = createStep({
  id: "quick-metadata",
  description: "Uses AI agent to generate quick title, emoji, description, and topics",
  inputSchema: quickMetadataInputSchema,
  outputSchema: quickMetadataOutputSchema,
  execute: async ({ inputData, mastra, getStepResult, getInitData, runtimeContext }) => {
    const stepStartTime = Date.now();
    logStep("quick-metadata", "⚡", "Starting quick metadata generation with AI agent");
    
    try {
      // getStepResult returns the output directly
      const fetchData = getStepResult(fetchStep);
      
      if (!fetchData) {
        logError("quick-metadata", "Fetch data not found or failed", { fetchData });
        throw new Error("Fetch data not found or failed");
      }

      const { urls, prompt, fetchResults } = fetchData;
      
      logStep("quick-metadata", "🤖", "Calling webMetadataAgent", {
        urlCount: urls.length,
        successfulFetches: fetchResults.filter((f: any) => f.success).length
      });

      // Call the web metadata agent
      const response = await webMetadataAgent.generate([
        {
          role: "user",
          content: JSON.stringify({ urls, prompt, fetchResults }),
        },
      ]);

      let quickMetadata;
      try {
        // Parse the JSON response from the agent
        let jsonText = response.text?.trim() || '';
        
        // Strip markdown code blocks if present
        if (jsonText.startsWith('```json')) {
          jsonText = jsonText.slice(7);
        } else if (jsonText.startsWith('```')) {
          jsonText = jsonText.slice(3);
        }
        
        if (jsonText.endsWith('```')) {
          jsonText = jsonText.slice(0, -3);
        }
        
        quickMetadata = JSON.parse(jsonText.trim());
      } catch (parseError) {
        logError("quick-metadata", "Failed to parse agent response", { 
          parseError, 
          responseText: response.text?.substring(0, 500) 
        });
        throw new Error("Failed to parse quick metadata response");
      }

      logStep("quick-metadata", "🎉", "Quick metadata generated successfully", quickMetadata);
      logTiming("quick-metadata", stepStartTime);

      return quickMetadata;
    } catch (error) {
      logError("quick-metadata", "Step failed", error);
      logTiming("quick-metadata", stepStartTime, "Step failed");
      throw error;
    }
  },
});

// Export everything for easy access
export * from "./schema"; 