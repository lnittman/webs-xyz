'use client';

import { useState, useEffect } from 'react';
import { Dashboard } from '@/components/dashboard';
import { useWebs } from '@/hooks/web/queries';
import { useCreateWeb } from '@/hooks/web/mutations';
import { useUserSettings } from '@/hooks/user-settings/queries';
import { useSetAtom } from 'jotai';
import { inputTextAtom } from '@/atoms/urls';
import { startLoadingAtom, stopLoadingAtom } from '@/atoms/loading';

const LOADING_ID = 'webs-dashboard';

export default function RootPage() {
  const { webs, isLoading } = useWebs();
  const { createWeb } = useCreateWeb();
  const { settings } = useUserSettings();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedModelId, setSelectedModelId] = useState('claude-4-sonnet');
  const setInputText = useSetAtom(inputTextAtom);
  const startLoading = useSetAtom(startLoadingAtom);
  const stopLoading = useSetAtom(stopLoadingAtom);

  // Manage loading state with atoms
  useEffect(() => {
    if (isLoading) {
      startLoading(LOADING_ID);
    } else {
      stopLoading(LOADING_ID);
    }
  }, [isLoading, startLoading, stopLoading]);

  // Update selected model when user settings load
  useEffect(() => {
    if (settings?.defaultModel) {
      setSelectedModelId(settings.defaultModel);
    }
  }, [settings?.defaultModel]);

  const handleSubmit = async (input: string) => {
    setIsSubmitting(true);
    try {
      // Extract all URLs from the input
      const urlRegex = /https?:\/\/[^\s]+/g;
      const urls = input.match(urlRegex) || [];

      // Extract prompt by removing all URLs
      const prompt = input.replace(urlRegex, '').trim() || undefined;

      if (urls.length === 0) {
        console.warn('No URLs found in input');
        return;
      }

      // Create web with multiple URLs
      await createWeb({
        urls,
        prompt,
        url: urls[0] || '', // Primary URL for backward compatibility
      });

      // Clear the prompt bar
      setInputText('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModelChange = (modelId: string) => {
    setSelectedModelId(modelId);
  };

  return (
    <Dashboard
      webs={webs}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      onModelChange={handleModelChange}
      selectedModelId={selectedModelId}
    />
  );
} 
