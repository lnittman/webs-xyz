import { database } from '@repo/database';

/**
 * Update a web record with analysis results
 */
export async function updateWebWithAnalysis(webId: string, analysisResult: any) {
  return await database.web.update({
    where: { id: webId },
    data: {
      status: 'COMPLETE',
      title: analysisResult.title,
      description: analysisResult.description,
      analysis: analysisResult,
      topics: analysisResult.topics,
      sentiment: analysisResult.sentiment,
      confidence: analysisResult.confidence,
      readingTime: analysisResult.readingTime,
      insights: analysisResult.insights,
      relatedUrls: analysisResult.relatedUrls,
      emoji: analysisResult.emoji,
      entities: {
        create: analysisResult.entities?.map((entity: any) => ({
          type: entity.type,
          value: entity.value,
        })) || [],
      },
    },
  });
}

/**
 * Mark a web record as failed
 */
export async function markWebAsFailed(webId: string) {
  return await database.web.update({
    where: { id: webId },
    data: { status: 'FAILED' },
  });
}

/**
 * Get a web record by ID
 */
export async function getWebById(webId: string) {
  return await database.web.findUnique({
    where: { id: webId },
    include: {
      entities: true,
    },
  });
} 