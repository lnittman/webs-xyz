import { createStep } from "@mastra/core/workflows";

import { detailedAnalysisInputSchema, detailedAnalysisOutputSchema } from "./schema";

import { webAnalyzeAgent } from "../../../../../agents";
import { logStep, logError, logTiming } from "../../../../../utils/logger";

// Import fetchStep for reference
import { fetchStep } from "../fetch";

// Step 3: Detailed analysis of each URL using webAnalyzeAgent with pre-fetched content
export const analysisStep = createStep({
  id: "analysis",
  description: "Performs detailed analysis of each URL content using webAnalyzeAgent with pre-fetched content",
  inputSchema: detailedAnalysisInputSchema,
  outputSchema: detailedAnalysisOutputSchema,
  execute: async ({ inputData, mastra, getStepResult, getInitData, runtimeContext }) => {
    const stepStartTime = Date.now();
    logStep("detailed-analysis", "🧠", "Starting detailed analysis step");
    
    try {
      // getStepResult returns the output directly
      const fetchData = getStepResult(fetchStep);
      
      if (!fetchData) {
        logError("detailed-analysis", "Fetch data not found or failed", { fetchData });
        throw new Error("Fetch data not found or failed");
      }

      const { urls, prompt, fetchResults } = fetchData;
      const successfulFetches = fetchResults.filter((f: any) => f.success);

      logStep("detailed-analysis", "📊", "Starting detailed URL analysis", {
        totalUrls: urls.length,
        successfulFetches: successfulFetches.length,
        analysisPrompt: prompt || "General analysis"
      });

      // Analyze each URL individually with full analysis using pre-fetched content
      const analysisPromises = successfulFetches.map(async (fetchedUrl: any, index: number) => {
        const urlStartTime = Date.now();
        logStep("detailed-analysis", "🔬", `[${index + 1}/${successfulFetches.length}] Starting analysis for: ${fetchedUrl.url}`);
        
        try {
          // Prepare content analysis input for the agent
          const analysisInput = {
            url: fetchedUrl.url,
            content: fetchedUrl.content,
            title: fetchedUrl.title
          };

          // Include user prompt context if provided
          const userMessage = prompt 
            ? `Analyze this website content with focus on: ${prompt}\n\nContent to analyze:\n${JSON.stringify(analysisInput, null, 2)}` 
            : `Analyze this website content:\n${JSON.stringify(analysisInput, null, 2)}`;

          logStep("detailed-analysis", "💬", `[${index + 1}/${successfulFetches.length}] Sending content to webAnalyzeAgent`, {
            url: fetchedUrl.url,
            contentLength: fetchedUrl.content?.length || 0,
            hasTitle: !!fetchedUrl.title,
            hasPrompt: !!prompt
          });

          const response = await webAnalyzeAgent.generate([
            {
              role: "user",
              content: userMessage,
            },
          ]);

          const processingTime = Date.now() - urlStartTime;
          logStep("detailed-analysis", "📝", `[${index + 1}/${successfulFetches.length}] Got webAnalyzeAgent response`, {
            url: fetchedUrl.url,
            responseLength: response.text?.length || 0,
            processingTime
          });

          try {
            // Strip markdown code blocks if present
            let jsonText = response.text;
            
            if (jsonText.startsWith('```json')) {
              jsonText = jsonText.slice(7);
            } else if (jsonText.startsWith('```')) {
              jsonText = jsonText.slice(3);
            }
            
            if (jsonText.endsWith('```')) {
              jsonText = jsonText.slice(0, -3);
            }
            
            jsonText = jsonText.trim();
          
            logStep("detailed-analysis", "🔧", `[${index + 1}/${successfulFetches.length}] Parsing JSON response`, {
              url: fetchedUrl.url,
              cleanedTextLength: jsonText.length
            });
            
            const analysisData = JSON.parse(jsonText);
            
            // Handle error responses from the agent
            if (analysisData.error) {
              logError("detailed-analysis", `[${index + 1}/${successfulFetches.length}] Agent returned error for ${fetchedUrl.url}`, {
                error: analysisData.error,
                message: analysisData.message
              });
              return null;
            }
            
            const result = {
              url: fetchedUrl.url,
              ...analysisData,
              relatedUrls: analysisData.relatedUrls || [],
            };

            logStep("detailed-analysis", "✅", `[${index + 1}/${successfulFetches.length}] Analysis completed successfully`, {
              url: fetchedUrl.url,
              topics: analysisData.topics?.length || 0,
              insights: analysisData.insights?.length || 0,
              entities: analysisData.entities?.length || 0,
              relatedUrls: (analysisData.relatedUrls || []).length,
              sentiment: analysisData.sentiment,
              confidence: analysisData.confidence,
              processingTime
            });

            return result;
          } catch (parseError) {
            logError("detailed-analysis", `[${index + 1}/${successfulFetches.length}] JSON parsing failed for ${fetchedUrl.url}`, {
              parseError,
              responseText: response.text?.substring(0, 500)
            });
            return null;
          }
        } catch (error) {
          logError("detailed-analysis", `[${index + 1}/${successfulFetches.length}] Analysis failed for ${fetchedUrl.url}`, error);
          return null;
        }
      });

      const urlAnalyses = await Promise.all(analysisPromises);
      const successfulAnalyses = urlAnalyses.filter(Boolean);
      const failedCount = urlAnalyses.length - successfulAnalyses.length;

      logStep("detailed-analysis", "📈", "Analysis results summary", {
        totalAnalysisAttempts: urlAnalyses.length,
        successfulAnalyses: successfulAnalyses.length,
        failedAnalyses: failedCount,
        successRate: `${Math.round((successfulAnalyses.length / urlAnalyses.length) * 100)}%`
      });

      if (successfulAnalyses.length === 0) {
        logError("detailed-analysis", "All detailed analyses failed");
        throw new Error("All detailed analyses failed");
      }

      const result = {
        urlAnalyses: successfulAnalyses,
        successfulCount: successfulAnalyses.length,
        failedCount,
      };

      logTiming("detailed-analysis", stepStartTime);
      logStep("detailed-analysis", "🎯", "Step completed successfully", {
        resultKeys: Object.keys(result),
        analysisCount: successfulAnalyses.length
      });

      return result;
    } catch (error) {
      logError("detailed-analysis", "Step failed", error);
      logTiming("detailed-analysis", stepStartTime, "Step failed");
      throw error;
    }
  },
});

// Export everything for easy access
export * from "./schema"; 