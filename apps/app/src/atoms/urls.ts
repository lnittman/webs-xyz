import { atom } from 'jotai';

export interface DetectedUrl {
  url: string;
  id: string;
  isFromTabs?: boolean;
}

// Atom for the current input text
export const inputTextAtom = atom('');

// Atom for detected URLs (derived from input text)
export const detectedUrlsAtom = atom((get) => {
  const input = get(inputTextAtom);
  
  // Helper to extract URLs from text - more robust detection
  function extractUrls(text: string): string[] {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const matches = text.match(urlRegex) || [];
    
    // Filter out incomplete URLs (those that might be in the middle of typing)
    return matches.filter(url => {
      try {
        new URL(url);
        // Only include URLs that have a proper domain structure
        return url.includes('.') && url.length > 10;
      } catch {
        return false;
      }
    });
  }

  const urls = extractUrls(input);
  return urls.map((url, index) => ({
    url,
    id: `${url}-${index}`, // Stable ID based on URL and position
    isFromTabs: false,
  }));
});

// Atom for stable URLs (only updates when URLs are actually added/removed)
export const stableUrlsAtom = atom<DetectedUrl[]>([]);

// Write-only atom to update stable URLs when needed
export const updateStableUrlsAtom = atom(
  null,
  (get, set) => {
    const currentUrls = get(detectedUrlsAtom);
    const stableUrls = get(stableUrlsAtom);
    
    const currentUrlStrings = currentUrls.map(u => u.url);
    const stableUrlStrings = stableUrls.map(u => u.url);
    
    // Check if URLs were actually added or removed
    const urlsAdded = currentUrlStrings.filter(url => !stableUrlStrings.includes(url));
    const urlsRemoved = stableUrlStrings.filter(url => !currentUrlStrings.includes(url));
    
    if (urlsAdded.length > 0 || urlsRemoved.length > 0) {
      set(stableUrlsAtom, currentUrls);
    }
  }
);

// Helper atom to check if input contains URLs
export const hasUrlsAtom = atom((get) => {
  const urls = get(detectedUrlsAtom);
  return urls.length > 0;
}); 