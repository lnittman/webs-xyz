import { z } from "zod";

// Input schema for the fetch step
export const fetchInputSchema = z.object({
  urls: z.array(z.string().url()).describe("The URLs to analyze"),
  prompt: z.string().nullable().optional().describe("Optional prompt for specific analysis"),
  webId: z.string().optional().describe("The web ID to update in database"),
});

// Output schema for the fetch step
export const fetchOutputSchema = z.object({
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