import { atom } from 'jotai';
import type { Space } from '@/types/space';

// Current selected space ID
export const currentSpaceIdAtom = atom<string | null>(null);

// Current selected space object (derived from spaces list and currentSpaceId)
export const currentSpaceAtom = atom<Space | null>(null);

// Whether the current space is being loaded
export const currentSpaceLoadingAtom = atom<boolean>(false); 