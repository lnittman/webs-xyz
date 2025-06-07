import { atom } from 'jotai';
import type { Space } from '@repo/api/services/space';

// Current selected space ID
export const currentSpaceIdAtom = atom<string | null>(null);

// Current selected space object (derived from spaces list and currentSpaceId)
export const currentSpaceAtom = atom<Space | null>(null);

// Whether the current space is being loaded
export const currentSpaceLoadingAtom = atom<boolean>(false); 