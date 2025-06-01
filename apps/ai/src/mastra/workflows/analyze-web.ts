import { Workflow, Step } from "@mastra/core/workflows";
import { z } from "zod";

import { websAgent } from "../agents/webs";

// Helper function for consistent logging
function logStep(stepName: string, emoji: string, message: string, data?: any) {
  const timestamp = new Date().toISOString().split('T')[1].slice(0, 8);
  console.log(`[${timestamp}] ${emoji} [${stepName.toUpperCase()}] ${message}`);
  if (data) {
    console.log(`[${timestamp}] ${emoji} [${stepName.toUpperCase()}] Data:`, JSON.stringify(data, null, 2));
  }
}

function logError(stepName: string, error: any, context?: any) {
  const timestamp = new Date().toISOString().split('T')[1].slice(0, 8);
  console.error(`[${timestamp}] ❌ [${stepName.toUpperCase()}] ERROR:`, error);
  if (context) {
    console.error(`[${timestamp}] ❌ [${stepName.toUpperCase()}] Context:`, context);
  }
}

function logTiming(stepName: string, startTime: number, message?: string) {
  const duration = Date.now() - startTime;
  const timestamp = new Date().toISOString().split('T')[1].slice(0, 8);
  console.log(`[${timestamp}] ⏱️  [${stepName.toUpperCase()}] ${message || 'Completed'} - Duration: ${duration}ms`);
}

// Input schema for the workflow
const analyzeWebInputSchema = z.object({
  urls: z.array(z.string().url()).describe("The URLs to analyze"),
  prompt: z.string().nullable().optional().describe("Optional prompt for specific analysis"),
  webId: z.string().optional().describe("The web ID to update in database"),
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
    const stepStartTime = Date.now();
    logStep("fetch-urls", "🚀", "Starting URL fetch step");
    
    try {
    // Handle nested triggerData structure
    const triggerData = context?.triggerData?.triggerData || context?.triggerData;
      
      logStep("fetch-urls", "📥", "Processing trigger data", { 
        hasContext: !!context,
        hasTriggerData: !!triggerData,
        triggerDataKeys: triggerData ? Object.keys(triggerData) : []
      });
    
    if (!triggerData) {
        logError("fetch-urls", "Trigger data not found", { context });
      throw new Error("Trigger data not found");
    }

    const parsedData = analyzeWebInputSchema.parse(triggerData);
    const { urls, prompt } = parsedData;

      logStep("fetch-urls", "📋", `Parsed input - ${urls.length} URLs to fetch`, {
        urls,
        prompt: prompt || "No specific prompt provided",
        urlCount: urls.length
      });

      // Fetch all URLs in parallel using the webs agent's Jina tool
      logStep("fetch-urls", "🌐", "Starting parallel URL fetching");
      const fetchPromises = urls.map(async (url, index) => {
        const urlStartTime = Date.now();
        logStep("fetch-urls", "📡", `[${index + 1}/${urls.length}] Starting fetch for: ${url}`);
        
        try {
          // Use the websAgent's scrapeWithJina tool
          const response = await websAgent.generate([
            {
              role: "user",
              content: `Please scrape this URL and return just the raw content: ${url}. Only use the scrape-web-content-jina tool.`,
            },
          ]);

          const processingTime = Date.now() - urlStartTime;
          const content = response.text || '';
          const title = extractTitleFromContent(content);
          
          logStep("fetch-urls", "✅", `[${index + 1}/${urls.length}] Successfully fetched: ${url}`, {
            contentLength: content.length,
            hasTitle: !!title,
            title: title?.substring(0, 100),
            processingTime
          });
          
          return {
            url,
            success: true,
            content,
            title,
            metadata: {
              contentLength: content.length,
              processingTime,
            },
          };
        } catch (error) {
          const processingTime = Date.now() - urlStartTime;
          logError("fetch-urls", `[${index + 1}/${urls.length}] Failed to fetch ${url}`, {
            error: error instanceof Error ? error.message : 'Unknown error',
            processingTime
          });
          
          return {
            url,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            metadata: {
              processingTime,
            },
          };
        }
      });

      const fetchResults = await Promise.all(fetchPromises);
      const successfulFetches = fetchResults.filter(f => f.success);
      const failedFetches = fetchResults.filter(f => !f.success);

      logStep("fetch-urls", "📊", "Fetch results summary", {
        totalUrls: urls.length,
        successful: successfulFetches.length,
        failed: failedFetches.length,
        successRate: `${Math.round((successfulFetches.length / urls.length) * 100)}%`,
        failedUrls: failedFetches.map(f => f.url)
      });

      const result = {
        urls,
        prompt: prompt || null,
        fetchResults,
      };

      logTiming("fetch-urls", stepStartTime, "Fetch step completed");
      logStep("fetch-urls", "🎯", "Step output prepared", {
        resultKeys: Object.keys(result),
        fetchResultsCount: fetchResults.length
      });

      return result;
    } catch (error) {
      logError("fetch-urls", "Step failed", error);
      logTiming("fetch-urls", stepStartTime, "Step failed");
      throw error;
    }
  },
});

// Step 2: Generate quick metadata for immediate UI feedback
const generateQuickMetadataStep = new Step({
  id: "generate-quick-metadata",
  description: "Generates quick title, emoji, and description for immediate UI feedback",
  inputSchema: urlFetchSchema,
  outputSchema: quickMetadataSchema,
  execute: async ({ context }) => {
    const stepStartTime = Date.now();
    logStep("quick-metadata", "⚡", "Starting quick metadata generation");
    
    try {
      const fetchData = context?.steps?.["fetch-urls"];
      const triggerData = context?.triggerData?.triggerData || context?.triggerData;
      const webId = triggerData?.webId;
      
      logStep("quick-metadata", "🔍", "Checking fetch step data", {
        hasFetchData: !!fetchData,
        fetchStatus: fetchData?.status,
        fetchDataKeys: fetchData ? Object.keys(fetchData) : [],
        hasWebId: !!webId,
        webId
      });
      
      if (!fetchData || fetchData.status !== 'success') {
        logError("quick-metadata", "Fetch data not found or failed", { fetchData });
        throw new Error("Fetch data not found or failed");
      }

      const { urls, prompt, fetchResults } = fetchData.output;
      const successfulFetches = fetchResults.filter((f: any) => f.success);

      logStep("quick-metadata", "📝", "Processing fetch results", {
        totalUrls: urls.length,
        successfulFetches: successfulFetches.length,
        hasPrompt: !!prompt,
        prompt: prompt?.substring(0, 100)
      });

      if (successfulFetches.length === 0) {
        logStep("quick-metadata", "⚠️", "No successful fetches, returning error metadata");
        const errorResult = {
          quickTitle: `Failed to analyze ${urls.length} URLs`,
          quickEmoji: "❌",
          quickDescription: "All URL fetches failed",
        };
        logStep("quick-metadata", "📤", "Error metadata generated", errorResult);
        return errorResult;
      }

      // Generate quick title and emoji based on the first successful fetch
      const firstUrl = successfulFetches[0];
      logStep("quick-metadata", "🎯", "Using first successful fetch for quick metadata", {
        url: firstUrl.url,
        hasTitle: !!firstUrl.title,
        contentLength: firstUrl.content?.length || 0
      });

      const quickTitle = firstUrl.title || extractDomainFromUrl(firstUrl.url);
      const quickEmoji = generateQuickEmoji(firstUrl.content, urls);
      
      // Generate quick description
      const quickDescription = prompt 
        ? `Analysis of ${urls.length} URL${urls.length > 1 ? 's' : ''} based on: "${prompt}"`
        : `Analysis of ${urls.length} web page${urls.length > 1 ? 's' : ''}`;

      // Generate some quick topic suggestions
      logStep("quick-metadata", "🏷️", "Extracting quick topics");
      const suggestedTopics = extractQuickTopics(successfulFetches);

      const quickMetadata = {
        quickTitle,
        quickEmoji,
        quickDescription,
        suggestedTopics,
      };

      logStep("quick-metadata", "🎉", "Quick metadata generated successfully", quickMetadata);
      
      // Update database if webId is provided
      if (webId) {
        logStep("quick-metadata", "💾", "Database update will be handled by webhook");
      } else {
        logStep("quick-metadata", "💾", "No webId provided, skipping database update");
      }
      
      logTiming("quick-metadata", stepStartTime);

      return quickMetadata;
    } catch (error) {
      logError("quick-metadata", "Step failed", error);
      logTiming("quick-metadata", stepStartTime, "Step failed");
      throw error;
    }
  },
});

// Step 3: Detailed analysis of each URL
const detailedAnalysisStep = new Step({
  id: "detailed-analysis",
  description: "Performs detailed analysis of each URL content",
  inputSchema: urlFetchSchema,
  outputSchema: detailedAnalysisSchema,
  execute: async ({ context }) => {
    const stepStartTime = Date.now();
    logStep("detailed-analysis", "🧠", "Starting detailed analysis step");
    
    try {
      const fetchData = context?.steps?.["fetch-urls"];
      
      logStep("detailed-analysis", "🔍", "Checking fetch step data", {
        hasFetchData: !!fetchData,
        fetchStatus: fetchData?.status
      });
      
      if (!fetchData || fetchData.status !== 'success') {
        logError("detailed-analysis", "Fetch data not found or failed", { fetchData });
        throw new Error("Fetch data not found or failed");
      }

      const { urls, prompt, fetchResults } = fetchData.output;
      const successfulFetches = fetchResults.filter((f: any) => f.success);

      logStep("detailed-analysis", "📊", "Starting detailed URL analysis", {
        totalUrls: urls.length,
        successfulFetches: successfulFetches.length,
        analysisPrompt: prompt || "General analysis"
      });

      // Analyze each URL individually with full analysis
      const analysisPromises = successfulFetches.map(async (fetchedUrl: any, index: number) => {
        const urlStartTime = Date.now();
        logStep("detailed-analysis", "🔬", `[${index + 1}/${successfulFetches.length}] Starting analysis for: ${fetchedUrl.url}`);
        
          try {
            const userMessage = prompt 
            ? `Analyze this website content in detail and identify any related or referenced URLs: ${fetchedUrl.url}\n\nContent: ${fetchedUrl.content}\n\nSpecific request: ${prompt}` 
            : `Analyze this website content in detail and identify any related or referenced URLs: ${fetchedUrl.url}\n\nContent: ${fetchedUrl.content}`;

          logStep("detailed-analysis", "💬", `[${index + 1}/${successfulFetches.length}] Sending to AI agent`, {
            url: fetchedUrl.url,
            contentLength: fetchedUrl.content?.length || 0,
            hasPrompt: !!prompt
          });

            const response = await websAgent.generate([
              {
                role: "user",
                content: userMessage,
              },
            ]);

          const processingTime = Date.now() - urlStartTime;
          logStep("detailed-analysis", "📝", `[${index + 1}/${successfulFetches.length}] Got AI response`, {
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

// Step 4: Enhanced combination and cross-URL analysis
const enhancedCombineStep = new Step({
  id: "enhanced-combine",
  description: "Combines analysis results with enhanced insights and cross-URL connections",
  inputSchema: detailedAnalysisSchema,
  outputSchema: combinedAnalysisSchema,
  execute: async ({ context }) => {
    const stepStartTime = Date.now();
    logStep("enhanced-combine", "🔗", "Starting enhanced combination step");
    
    try {
      const analysisData = context?.steps?.["detailed-analysis"];
      
      logStep("enhanced-combine", "🔍", "Checking analysis step data", {
        hasAnalysisData: !!analysisData,
        analysisStatus: analysisData?.status
      });
      
      if (!analysisData || analysisData.status !== 'success') {
        logError("enhanced-combine", "Analysis data not found or failed", { analysisData });
        throw new Error("Analysis data not found or failed");
      }

      const { urlAnalyses } = analysisData.output;

      logStep("enhanced-combine", "🧮", "Starting combination process", {
        urlAnalysesCount: urlAnalyses.length,
        urlList: urlAnalyses.map((a: any) => a.url)
      });

      // Basic combination
      logStep("enhanced-combine", "📊", "Performing basic combination");
      const topics = [...new Set(urlAnalyses.flatMap((a: any) => a?.topics || []))].filter((topic): topic is string => typeof topic === 'string');
      const sentiment = determineCombinedSentiment(urlAnalyses);
      const insights = combineInsights(urlAnalyses);
      const entities = combineEntities(urlAnalyses);
      const readingTime = urlAnalyses.reduce((sum: number, a: any) => sum + (a?.readingTime || 0), 0);
      const confidence = urlAnalyses.reduce((sum: number, a: any) => sum + (a?.confidence || 0), 0) / urlAnalyses.length;
      const relatedUrls = [...new Set(urlAnalyses.flatMap((a: any) => a?.relatedUrls || []))].filter((url): url is string => typeof url === 'string');

      const basicCombination = {
        topics,
        sentiment,
        insights,
        entities,
        readingTime,
        confidence,
        relatedUrls,
      };

      logStep("enhanced-combine", "📋", "Basic combination results", {
        topicsCount: topics.length,
        combinedSentiment: sentiment,
        insightsCount: insights.length,
        entitiesCount: entities.length,
        totalReadingTime: readingTime,
        averageConfidence: Math.round(confidence * 100) / 100,
        relatedUrlsCount: relatedUrls.length
      });

      // Enhanced insights - identify patterns across URLs
      logStep("enhanced-combine", "🔮", "Generating enhanced insights");
      const enhancedInsights = generateEnhancedInsights(urlAnalyses);
      
      // Cross-URL connections - identify relationships between different URLs
      logStep("enhanced-combine", "🌐", "Finding cross-URL connections");
      const crossUrlConnections = findCrossUrlConnections(urlAnalyses);

      logStep("enhanced-combine", "🎨", "Enhanced analysis results", {
        enhancedInsightsCount: enhancedInsights.length,
        crossUrlConnectionsCount: crossUrlConnections.length,
        enhancedInsights: enhancedInsights,
        connections: crossUrlConnections.map(c => ({
          urls: c.urls,
          connection: c.connection.substring(0, 100),
          strength: c.strength
        }))
      });

      const result = {
        ...basicCombination,
        enhancedInsights,
        crossUrlConnections,
      };

      logTiming("enhanced-combine", stepStartTime);
      logStep("enhanced-combine", "🎯", "Enhanced combination completed", {
        resultKeys: Object.keys(result)
      });

      return result;
    } catch (error) {
      logError("enhanced-combine", "Step failed", error);
      logTiming("enhanced-combine", stepStartTime, "Step failed");
      throw error;
    }
  },
});

// Step 5: Final assembly with enhanced title generation
const finalAssemblyStep = new Step({
  id: "final-assembly",
  description: "Assembles final result with enhanced title generation",
  inputSchema: combinedAnalysisSchema,
  outputSchema: analysisResultSchema,
  execute: async ({ context }) => {
    const stepStartTime = Date.now();
    logStep("final-assembly", "🏗️", "Starting final assembly step");
    
    try {
      const fetchData = context?.steps?.["fetch-urls"];
      const quickData = context?.steps?.["generate-quick-metadata"];
      const analysisData = context?.steps?.["detailed-analysis"];
      const combinedData = context?.steps?.["enhanced-combine"];
      const triggerData = context?.triggerData?.triggerData || context?.triggerData;
      const webId = triggerData?.webId;
      
      logStep("final-assembly", "🔍", "Checking all step data", {
        fetchStatus: fetchData?.status,
        quickStatus: quickData?.status,
        analysisStatus: analysisData?.status,
        combinedStatus: combinedData?.status,
        hasWebId: !!webId,
        webId
      });
      
      if (!fetchData || fetchData.status !== 'success' || 
          !quickData || quickData.status !== 'success' ||
          !analysisData || analysisData.status !== 'success' || 
          !combinedData || combinedData.status !== 'success') {
        logError("final-assembly", "Required step data not found or failed", {
          fetchData: !!fetchData,
          quickData: !!quickData,
          analysisData: !!analysisData,
          combinedData: !!combinedData
        });
        throw new Error("Required step data not found or failed");
      }

      const { urls, prompt } = fetchData.output;
      const { quickTitle, quickEmoji } = quickData.output;
      const { urlAnalyses } = analysisData.output;

      logStep("final-assembly", "🎨", "Generating enhanced title and emoji", {
        originalQuickTitle: quickTitle,
        originalQuickEmoji: quickEmoji,
        hasPrompt: !!prompt,
        urlAnalysesCount: urlAnalyses.length
      });

      // Use enhanced title generation or fall back to quick title
      const enhancedTitle = generateEnhancedTitle(urlAnalyses, prompt) || quickTitle;
      const finalEmoji = selectBestEmoji(urlAnalyses) || quickEmoji;

      logStep("final-assembly", "✨", "Title and emoji selection", {
        finalTitle: enhancedTitle,
        finalEmoji: finalEmoji,
        titleSource: enhancedTitle === quickTitle ? 'quick' : 'enhanced',
        emojiSource: finalEmoji === quickEmoji ? 'quick' : 'enhanced'
      });

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

      logStep("final-assembly", "🎉", "Final result assembled", {
        resultKeys: Object.keys(finalResult),
        urlCount: finalResult.urls.length,
        title: finalResult.title,
        emoji: finalResult.emoji,
        topicsCount: finalResult.topics.length,
        insightsCount: finalResult.insights.length,
        entitiesCount: finalResult.entities.length,
        enhancedInsightsCount: finalResult.enhancedInsights?.length || 0,
        crossUrlConnectionsCount: finalResult.crossUrlConnections?.length || 0,
        timestamp: finalResult.metadata.timestamp
      });

      // Update database with complete analysis if webId is provided
      if (webId) {
        logStep("final-assembly", "💾", "Database update will be handled by webhook");
      } else {
        logStep("final-assembly", "💾", "No webId provided, skipping final database update");
      }
      
      logTiming("final-assembly", stepStartTime);
      logStep("final-assembly", "🏁", "Workflow completed successfully!");

      return finalResult;
    } catch (error) {
      logError("final-assembly", "Step failed", error);
      logTiming("final-assembly", stepStartTime, "Step failed");
      throw error;
    }
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