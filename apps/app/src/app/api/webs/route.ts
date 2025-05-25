import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Mock data for now - replace with actual database calls
const mockWebs = [
  {
    id: '1',
    url: 'https://github.com/microsoft/TypeScript',
    domain: 'github.com',
    title: 'TypeScript - JavaScript with syntax for types',
    description: 'TypeScript is a strongly typed programming language that builds on JavaScript, giving you better tooling at any scale.',
    prompt: 'Summarize the key features',
    status: 'COMPLETE' as const,
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    messages: [
      {
        id: 'm1',
        webId: '1',
        type: 'AI' as const,
        content: 'Processing GitHub repository...',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      }
    ]
  },
  {
    id: '2',
    url: 'https://nextjs.org/docs',
    domain: 'nextjs.org',
    title: 'Next.js Documentation',
    description: 'Learn about Next.js features and API.',
    prompt: null,
    status: 'COMPLETE' as const,
    createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
    messages: []
  },
  {
    id: '3',
    url: 'https://tailwindcss.com',
    domain: 'tailwindcss.com',
    title: null,
    description: null,
    prompt: 'Explain the utility-first approach',
    status: 'PROCESSING' as const,
    createdAt: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
    updatedAt: new Date(Date.now() - 300000).toISOString(),
    messages: []
  }
];

const createWebSchema = z.object({
  workspaceId: z.string(),
  url: z.string().url(),
  prompt: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspaceId') || 'default';

    // TODO: Replace with actual database query
    // const webs = await db.web.findMany({
    //   where: { workspaceId },
    //   include: { messages: true },
    //   orderBy: { createdAt: 'desc' }
    // });

    return NextResponse.json(mockWebs);
  } catch (error) {
    console.error('Error fetching webs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch webs' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { workspaceId, url, prompt } = createWebSchema.parse(body);

    // Extract domain from URL
    const domain = new URL(url).hostname.replace('www.', '');

    // TODO: Replace with actual database creation
    // const web = await db.web.create({
    //   data: {
    //     url,
    //     domain,
    //     prompt,
    //     workspaceId,
    //     status: 'PENDING'
    //   },
    //   include: { messages: true }
    // });

    // Mock response
    const newWeb = {
      id: Math.random().toString(36).substr(2, 9),
      url,
      domain,
      title: null,
      description: null,
      prompt: prompt || null,
      status: 'PENDING' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: []
    };

    // TODO: Trigger AI processing
    // await triggerWebProcessing(web.id);

    return NextResponse.json(newWeb, { status: 201 });
  } catch (error) {
    console.error('Error creating web:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create web' },
      { status: 500 }
    );
  }
} 