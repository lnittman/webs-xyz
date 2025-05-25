import type { ReactNode } from 'react';
import { ThemeSwitcher } from '@/components/shared/theme-switcher';

interface UnauthenticatedLayoutProps {
  children: ReactNode;
}

export default function UnauthenticatedLayout({ children }: UnauthenticatedLayoutProps) {
  return (
    <div className="min-h-screen bg-background antialiased font-mono flex flex-col">
      {/* Theme switcher in top right */}
      <div className="absolute top-4 right-4 z-10">
        <ThemeSwitcher />
      </div>

      {/* Main content centered */}
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-md px-6">
          {children}
        </div>
      </div>
    </div>
  );
}
