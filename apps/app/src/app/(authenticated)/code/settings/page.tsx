'use client';

import { useIsMobile } from '@repo/design/hooks/use-is-mobile';
import { cn } from '@repo/design/lib/utils';

import { CodeSettings } from '@/components/code/settings';

export default function CodeSettingsPage() {
  const isMobile = useIsMobile();
  
  return (
    <div className="w-full h-full flex flex-col">
      <div className={cn(
        "flex items-center justify-between p-3 sticky top-0 bg-background z-10 flex-shrink-0",
        isMobile ? "hidden" : ""
      )}>
        <h2 className="text-lg font-medium text-foreground">settings</h2>
      </div>
      
      <div className="flex-1 overflow-hidden flex justify-center">
        <div className="w-full max-w-2xl h-full">
          <CodeSettings />
        </div>
      </div>
    </div>
  );
} 