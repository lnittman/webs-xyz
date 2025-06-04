import { createStep } from "@mastra/core/workflows";

import { combineInputSchema, combineOutputSchema } from "./schema";

import { webCombineAgent } from "../../../../../agents";
import { logStep, logError, logTiming } from "../../../../../utils/logger";

// Import other steps for reference
import { fetchStep } from "../fetch";
import { metadataStep } from "../metadata";
import { analysisStep } from "../analysis";

// Step 4: Final combination using webCombineAgent - combines all analysis and creates final structured output
export const combineStep = createStep({
  id: "combine",
  description: "Uses webCombineAgent to combine all analysis results and create final structured output",
  inputSchema: combineInputSchema,
  outputSchema: combineOutputSchema,
  execute: async ({ inputData, mastra, getStepResult, getInitData, runtimeContext }) => {
    const stepStartTime = Date.now();
    logStep("final-combine", "🔗", "Starting final combination with webCombineAgent");
    
    try {
      // Get results from previous steps
      const fetchData = getStepResult(fetchStep);
      const metadataData = getStepResult(metadataStep);
      const analysisData = getStepResult(analysisStep);
      
      logStep("final-combine", "🔍", "Checking all step data", {
        hasFetchData: !!fetchData,
        hasMetadataData: !!metadataData,
        hasAnalysisData: !!analysisData,
      });
      
      if (!fetchData || !metadataData || !analysisData) {
        logError("final-combine", "Required step data not found or failed", {
          fetchData: !!fetchData,
          metadataData: !!metadataData,
          analysisData: !!analysisData
        });
        throw new Error("Required step data not found or failed");
      }

      const { urls, prompt } = fetchData;
      const metadata = metadataData;
      const { urlAnalyses } = analysisData;

      logStep("final-combine", "🤖", "Calling webCombineAgent", {
        urlCount: urls.length,
        hasPrompt: !!prompt,
        title: metadata.quickTitle,
        analysisCount: urlAnalyses.length
      });

      // Prepare comprehensive data for the final combine agent
      const combineInput = {
        urls,
        prompt,
        quickMetadata,
        urlAnalyses
      };

      // Call the web combine agent to create final structured output
      const response = await webCombineAgent.generate([
        {
          role: "user",
          content: JSON.stringify(combineInput),
        },
      ]);

      let finalResult;
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
        
        finalResult = JSON.parse(jsonText.trim());
      } catch (parseError) {
        logError("final-combine", "Failed to parse agent response", { 
          parseError, 
          responseText: response.text?.substring(0, 500) 
        });
        throw new Error("Failed to parse final combine response");
      }

      logStep("final-combine", "🎉", "Final result assembled", {
        title: finalResult.title,
        emoji: finalResult.emoji,
        topicsCount: finalResult.topics?.length || 0,
        insightsCount: finalResult.insights?.length || 0,
        entitiesCount: finalResult.entities?.length || 0,
        enhancedInsightsCount: finalResult.enhancedInsights?.length || 0,
        crossUrlConnectionsCount: finalResult.crossUrlConnections?.length || 0
      });

      logStep("final-combine", "💾", "Database updates will be handled by streaming endpoint");
      
      logTiming("final-combine", stepStartTime);
      logStep("final-combine", "🏁", "Workflow completed successfully!");

      return finalResult;
    } catch (error) {
      logError("final-combine", "Step failed", error);
      logTiming("final-combine", stepStartTime, "Step failed");
      throw error;
    }
  },
});

// Export everything for easy access
export * from "./schema"; 