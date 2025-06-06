/**
 * Utility for smooth text streaming animations
 */

export interface StreamTextOptions {
  text: string;
  onUpdate: (text: string) => void;
  onComplete?: () => void;
  delayMs?: number;
  chunkSize?: number;
}

export function streamText({
  text,
  onUpdate,
  onComplete,
  delayMs = 20,
  chunkSize = 1
}: StreamTextOptions): () => void {
  let currentIndex = 0;
  let intervalId: NodeJS.Timeout | null = null;

  const stream = () => {
    intervalId = setInterval(() => {
      if (currentIndex < text.length) {
        const nextIndex = Math.min(currentIndex + chunkSize, text.length);
        onUpdate(text.slice(0, nextIndex));
        currentIndex = nextIndex;
      } else {
        if (intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
        onComplete?.();
      }
    }, delayMs);
  };

  stream();

  // Return cleanup function
  return () => {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  };
}

/**
 * Hook for smooth text streaming
 */
import { useEffect, useRef, useState } from 'react';

export function useStreamText(
  targetText: string | undefined,
  options: Omit<StreamTextOptions, 'text' | 'onUpdate'> = {}
) {
  const [streamedText, setStreamedText] = useState('');
  const previousTextRef = useRef<string>('');
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (targetText && targetText !== previousTextRef.current) {
      previousTextRef.current = targetText;
      setStreamedText('');

      // Clean up any existing stream
      if (cleanupRef.current) {
        cleanupRef.current();
      }

      // Start new stream
      cleanupRef.current = streamText({
        text: targetText,
        onUpdate: setStreamedText,
        ...options
      });
    }

    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    };
  }, [targetText]);

  return streamedText;
} 