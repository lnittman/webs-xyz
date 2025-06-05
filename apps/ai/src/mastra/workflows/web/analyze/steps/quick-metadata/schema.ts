import { z } from "zod";

// Input schema for the generate-quick-metadata step (receives output from fetch-urls)
export const quickMetadataInputSchema = z.object({
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

// Output schema for the generate-metadata step
export const quickMetadataOutputSchema = z.object({
  title: z.string().optional(),
  emoji: z.string().optional(),
  description: z.string().optional(),
  suggestedTopics: z.array(z.string()).optional(),
}); 