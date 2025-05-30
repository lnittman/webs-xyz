import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const scrapeWithJina = createTool({
  id: "scrape-web-content-jina",
  description: "Scrapes web content from a given URL using the r.jina.ai service",
  inputSchema: z.object({
    url: z.string().url().describe("The URL to scrape content from"),
  }),
  outputSchema: z.object({
    content: z.string().describe("The scraped content from the webpage"),
    title: z.string().optional().describe("The title of the webpage"),
    description: z.string().optional().describe("The meta description of the webpage"),
    error: z.string().optional().describe("Error message if scraping failed"),
  }),
  execute: async (params) => {
    // Extract context from the first parameter
    const { context } = params;
    const { url } = context;
    
    console.log("[scrape-with-jina] Scraping URL:", url);
    
    try {
      // Construct the Jina.ai scraping URL
      const jinaUrl = `https://r.jina.ai/${url}`;
      console.log("[scrape-with-jina] Jina URL:", jinaUrl);
      
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
      const title = titleMatch ? titleMatch[1] : undefined;
      
      // Look for meta description in the content
      const descriptionMatch = content.match(/(?:Description|Meta Description):\s*(.+)$/mi);
      const description = descriptionMatch ? descriptionMatch[1] : undefined;

      console.log("[scrape-with-jina] Successfully scraped content, length:", content.length);

      return {
        content,
        title,
        description,
      };
    } catch (error) {
      console.error('[scrape-with-jina] Error scraping with Jina:', error);
      return {
        content: '',
        error: error instanceof Error ? error.message : 'Unknown error occurred while scraping',
      };
    }
  },
});