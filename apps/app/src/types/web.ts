export interface WebEntity {
  id: string;
  webId: string;
  type: string;
  value: string;
  createdAt: string;
}

export interface Web {
  id: string;
  url: string;
  urls?: string[];
  domain?: string | null;
  title?: string | null;
  description?: string | null;
  prompt?: string | null;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETE' | 'FAILED';
  // Analysis results
  analysis?: any;
  topics?: string[];
  sentiment?: string | null;
  confidence?: number | null;
  readingTime?: number | null;
  insights?: string[];
  relatedUrls?: string[];
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
} 