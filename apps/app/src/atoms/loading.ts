import { atom } from 'jotai';

export interface LoadingState {
  isLoading: boolean;
  loadingId: string;
  startTime: number;
}

// Global loading state atom
export const loadingStateAtom = atom<LoadingState | null>(null);

// Helper atom to check if currently loading
export const isLoadingAtom = atom((get) => {
  const loadingState = get(loadingStateAtom);
  return loadingState?.isLoading ?? false;
});

// Write-only atom to start loading
export const startLoadingAtom = atom(
  null,
  (get, set, loadingId: string) => {
    set(loadingStateAtom, {
      isLoading: true,
      loadingId,
      startTime: Date.now(),
    });
  }
);

// Write-only atom to stop loading
export const stopLoadingAtom = atom(
  null,
  (get, set, loadingId: string) => {
    const currentState = get(loadingStateAtom);
    if (currentState?.loadingId === loadingId) {
      set(loadingStateAtom, {
        ...currentState,
        isLoading: false,
      });
    }
  }
); 