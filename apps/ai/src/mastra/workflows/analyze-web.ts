import { Workflow, Step } from "@mastra/core/workflows";
import { z } from "zod";
import { websAgent } from "../agents/webs";

// Input schema for the workflow
const analyzeWebInputSchema = z.object({
  urls: z.array(z.string().url()).describe("The URLs to analyze"),
  prompt: z.string().optional().describe("Optional prompt for specific analysis"),
});

// Schema for single URL analysis
const singleUrlAnalysisSchema = z.object({
  url: z.string(),
  title: z.string().optional(),
  description: z.string().optional(),
  topics: z.array(z.string()),
  sentiment: z.enum(["positive", "neutral", "negative"]),
  summary: z.string(),
  insights: z.array(z.string()),
  entities: z.array(z.object({
    type: z.string(),
    value: z.string()
  })),
  readingTime: z.number(),
  confidence: z.number(),
  relatedUrls: z.array(z.string()).optional(),
});

// Output schema for the combined analysis result
const analysisResultSchema = z.object({
  urls: z.array(z.string()),
  prompt: z.string().nullable(),
  title: z.string().optional(),
  description: z.string().optional(),
  topics: z.array(z.string()),
  sentiment: z.enum(["positive", "neutral", "negative"]),
  insights: z.array(z.string()),
  entities: z.array(z.object({
    type: z.string(),
    value: z.string()
  })),
  readingTime: z.number(),
  confidence: z.number(),
  relatedUrls: z.array(z.string()),
  urlAnalyses: z.array(singleUrlAnalysisSchema),
  metadata: z.object({
    timestamp: z.string(),
    urlCount: z.number(),
  }),
});

// Create the step that uses the web analyzer agent
const analyzeWebStep = new Step({
  id: "analyze-web",
  description: "Analyzes multiple web pages using the webs agent",
  inputSchema: analyzeWebInputSchema,
  outputSchema: analysisResultSchema,
  execute: async ({ context }) => {
    // Handle nested triggerData structure
    const triggerData = context?.triggerData?.triggerData || context?.triggerData;
    
    if (!triggerData) {
      throw new Error("Trigger data not found");
    }

    const parsedData = analyzeWebInputSchema.parse(triggerData);
    const { urls, prompt } = parsedData;

    try {
      console.log(`[analyze-web workflow] Analyzing ${urls.length} URLs`);

      // Analyze each URL individually
      const urlAnalyses = await Promise.all(
        urls.map(async (url) => {
          try {
            const userMessage = prompt 
              ? `Analyze this website and also identify any related or referenced URLs in the content: ${url}\n\nSpecific request: ${prompt}` 
              : `Analyze this website and also identify any related or referenced URLs in the content: ${url}`;

            console.log(`[analyze-web workflow] Analyzing URL: ${url}`);

            const response = await websAgent.generate([
              {
                role: "user",
                content: userMessage,
              },
            ]);

            console.log(`[analyze-web workflow] Got response for URL: ${url}`);

            try {
              // Strip markdown code blocks if present
              let jsonText = response.text;
              
              // Remove ```json from the beginning and ``` from the end
              if (jsonText.startsWith('```json')) {
                jsonText = jsonText.slice(7); // Remove ```json
              } else if (jsonText.startsWith('```')) {
                jsonText = jsonText.slice(3); // Remove ```
              }
              
              if (jsonText.endsWith('```')) {
                jsonText = jsonText.slice(0, -3); // Remove trailing ```
              }
              
              // Trim any whitespace
              jsonText = jsonText.trim();
              
              const analysisData = JSON.parse(jsonText);
              
              // Extract related URLs from the content if not provided
              const relatedUrls = analysisData.relatedUrls || [];
              
              return {
                url,
                ...analysisData,
                relatedUrls,
              };
            } catch (parseError) {
              console.error(`[analyze-web workflow] Failed to parse JSON for ${url}:`, parseError);
              return null;
            }
          } catch (error) {
            console.error(`[analyze-web workflow] Failed to analyze ${url}:`, error);
            return null;
          }
        })
      );

      // Filter out failed analyses
      const successfulAnalyses = urlAnalyses.filter(Boolean);

      if (successfulAnalyses.length === 0) {
        throw new Error("All URL analyses failed");
      }

      // Combine the analyses into a unified result
      const combinedAnalysis = {
        urls,
        prompt: prompt || null,
        title: successfulAnalyses[0]?.title || `Analysis of ${urls.length} web pages`,
        description: prompt 
          ? `Analysis of ${urls.length} URLs based on: "${prompt}"`
          : `Combined analysis of ${urls.length} web pages`,
        topics: [...new Set(successfulAnalyses.flatMap(a => a?.topics || []))],
        sentiment: determineCombinedSentiment(successfulAnalyses),
        insights: combineInsights(successfulAnalyses),
        entities: combineEntities(successfulAnalyses),
        readingTime: successfulAnalyses.reduce((sum, a) => sum + (a?.readingTime || 0), 0),
        confidence: successfulAnalyses.reduce((sum, a) => sum + (a?.confidence || 0), 0) / successfulAnalyses.length,
        relatedUrls: [...new Set(successfulAnalyses.flatMap(a => a?.relatedUrls || []))],
        urlAnalyses: successfulAnalyses,
        metadata: {
          timestamp: new Date().toISOString(),
          urlCount: urls.length,
        },
      };

      return combinedAnalysis;
    } catch (error) {
      console.error('[analyze-web workflow] Error:', error);
      throw error;
    }
  },
});

// Helper function to determine combined sentiment
function determineCombinedSentiment(analyses: any[]): "positive" | "neutral" | "negative" {
  const sentiments = analyses.map(a => a?.sentiment).filter(Boolean);
  const sentimentCounts = sentiments.reduce((acc, sentiment) => {
    acc[sentiment] = (acc[sentiment] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Return the most common sentiment
  const sortedSentiments = Object.entries(sentimentCounts).sort(([, a], [, b]) => (b as number) - (a as number));
  return (sortedSentiments[0]?.[0] as any) || "neutral";
}

// Helper function to combine insights from multiple analyses
function combineInsights(analyses: any[]): string[] {
  const allInsights = analyses.flatMap(a => a?.insights || []);
  // Remove duplicates and limit to top 10
  return [...new Set(allInsights)].slice(0, 10);
}

// Helper function to combine entities from multiple analyses
function combineEntities(analyses: any[]): Array<{ type: string; value: string }> {
  const allEntities = analyses.flatMap(a => a?.entities || []);
  // Remove duplicate entities based on type and value
  const uniqueEntities = new Map();
  allEntities.forEach(entity => {
    const key = `${entity.type}:${entity.value}`;
    if (!uniqueEntities.has(key)) {
      uniqueEntities.set(key, entity);
    }
  });
  return Array.from(uniqueEntities.values());
}

// Create and export the workflow
export const analyzeWeb = new Workflow({
  name: "analyzeWeb",
  triggerSchema: analyzeWebInputSchema,
})
  .step(analyzeWebStep)
  .commit();