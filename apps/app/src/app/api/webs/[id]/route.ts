import { NextRequest, NextResponse } from 'next/server';

// Mock data - same as in the main route
const mockWebs = [
  {
    id: '1',
    url: 'https://github.com/microsoft/TypeScript',
    domain: 'github.com',
    title: 'TypeScript - JavaScript with syntax for types',
    description: 'TypeScript is a strongly typed programming language that builds on JavaScript, giving you better tooling at any scale.',
    prompt: 'Summarize the key features',
    status: 'COMPLETE' as const,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
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
    createdAt: new Date(Date.now() - 3600000).toISOString(),
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
    createdAt: new Date(Date.now() - 300000).toISOString(),
    updatedAt: new Date(Date.now() - 300000).toISOString(),
    messages: []
  }
];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // TODO: Replace with actual database query
    // const web = await db.web.findUnique({
    //   where: { id },
    //   include: { messages: true }
    // });

    const web = mockWebs.find(w => w.id === id);

    if (!web) {
      return NextResponse.json(
        { error: 'Web not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(web);
  } catch (error) {
    console.error('Error fetching web:', error);
    return NextResponse.json(
      { error: 'Failed to fetch web' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const updates = await request.json();

    // TODO: Replace with actual database update
    // const web = await db.web.update({
    //   where: { id },
    //   data: updates,
    //   include: { messages: true }
    // });

    const webIndex = mockWebs.findIndex(w => w.id === id);
    if (webIndex === -1) {
      return NextResponse.json(
        { error: 'Web not found' },
        { status: 404 }
      );
    }

    const updatedWeb = {
      ...mockWebs[webIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    mockWebs[webIndex] = updatedWeb;

    return NextResponse.json(updatedWeb);
  } catch (error) {
    console.error('Error updating web:', error);
    return NextResponse.json(
      { error: 'Failed to update web' },
      { status: 500 }
    );
  }
} 