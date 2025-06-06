export interface Space {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  color: string | null;
  emoji: string | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    webs: number;
  };
  webs?: {
    id: string;
    title: string | null;
    url: string;
    emoji: string | null;
    status: string;
    spaceId: string | null;
    createdAt: string;
  }[];
}

export interface CreateSpaceInput {
  name: string;
  description?: string;
  color?: string;
  emoji?: string;
  isDefault?: boolean;
} 