'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSpaces } from '@/hooks/spaces';

export default function RootPage() {
  const router = useRouter();
  const { spaces, isLoading } = useSpaces();

  useEffect(() => {
    if (!isLoading && spaces.length > 0) {
      // Find default space or use first space
      const defaultSpace = spaces.find(s => s.isDefault) || spaces[0];

      // Convert space name to URL format (kebab-case)
      const spaceUrlName = defaultSpace.name.toLowerCase().replace(/\s+/g, '-');

      // Redirect to default space
      router.replace(`/${spaceUrlName}`);
    }
  }, [spaces, isLoading, router]);

  // Show loading state while redirecting
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-muted-foreground">Loading...</div>
    </div>
  );
} 
