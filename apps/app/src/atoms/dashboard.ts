import { atom } from 'jotai';

export type ViewMode = 'grid' | 'list';

export const viewModeAtom = atom<ViewMode>('grid'); 