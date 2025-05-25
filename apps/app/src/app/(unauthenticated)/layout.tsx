import type { ReactNode } from 'react';

interface UnauthenticatedLayoutProps {
  children: ReactNode;
}

export default function UnauthenticatedLayout({ children }: UnauthenticatedLayoutProps) {
  return (
    <div className="min-h-screen bg-background antialiased font-mono flex flex-col items-center justify-center">
      <div className="w-full max-w-md px-6">
        {children}
      </div>

      {/* Terminal scanline effect */}
      <div className="terminal-scanlines" aria-hidden="true" />
    </div>
  );
}
