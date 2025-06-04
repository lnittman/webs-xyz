import { createStep } from "@mastra/core/workflows";

import { fetchInputSchema, fetchOutputSchema } from "./schemas";

import { logStep, logError, logTiming } from "../../../../../utils/logger";

// Helper function to extract title from content
function extractTitleFromContent(content: string): string | undefined {
  const titleMatch = content.match(/<title[^>]*>([^<]+)<\/title>/i);
  return titleMatch ? titleMatch[1].trim() : undefined;
}

// Helper function to scrape URL using Jina manually
async function scrapeUrlWithJina(url: string) {
  try {
    // Construct the Jina.ai scraping URL
    const jinaUrl = `https://r.jina.ai/${url}`;
    
    // Make the request to Jina.ai
    const response = await fetch(jinaUrl, {
      method: 'GET',
      headers: {
        'Accept': 'text/plain',
        // Add API key if available in environment
        ...(process.env.JINA_API_KEY && {
          'Authorization': `Bearer ${process.env.JINA_API_KEY}`
        })
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to scrape URL: ${response.status} ${response.statusText}`);
    }

    // Get the scraped content
    const content = await response.text();
    
    // Extract title and description from the content if possible
    // Jina.ai typically returns markdown-formatted content
    const titleMatch = content.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1] : extractTitleFromContent(content);
    
    // Look for meta description in the content
    const descriptionMatch = content.match(/(?:Description|Meta Description):\s*(.+)$/mi);
    const description = descriptionMatch ? descriptionMatch[1] : undefined;

    return {
      content,
      title,
      description,
    };
  } catch (error) {
    return {
      content: '',
      error: error instanceof Error ? error.message : 'Unknown error occurred while scraping',
    };
  }
}

// Step 1: Async fetch URLs using Jina reader
export const fetchStep = createStep({
  id: "fetch",
  description: "Fetches content from URLs in parallel using Jina reader",
  inputSchema: fetchInputSchema,
  outputSchema: fetchOutputSchema,
  execute: async ({ inputData, mastra, getStepResult, getInitData, runtimeContext }) => {
    const stepStartTime = Date.now();
    logStep("fetch", "🚀", "Starting URL fetch step");
    
    try {
      const { urls, prompt } = inputData;

      logStep("fetch", "📋", `Parsed input - ${urls.length} URLs to fetch`, {
        urls,
        prompt: prompt || "No specific prompt provided",
        urlCount: urls.length
      });

      // Fetch all URLs in parallel using manual Jina API calls
      logStep("fetch", "🌐", "Starting parallel URL fetching");
      const fetchPromises = urls.map(async (url, index) => {
        const urlStartTime = Date.now();
        logStep("fetch", "📡", `[${index + 1}/${urls.length}] Starting fetch for: ${url}`);
        
        try {
          // Use manual Jina scraping instead of the tool
          const result = await scrapeUrlWithJina(url);

          const processingTime = Date.now() - urlStartTime;
          
          if (result.error) {
            logError("fetch", `[${index + 1}/${urls.length}] Scraping failed for ${url}`, {
              error: result.error,
              processingTime
            });
            
            return {
              url,
              success: false,
              error: result.error,
              metadata: {
                processingTime,
              },
            };
          }

          const content = result.content || '';
          const title = result.title;
          
          logStep("fetch", "✅", `[${index + 1}/${urls.length}] Successfully fetched: ${url}`, {
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
          logError("fetch", `[${index + 1}/${urls.length}] Failed to fetch ${url}`, {
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

      logStep("fetch", "📊", "Fetch results summary", {
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

      logTiming("fetch", stepStartTime, "Fetch step completed");
      logStep("fetch", "🎯", "Step output prepared", {
        resultKeys: Object.keys(result),
        fetchResultsCount: fetchResults.length
      });

      return result;
    } catch (error) {
      logError("fetch", "Step failed", error);
      logTiming("fetch", stepStartTime, "Step failed");
      throw error;
    }
  },
});

// Export everything for easy access
export * from "./schemas"; 