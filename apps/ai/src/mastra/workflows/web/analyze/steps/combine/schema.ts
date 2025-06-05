import { z } from "zod";

// Schema for single URL analysis (reused from analysis step)
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

// Schema for quick metadata from metadata step
const quickMetadataSchema = z.object({
  quickTitle: z.string().optional(),
  quickEmoji: z.string().optional(),
  quickDescription: z.string().optional(),
  suggestedTopics: z.array(z.string()).optional(),
});

// Input schema for the final combine step (receives output from fetch, metadata, and analysis)
export const combineInputSchema = z.object({
  urls: z.array(z.string()),
  prompt: z.string().nullable(),
  quickMetadata: quickMetadataSchema,
  urlAnalyses: z.array(singleUrlAnalysisSchema),
});

// Output schema for the final combine step (matches database Web model)
export const combineOutputSchema = z.object({
  urls: z.array(z.string()),
  prompt: z.string().nullable(),
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
  fullDescription: z.string().describe("Comprehensive long-form analysis of the web content"),
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