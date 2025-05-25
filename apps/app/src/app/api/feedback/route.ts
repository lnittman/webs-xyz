import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Validation schema for feedback submission
const feedbackSchema = z.object({
  topic: z.enum(['bug', 'feature', 'ui', 'performance', 'general']),
  message: z.string().min(1).max(2000),
});

// Map frontend topic values to database enum values
const topicMapping = {
  'bug': 'BUG',
  'feature': 'FEATURE',
  'ui': 'UI',
  'performance': 'PERFORMANCE',
  'general': 'GENERAL',
} as const;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { topic, message } = feedbackSchema.parse(body);

    // Get additional context
    const userAgent = request.headers.get('user-agent');
    const referer = request.headers.get('referer');

    // TODO: Get user ID from authentication context
    // const userId = await getCurrentUserId(request);

    // TODO: Replace with actual database call
    // const feedback = await db.feedback.create({
    //   data: {
    //     topic: topicMapping[topic],
    //     message,
    //     userAgent,
    //     url: referer,
    //     userId,
    //     status: 'OPEN'
    //   }
    // });

    // Mock response for now
    const feedback = {
      id: Math.random().toString(36).substr(2, 9),
      topic: topicMapping[topic],
      message,
      userAgent,
      url: referer,
      userId: null,
      status: 'OPEN',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    console.log('Feedback submitted:', {
      topic: topicMapping[topic],
      message: message.substring(0, 100) + (message.length > 100 ? '...' : ''),
      userAgent,
      url: referer,
    });

    return NextResponse.json(
      { 
        success: true, 
        id: feedback.id,
        message: 'Feedback submitted successfully' 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error submitting feedback:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid feedback data', 
          details: error.errors 
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to submit feedback' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const topic = searchParams.get('topic');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // TODO: Replace with actual database query
    // const feedback = await db.feedback.findMany({
    //   where: {
    //     ...(topic && { topic: topicMapping[topic as keyof typeof topicMapping] }),
    //     ...(status && { status: status.toUpperCase() }),
    //   },
    //   orderBy: { createdAt: 'desc' },
    //   take: limit,
    //   skip: offset,
    // });

    // Mock response for now
    const mockFeedback = [
      {
        id: '1',
        topic: 'BUG',
        message: 'The URL detection is not working properly when I paste multiple URLs.',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        url: 'http://localhost:3000',
        userId: null,
        status: 'OPEN',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: '2',
        topic: 'FEATURE',
        message: 'It would be great to have keyboard shortcuts for common actions.',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        url: 'http://localhost:3000',
        userId: null,
        status: 'IN_PROGRESS',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        updatedAt: new Date(Date.now() - 1800000).toISOString(),
      },
    ];

    const filteredFeedback = mockFeedback.filter(item => {
      if (topic && item.topic !== topicMapping[topic as keyof typeof topicMapping]) {
        return false;
      }
      if (status && item.status !== status.toUpperCase()) {
        return false;
      }
      return true;
    });

    return NextResponse.json({
      feedback: filteredFeedback.slice(offset, offset + limit),
      total: filteredFeedback.length,
      hasMore: offset + limit < filteredFeedback.length,
    });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    return NextResponse.json(
      { error: 'Failed to fetch feedback' },
      { status: 500 }
    );
  }
} 