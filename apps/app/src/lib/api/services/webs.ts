import { database } from '@repo/database';
import { createWebInputSchema, updateWebInputSchema, Web } from '../schemas/web';

export async function listWebs(workspaceId: string): Promise<Web[]> {
  const webs = await database.web.findMany({
    include: { messages: true },
    orderBy: { createdAt: 'desc' },
  });
  return webs.map(w => ({
    ...w,
    createdAt: w.createdAt.toISOString(),
    updatedAt: w.updatedAt.toISOString(),
    messages: w.messages.map(m => ({
      ...m,
      createdAt: m.createdAt.toISOString(),
    })),
  }));
}

export async function getWebById(id: string): Promise<Web | null> {
  const web = await database.web.findUnique({
    where: { id },
    include: { messages: true },
  });
  if (!web) return null;
  return {
    ...web,
    createdAt: web.createdAt.toISOString(),
    updatedAt: web.updatedAt.toISOString(),
    messages: web.messages.map(m => ({
      ...m,
      createdAt: m.createdAt.toISOString(),
    })),
  };
}

export async function createWeb(input: unknown): Promise<Web> {
  const data = createWebInputSchema.parse(input);
  const domain = new URL(data.url).hostname.replace('www.', '');
  const web = await database.web.create({
    data: {
      url: data.url,
      domain,
      prompt: data.prompt,
      status: 'PENDING',
    },
    include: { messages: true },
  });
  return {
    ...web,
    createdAt: web.createdAt.toISOString(),
    updatedAt: web.updatedAt.toISOString(),
    messages: [],
  };
}

export async function updateWeb(id: string, input: unknown): Promise<Web | null> {
  const data = updateWebInputSchema.parse(input);
  const web = await database.web.update({
    where: { id },
    data,
    include: { messages: true },
  });
  return {
    ...web,
    createdAt: web.createdAt.toISOString(),
    updatedAt: web.updatedAt.toISOString(),
    messages: web.messages.map(m => ({
      ...m,
      createdAt: m.createdAt.toISOString(),
    })),
  };
}
