import type { ReactNode } from 'react';
import { ThemeSwitcher } from '@/components/shared/theme-switcher';

interface UnauthenticatedLayoutProps {
  children: ReactNode;
}

export default function UnauthenticatedLayout({ children }: UnauthenticatedLayoutProps) {
  return (
    <div className="min-h-screen bg-background antialiased font-mono flex flex-col unauthenticated-layout">
      {/* Theme switcher in top right */}
      <div className="absolute top-6 right-6 z-10">
        <ThemeSwitcher />
      </div>

      {/* Main content centered */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          {children}
        </div>
      </div>
    </div>
  );
}
