import z from "zod";

// Define the workflow input schema
export const analyzeWebInputSchema = z.object({
  urls: z.array(z.string().url()).describe("The URLs to analyze"),
  prompt: z.string().nullable().optional().describe("Optional prompt for specific analysis"),
  webId: z.string().optional().describe("The web ID to update in database"),
});

// Define the workflow output schema (matches combineStep output)
export const analyzeWebOutputSchema = z.object({
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
  urlAnalyses: z.array(z.any()), // Simplified for now
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