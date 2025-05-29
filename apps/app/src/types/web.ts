export interface Web {
  id: string;
  url: string;
  domain?: string | null;
  title?: string | null;
  description?: string | null;
  prompt?: string | null;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETE' | 'FAILED';
  createdAt: string;
  updatedAt: string;
  messages?: Message[];
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
  prompt?: string;
} 