'use client';

import { useState, useEffect } from 'react';
import { Dashboard } from '@/components/dashboard';
import { useWebs } from '@/hooks/code/web/queries';
import { useCreateWeb } from '@/hooks/code/web/mutations';
import { useUserSettings } from '@/hooks/user-settings';

export default function RootPage() {
  const { webs } = useWebs();
  const { createWeb } = useCreateWeb();
  const { settings } = useUserSettings();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedModelId, setSelectedModelId] = useState('claude-4-sonnet');

  // Update selected model when user settings load
  useEffect(() => {
    if (settings?.defaultModel) {
      setSelectedModelId(settings.defaultModel);
    }
  }, [settings?.defaultModel]);

  const handleSubmit = async (input: string) => {
    setIsSubmitting(true);
    try {
      // Parse input to extract URL and optional prompt
      const urlRegex = /(https?:\/\/[^\s]+)/;
      const match = input.match(urlRegex);
      const url = match ? match[1] : input;
      const prompt = input.replace(urlRegex, '').trim() || undefined;

      await createWeb({ url, prompt });
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
