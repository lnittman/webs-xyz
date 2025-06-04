import { z } from "zod";

// Input schema for the detailed-analysis step (receives output from fetch-urls)
export const detailedAnalysisInputSchema = z.object({
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

// Schema for single URL analysis
export const singleUrlAnalysisSchema = z.object({
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

// Output schema for the detailed-analysis step
export const detailedAnalysisOutputSchema = z.object({
  urlAnalyses: z.array(singleUrlAnalysisSchema),
  successfulCount: z.number(),
  failedCount: z.number(),
}); 