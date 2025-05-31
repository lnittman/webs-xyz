import { Workflow, Step } from "@mastra/core/workflows";
import { z } from "zod";
import { websAgent } from "../agents/webs";

// Input schema for the workflow
const analyzeWebInputSchema = z.object({
  urls: z.array(z.string().url()).describe("The URLs to analyze"),
  prompt: z.string().optional().describe("Optional prompt for specific analysis"),
});

// Schema for URL fetching step (enhanced for Jina fetching)
const urlFetchSchema = z.object({
  urls: z.array(z.string()),
  prompt: z.string().nullable(),
  fetchResults: z.array(z.object({
    url: z.string(),
    success: z.boolean(),
    content: z.string().optional(),
    title: z.string().optional(),
    error: z.string().optional(),
    metadata: z.object({
      contentLength: z.number().optional(),
      contentType: z.string().optional(),
      processingTime: z.number().optional(),
    }).optional(),
  })),
});

// Schema for quick title/emoji generation (for fast UI feedback)
const quickMetadataSchema = z.object({
  quickTitle: z.string().optional(),
  quickEmoji: z.string().optional(),
  quickDescription: z.string().optional(),
  suggestedTopics: z.array(z.string()).optional(),
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
  emoji: z.string().optional().describe("A single emoji character representing the content"),
});

// Schema for detailed URL analysis step
const detailedAnalysisSchema = z.object({
  urlAnalyses: z.array(singleUrlAnalysisSchema),
  successfulCount: z.number(),
  failedCount: z.number(),
});

// Schema for combined analysis
const combinedAnalysisSchema = z.object({
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
  enhancedInsights: z.array(z.string()).optional(),
  crossUrlConnections: z.array(z.object({
    urls: z.array(z.string()),
    connection: z.string(),
    strength: z.number(),
  })).optional(),
});

// Final output schema
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
  emoji: z.string().optional().describe("A representative emoji for the combined analysis"),
  urlAnalyses: z.array(singleUrlAnalysisSchema),
  enhancedInsights: z.array(z.string()).optional(),
  crossUrlConnections: z.array(z.object({
    urls: z.array(z.string()),
    connection: z.string(),
    strength: z.number(),
  })).optional(),
  metadata: z.object({
    timestamp: z.string(),
    urlCount: z.number(),
    processingSteps: z.array(z.string()),
  }),
});

// Step 1: Async fetch URLs using Jina (parallel)
const fetchUrlsStep = new Step({
  id: "fetch-urls",
  description: "Fetches content from URLs in parallel using Jina scraper",
  inputSchema: analyzeWebInputSchema,
  outputSchema: urlFetchSchema,
  execute: async ({ context }) => {
    // Handle nested triggerData structure
    const triggerData = context?.triggerData?.triggerData || context?.triggerData;
    
    if (!triggerData) {
      throw new Error("Trigger data not found");
    }

    const parsedData = analyzeWebInputSchema.parse(triggerData);
    const { urls, prompt } = parsedData;

    console.log(`[fetch-urls] Fetching content from ${urls.length} URLs in parallel`);

    // Fetch all URLs in parallel using the webs agent's Jina tool
    const fetchResults = await Promise.all(
      urls.map(async (url) => {
        const startTime = Date.now();
        try {
          console.log(`[fetch-urls] Fetching: ${url}`);
          
          // Use the websAgent's scrapeWithJina tool
          const response = await websAgent.generate([
            {
              role: "user",
              content: `Please scrape this URL and return just the raw content: ${url}. Only use the scrape-web-content-jina tool.`,
            },
          ]);

          const processingTime = Date.now() - startTime;
          
          // Extract content from response
          const content = response.text || '';
          
          return {
            url,
            success: true,
            content,
            title: extractTitleFromContent(content),
            metadata: {
              contentLength: content.length,
              processingTime,
            },
          };
        } catch (error) {
          console.error(`[fetch-urls] Failed to fetch ${url}:`, error);
          return {
            url,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            metadata: {
              processingTime: Date.now() - startTime,
            },
          };
        }
      })
    );

    const successfulFetches = fetchResults.filter(f => f.success);
    console.log(`[fetch-urls] Successfully fetched ${successfulFetches.length}/${urls.length} URLs`);

    return {
      urls,
      prompt: prompt || null,
      fetchResults,
    };
  },
});

// Step 2: Quick title and emoji generation (for immediate UI feedback)
const generateQuickMetadataStep = new Step({
  id: "generate-quick-metadata",
  description: "Generates quick title and emoji for immediate UI feedback",
  inputSchema: urlFetchSchema,
  outputSchema: quickMetadataSchema,
  execute: async ({ context }) => {
    const fetchData = context?.steps?.["fetch-urls"];
    
    if (!fetchData || fetchData.status !== 'success') {
      throw new Error("Fetch data not found or failed");
    }

    const { urls, prompt, fetchResults } = fetchData.output;
    const successfulFetches = fetchResults.filter((f: any) => f.success);

    console.log(`[generate-quick-metadata] Generating quick metadata for ${urls.length} URLs`);

    if (successfulFetches.length === 0) {
      return {
        quickTitle: `Failed to analyze ${urls.length} URLs`,
        quickEmoji: "❌",
        quickDescription: "All URL fetches failed",
      };
    }

    // Generate quick title and emoji based on the first successful fetch
    const firstUrl = successfulFetches[0];
    const quickTitle = firstUrl.title || extractDomainFromUrl(firstUrl.url);
    const quickEmoji = generateQuickEmoji(firstUrl.content, urls);
    
    // Generate quick description
    const quickDescription = prompt 
      ? `Analysis of ${urls.length} URL${urls.length > 1 ? 's' : ''} based on: "${prompt}"`
      : `Analysis of ${urls.length} web page${urls.length > 1 ? 's' : ''}`;

    // Generate some quick topic suggestions
    const suggestedTopics = extractQuickTopics(successfulFetches);

    return {
      quickTitle,
      quickEmoji,
      quickDescription,
      suggestedTopics,
    };
  },
});

// Step 3: Detailed analysis of each URL
const detailedAnalysisStep = new Step({
  id: "detailed-analysis",
  description: "Performs detailed analysis of each URL content",
  inputSchema: urlFetchSchema,
  outputSchema: detailedAnalysisSchema,
  execute: async ({ context }) => {
    const fetchData = context?.steps?.["fetch-urls"];
    
    if (!fetchData || fetchData.status !== 'success') {
      throw new Error("Fetch data not found or failed");
    }

    const { urls, prompt, fetchResults } = fetchData.output;
    const successfulFetches = fetchResults.filter((f: any) => f.success);

    console.log(`[detailed-analysis] Analyzing ${successfulFetches.length} URLs in detail`);

    // Analyze each URL individually with full analysis
      const urlAnalyses = await Promise.all(
      successfulFetches.map(async (fetchedUrl: any) => {
          try {
            const userMessage = prompt 
            ? `Analyze this website content in detail and identify any related or referenced URLs: ${fetchedUrl.url}\n\nContent: ${fetchedUrl.content}\n\nSpecific request: ${prompt}` 
            : `Analyze this website content in detail and identify any related or referenced URLs: ${fetchedUrl.url}\n\nContent: ${fetchedUrl.content}`;

          console.log(`[detailed-analysis] Analyzing URL: ${fetchedUrl.url}`);

            const response = await websAgent.generate([
              {
                role: "user",
                content: userMessage,
              },
            ]);

          console.log(`[detailed-analysis] Got response for URL: ${fetchedUrl.url}`);

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
              
              const analysisData = JSON.parse(jsonText);
              
              return {
              url: fetchedUrl.url,
                ...analysisData,
              relatedUrls: analysisData.relatedUrls || [],
              };
            } catch (parseError) {
            console.error(`[detailed-analysis] Failed to parse JSON for ${fetchedUrl.url}:`, parseError);
              return null;
            }
          } catch (error) {
          console.error(`[detailed-analysis] Failed to analyze ${fetchedUrl.url}:`, error);
            return null;
          }
        })
      );

      const successfulAnalyses = urlAnalyses.filter(Boolean);
    const failedCount = urlAnalyses.length - successfulAnalyses.length;

      if (successfulAnalyses.length === 0) {
      throw new Error("All detailed analyses failed");
    }

    return {
      urlAnalyses: successfulAnalyses,
      successfulCount: successfulAnalyses.length,
      failedCount,
    };
  },
});

// Step 4: Enhanced combination and cross-URL analysis
const enhancedCombineStep = new Step({
  id: "enhanced-combine",
  description: "Combines analysis results with enhanced insights and cross-URL connections",
  inputSchema: detailedAnalysisSchema,
  outputSchema: combinedAnalysisSchema,
  execute: async ({ context }) => {
    const analysisData = context?.steps?.["detailed-analysis"];
    
    if (!analysisData || analysisData.status !== 'success') {
      throw new Error("Analysis data not found or failed");
      }

    const { urlAnalyses } = analysisData.output;

    console.log(`[enhanced-combine] Combining and enhancing ${urlAnalyses.length} analyses`);

    // Basic combination
    const basicCombination = {
      topics: [...new Set(urlAnalyses.flatMap((a: any) => a?.topics || []))].filter((topic): topic is string => typeof topic === 'string'),
      sentiment: determineCombinedSentiment(urlAnalyses),
      insights: combineInsights(urlAnalyses),
      entities: combineEntities(urlAnalyses),
      readingTime: urlAnalyses.reduce((sum: number, a: any) => sum + (a?.readingTime || 0), 0),
      confidence: urlAnalyses.reduce((sum: number, a: any) => sum + (a?.confidence || 0), 0) / urlAnalyses.length,
      relatedUrls: [...new Set(urlAnalyses.flatMap((a: any) => a?.relatedUrls || []))].filter((url): url is string => typeof url === 'string'),
    };

    // Enhanced insights - identify patterns across URLs
    const enhancedInsights = generateEnhancedInsights(urlAnalyses);
    
    // Cross-URL connections - identify relationships between different URLs
    const crossUrlConnections = findCrossUrlConnections(urlAnalyses);

    return {
      ...basicCombination,
      enhancedInsights,
      crossUrlConnections,
    };
  },
});

// Step 5: Final assembly with enhanced title generation
const finalAssemblyStep = new Step({
  id: "final-assembly",
  description: "Assembles final result with enhanced title generation",
  inputSchema: combinedAnalysisSchema,
  outputSchema: analysisResultSchema,
  execute: async ({ context }) => {
    const fetchData = context?.steps?.["fetch-urls"];
    const quickData = context?.steps?.["generate-quick-metadata"];
    const analysisData = context?.steps?.["detailed-analysis"];
    const combinedData = context?.steps?.["enhanced-combine"];
    
    if (!fetchData || fetchData.status !== 'success' || 
        !quickData || quickData.status !== 'success' ||
        !analysisData || analysisData.status !== 'success' || 
        !combinedData || combinedData.status !== 'success') {
      throw new Error("Required step data not found or failed");
    }

    const { urls, prompt } = fetchData.output;
    const { quickTitle, quickEmoji } = quickData.output;
    const { urlAnalyses } = analysisData.output;

    console.log(`[final-assembly] Assembling final result with enhanced title generation`);

    // Use enhanced title generation or fall back to quick title
    const enhancedTitle = generateEnhancedTitle(urlAnalyses, prompt) || quickTitle;
    const finalEmoji = selectBestEmoji(urlAnalyses) || quickEmoji;

    const finalResult = {
        urls,
        prompt: prompt || null,
      title: enhancedTitle,
        description: prompt 
          ? `Analysis of ${urls.length} URLs based on: "${prompt}"`
          : `Combined analysis of ${urls.length} web pages`,
      ...combinedData.output,
      emoji: finalEmoji,
      urlAnalyses,
        metadata: {
          timestamp: new Date().toISOString(),
          urlCount: urls.length,
        processingSteps: ['fetch-urls', 'generate-quick-metadata', 'detailed-analysis', 'enhanced-combine', 'final-assembly'],
        },
      };

    return finalResult;
  },
});

// Helper functions
function extractTitleFromContent(content: string): string | undefined {
  // Simple title extraction - could be enhanced
  const titleMatch = content.match(/<title[^>]*>([^<]+)<\/title>/i);
  return titleMatch ? titleMatch[1].trim() : undefined;
}

function extractDomainFromUrl(url: string): string {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return url;
  }
}

function generateQuickEmoji(content: string, urls: string[]): string {
  // Quick emoji generation based on content keywords
  const contentLower = content.toLowerCase();
  
  if (contentLower.includes('news') || contentLower.includes('article')) return "📰";
  if (contentLower.includes('tech') || contentLower.includes('ai') || contentLower.includes('software')) return "💻";
  if (contentLower.includes('business') || contentLower.includes('finance')) return "💼";
  if (contentLower.includes('research') || contentLower.includes('study')) return "🔬";
  if (contentLower.includes('education') || contentLower.includes('learn')) return "📚";
  if (contentLower.includes('sports') || contentLower.includes('game')) return "⚽";
  if (urls.length > 1) return "🌐";
  
  return "📄";
}

function extractQuickTopics(fetchResults: any[]): string[] {
  // Quick topic extraction from titles and domains
  const topics = new Set<string>();
  
  fetchResults.forEach(result => {
    if (result.title) {
      // Extract words from title
      const words = result.title.split(/\s+/).filter((word: string) => word.length > 3);
      words.slice(0, 3).forEach((word: string) => topics.add(word.toLowerCase()));
    }
    
    // Add domain as topic
    const domain = extractDomainFromUrl(result.url);
    if (domain) topics.add(domain);
  });
  
  return Array.from(topics).slice(0, 5);
}

function generateEnhancedInsights(urlAnalyses: any[]): string[] {
  // Generate insights that span across multiple URLs
  const insights: string[] = [];
  
  if (urlAnalyses.length > 1) {
    const commonTopics = findCommonTopics(urlAnalyses);
    if (commonTopics.length > 0) {
      insights.push(`Common themes across all URLs: ${commonTopics.join(', ')}`);
    }
    
    const sentimentVariation = analyzeSentimentVariation(urlAnalyses);
    if (sentimentVariation) {
      insights.push(sentimentVariation);
    }
  }
  
  return insights;
}

function findCrossUrlConnections(urlAnalyses: any[]): Array<{urls: string[], connection: string, strength: number}> {
  const connections: Array<{urls: string[], connection: string, strength: number}> = [];
  
  // Find URLs that share entities or topics
  for (let i = 0; i < urlAnalyses.length; i++) {
    for (let j = i + 1; j < urlAnalyses.length; j++) {
      const url1 = urlAnalyses[i];
      const url2 = urlAnalyses[j];
      
      const sharedTopics = (url1.topics || []).filter((topic: string) => 
        (url2.topics || []).includes(topic)
      );
      
      if (sharedTopics.length > 0) {
        connections.push({
          urls: [url1.url, url2.url],
          connection: `Shared topics: ${sharedTopics.join(', ')}`,
          strength: sharedTopics.length / Math.max(url1.topics?.length || 1, url2.topics?.length || 1),
        });
      }
    }
  }
  
  return connections;
}

function generateEnhancedTitle(urlAnalyses: any[], prompt?: string): string | undefined {
  if (prompt) {
    return `${prompt} - Analysis Results`;
  }
  
  if (urlAnalyses.length === 1) {
    return urlAnalyses[0].title;
  }
  
  // Find the most common topic across URLs
  const allTopics = urlAnalyses.flatMap(a => a.topics || []);
  const topicCounts = allTopics.reduce((acc, topic) => {
    acc[topic] = (acc[topic] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const mostCommonTopic = Object.entries(topicCounts)
    .sort(([,a], [,b]) => (b as number) - (a as number))[0]?.[0];
  
  if (mostCommonTopic) {
    return `Analysis: ${mostCommonTopic} and Related Topics`;
  }
  
  return undefined;
}

function selectBestEmoji(urlAnalyses: any[]): string | undefined {
  // Select the most appropriate emoji from all analyses
  const emojis = urlAnalyses.map(a => a.emoji).filter(Boolean);
  if (emojis.length > 0) {
    // Return the first emoji for now - could be enhanced with voting logic
    return emojis[0];
  }
  return undefined;
}

function findCommonTopics(urlAnalyses: any[]): string[] {
  if (urlAnalyses.length < 2) return [];
  
  const firstTopics = new Set(urlAnalyses[0].topics || []);
  return urlAnalyses.slice(1).reduce((common, analysis) => {
    const currentTopics = new Set(analysis.topics || []);
    return common.filter((topic: string) => currentTopics.has(topic));
  }, Array.from(firstTopics));
}

function analyzeSentimentVariation(urlAnalyses: any[]): string | null {
  const sentiments = urlAnalyses.map(a => a.sentiment).filter(Boolean);
  const uniqueSentiments = [...new Set(sentiments)];
  
  if (uniqueSentiments.length > 1) {
    return `Sentiment varies across URLs: ${uniqueSentiments.join(', ')}`;
  }
  
  return null;
}

// Existing helper functions
function determineCombinedSentiment(analyses: any[]): "positive" | "neutral" | "negative" {
  const sentiments = analyses.map(a => a?.sentiment).filter(Boolean);
  const sentimentCounts = sentiments.reduce((acc, sentiment) => {
    acc[sentiment] = (acc[sentiment] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sortedSentiments = Object.entries(sentimentCounts).sort(([, a], [, b]) => (b as number) - (a as number));
  return (sortedSentiments[0]?.[0] as any) || "neutral";
}

function combineInsights(analyses: any[]): string[] {
  const allInsights = analyses.flatMap(a => a?.insights || []);
  return [...new Set(allInsights)].slice(0, 10);
}

function combineEntities(analyses: any[]): Array<{ type: string; value: string }> {
  const allEntities = analyses.flatMap(a => a?.entities || []);
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
  .step(fetchUrlsStep)
  .then(generateQuickMetadataStep)
  .then(detailedAnalysisStep)
  .then(enhancedCombineStep)
  .then(finalAssemblyStep)
  .commit();