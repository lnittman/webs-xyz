export type WebStatus = 'PENDING' | 'PROCESSING' | 'COMPLETE' | 'FAILED';

export interface WebEntity {
  id: string;
  webId: string;
  type: string;
  value: string;
  createdAt: string;
}

export interface Web {
  id: string;
  userId: string;
  spaceId: string | null;
  url: string;
  urls: string[];
  domain: string | null;
  title: string | null;
  description: string | null;
  prompt: string | null;
  status: WebStatus;
  // Analysis results
  analysis: any;
  topics: string[];
  sentiment: string | null;
  confidence: number | null;
  readingTime: number | null;
  insights: string[];
  relatedUrls: string[];
  emoji: string | null;
  createdAt: string;
  updatedAt: string;
  messages?: Message[];
  entities?: WebEntity[];
}

export interface Message {
  id: string;
  webId?: string | null;
  type: 'TEXT' | 'TOOL' | 'SYSTEM' | 'AI';
  content: string;
  createdAt: string;
}

export interface CreateWebInput {
  url: string;
  urls?: string[];
  prompt?: string;
  spaceId?: string | null;
} 