import 'server-only';
import { database } from '@repo/database';
import type { Prisma } from '@repo/database';
import { createSpaceSchema, updateSpaceSchema, updateSpaceSettingsSchema, type Space } from '../schemas/space';
import { SPACE_DEFAULTS } from '../constants';

// Re-export the Space type from schema for convenience
export type { Space } from '../schemas/space';

export interface Web {
  id: string;
  title: string | null;
  url: string;
  emoji: string | null;
  status: string;
  createdAt: string;
}

// Service class
export class SpaceService {
  /**
   * List all spaces for a user
   */
  async listSpaces(userId: string, includeWebs = false): Promise<Space[]> {
    const spaces = await database.space.findMany({
      where: { userId },
      include: { 
        webs: includeWebs ? {
          orderBy: { createdAt: 'desc' }
        } : false,
        _count: {
          select: { webs: true }
        }
      },
      orderBy: [
        { isDefault: 'desc' }, // Default space first
        { createdAt: 'asc' }
      ],
    });
    
    return spaces.map((s: any) => this.serializeSpace(s));
  }

  /**
   * Get a space by ID
   */
  async getSpaceById(id: string, includeWebs = false): Promise<Space | null> {
    const space = await database.space.findUnique({
      where: { id },
      include: { 
        webs: includeWebs ? {
          orderBy: { createdAt: 'desc' }
        } : false,
        _count: {
          select: { webs: true }
        }
      },
    });
    
    if (!space) return null;
    return this.serializeSpace(space);
  }

  /**
   * Get user's default space (creates if doesn't exist)
   */
  async getOrCreateDefaultSpace(userId: string): Promise<Space> {
    let defaultSpace = await database.space.findFirst({
      where: { 
        userId,
        isDefault: true 
      },
      include: {
        _count: {
          select: { webs: true }
        }
      }
    });

    if (!defaultSpace) {
      defaultSpace = await database.space.create({
        data: {
          userId,
          name: 'My Webs',
          description: 'Default space for your web analyses',
          emoji: '🏠',
          isDefault: true,
          // Use constants for defaults
          defaultModel: SPACE_DEFAULTS.DEFAULT_MODEL,
          notifyWebComplete: SPACE_DEFAULTS.NOTIFY_WEB_COMPLETE,
          notifyWebFailed: SPACE_DEFAULTS.NOTIFY_WEB_FAILED,
          visibility: SPACE_DEFAULTS.VISIBILITY,
        },
        include: {
          _count: {
            select: { webs: true }
          }
        }
      });
    }

    return this.serializeSpace(defaultSpace);
  }

  /**
   * Create a new space
   */
  async createSpace(input: unknown): Promise<Space> {
    const data = createSpaceSchema.parse(input);

    // If this is being set as default, unset other defaults
    if (data.isDefault) {
      await database.space.updateMany({
        where: { 
          userId: data.userId,
          isDefault: true 
        },
        data: { isDefault: false },
      });
    }

    const space = await database.space.create({
      data: {
        userId: data.userId,
        name: data.name,
        description: data.description,
        color: data.color,
        emoji: data.emoji,
        isDefault: data.isDefault || false,
        // Use constants for defaults, falling back to schema defaults if provided
        defaultModel: data.defaultModel || SPACE_DEFAULTS.DEFAULT_MODEL,
        notifyWebComplete: data.notifyWebComplete ?? SPACE_DEFAULTS.NOTIFY_WEB_COMPLETE,
        notifyWebFailed: data.notifyWebFailed ?? SPACE_DEFAULTS.NOTIFY_WEB_FAILED,
        visibility: data.visibility || SPACE_DEFAULTS.VISIBILITY,
      },
      include: {
        _count: {
          select: { webs: true }
        }
      },
    });

    return this.serializeSpace(space);
  }

  /**
   * Update a space
   */
  async updateSpace(id: string, input: unknown): Promise<Space | null> {
    const data = updateSpaceSchema.parse(input);

    // If this is being set as default, unset other defaults
    if (data.isDefault) {
      const space = await database.space.findUnique({ where: { id } });
      if (space) {
        await database.space.updateMany({
          where: { 
            userId: space.userId,
            isDefault: true,
            id: { not: id }
          },
          data: { isDefault: false },
        });
      }
    }

    const updateData: Prisma.SpaceUpdateInput = {
      name: data.name,
      description: data.description,
      color: data.color,
      emoji: data.emoji,
      isDefault: data.isDefault,
      defaultModel: data.defaultModel,
      notifyWebComplete: data.notifyWebComplete,
      notifyWebFailed: data.notifyWebFailed,
      visibility: data.visibility,
      updatedAt: new Date(),
    };

    const space = await database.space.update({
      where: { id },
      data: updateData,
      include: {
        _count: {
          select: { webs: true }
        }
      },
    });

    return this.serializeSpace(space);
  }

  /**
   * Update space settings only
   */
  async updateSpaceSettings(id: string, input: unknown): Promise<Space | null> {
    const data = updateSpaceSettingsSchema.parse(input);

    const updateData: Prisma.SpaceUpdateInput = {
      defaultModel: data.defaultModel,
      notifyWebComplete: data.notifyWebComplete,
      notifyWebFailed: data.notifyWebFailed,
      visibility: data.visibility,
      updatedAt: new Date(),
    };

    const space = await database.space.update({
      where: { id },
      data: updateData,
      include: {
        _count: {
          select: { webs: true }
        }
      },
    });

    return this.serializeSpace(space);
  }

  /**
   * Delete a space
   */
  async deleteSpace(spaceId: string): Promise<void> {
    const space = await database.space.findUnique({ 
      where: { id: spaceId },
      include: { _count: { select: { webs: true } } }
    });

    if (!space) {
      throw new Error('Space not found');
    }

    if (space.isDefault) {
      throw new Error('Cannot delete default space');
    }

    // Move all webs in this space to no space (null)
    await database.web.updateMany({
      where: { spaceId },
      data: { spaceId: null },
    });

    await database.space.delete({
      where: { id: spaceId },
    });
  }

  /**
   * Assign a web to a space
   */
  async assignWebToSpace(webId: string, spaceId: string | null, userId: string): Promise<void> {
    // Verify web belongs to user
    const web = await database.web.findFirst({
      where: { 
        id: webId,
        userId 
      }
    });

    if (!web) {
      throw new Error('Web not found or access denied');
    }

    // If spaceId is provided, verify space belongs to user
    if (spaceId) {
      const space = await database.space.findFirst({
        where: { 
          id: spaceId,
          userId 
        }
      });

      if (!space) {
        throw new Error('Space not found or access denied');
      }
    }

    await database.web.update({
      where: { id: webId },
      data: { spaceId },
    });
  }

  /**
   * Get webs without a space for a user
   */
  async getUnassignedWebs(userId: string): Promise<Web[]> {
    const webs = await database.web.findMany({
      where: { 
        userId,
        spaceId: null 
      },
      select: {
        id: true,
        title: true,
        url: true,
        emoji: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return webs.map(w => ({
      ...w,
      createdAt: w.createdAt.toISOString(),
    }));
  }

  /**
   * Ensure user has a default space, creating one if needed
   * This is useful for existing users who may not have spaces yet
   */
  async ensureUserHasDefaultSpace(userId: string): Promise<Space> {
    // Check if user already has a default space
    let defaultSpace = await database.space.findFirst({
      where: { 
        userId, 
        isDefault: true 
      },
      include: {
        _count: {
          select: {
            webs: true
          }
        }
      }
    });

    // If no default space exists, create one
    if (!defaultSpace) {
      // Import here to avoid circular dependency
      const { friendlyWords } = await import('friendlier-words');
      
      const SPACE_EMOJIS = [
        '🚀', '⭐', '🌟', '✨', '🔥', '💎', '🎯', '🌊',
        '🏔️', '🌈', '🎨', '🔮', '💫', '🌸', '🍃', '🎭',
        '🎪', '🎨', '🔍', '📚', '💡', '🎵', '🌺', '🦋',
        '🍀', '🌙', '☀️', '⚡', '🔥', '💰', '🎲', '🎪'
      ];

      const generateName = () => {
        return friendlyWords(2, ' ')
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      };

      const generateEmoji = () => {
        return SPACE_EMOJIS[Math.floor(Math.random() * SPACE_EMOJIS.length)];
      };

      defaultSpace = await database.space.create({
        data: {
          userId,
          name: generateName(),
          emoji: generateEmoji(),
          description: null,
          isDefault: true,
          // Use constants for defaults
          defaultModel: SPACE_DEFAULTS.DEFAULT_MODEL,
          notifyWebComplete: SPACE_DEFAULTS.NOTIFY_WEB_COMPLETE,
          notifyWebFailed: SPACE_DEFAULTS.NOTIFY_WEB_FAILED,
          visibility: SPACE_DEFAULTS.VISIBILITY,
        },
        include: {
          _count: {
            select: {
              webs: true
            }
          }
        }
      });
    }

    return this.serializeSpace(defaultSpace);
  }

  /**
   * Serialize space with proper date formatting
   */
  private serializeSpace(space: any): Space {
    return {
      ...space,
      createdAt: space.createdAt.toISOString(),
      updatedAt: space.updatedAt.toISOString(),
      webs: space.webs?.map((w: any) => ({
        ...w,
        createdAt: w.createdAt.toISOString(),
        updatedAt: w.updatedAt.toISOString(),
      })) || undefined,
    };
  }
}

// Export singleton instance
export const spaceService = new SpaceService(); 