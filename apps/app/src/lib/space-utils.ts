/**
 * Utility functions for spaces
 */

import { friendlyWords } from 'friendlier-words';

const SPACE_EMOJIS = [
  '🚀', '⭐', '🌟', '✨', '🔥', '💎', '🎯', '🌊',
  '🏔️', '🌈', '🎨', '🔮', '💫', '🌸', '🍃', '🎭',
  '🎪', '🎨', '🔍', '📚', '💡', '🎵', '🌺', '🦋',
  '🍀', '🌙', '☀️', '⚡', '🔥', '💰', '🎲', '🎪'
];

/**
 * Generate a random space name using friendlier-words
 */
export function generateRandomSpaceName(): string {
  // Generate 2 words separated by space (friendlier than dash for display)
  return friendlyWords(2, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Generate a random emoji for a space
 */
export function generateRandomSpaceEmoji(): string {
  return SPACE_EMOJIS[Math.floor(Math.random() * SPACE_EMOJIS.length)];
}

/**
 * Generate complete random space data
 */
export function generateRandomSpaceData() {
  return {
    name: generateRandomSpaceName(),
    emoji: generateRandomSpaceEmoji(),
    description: null,
    color: null,
    isDefault: true,
  };
} 