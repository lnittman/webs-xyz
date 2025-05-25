import * as React from 'react';
import { cn } from '../../lib/utils';

export interface TooltipProps {
  text: string;
  children: React.ReactNode;
}

export const Tooltip: React.FC<TooltipProps> = ({ text, children }) => (
  <div className="relative group inline-block">
    {children}
    <span className="absolute left-1/2 top-full mt-1 -translate-x-1/2 scale-0 bg-foreground text-background px-2 py-1 text-xs group-hover:scale-100 transition-transform">
      {text}
    </span>
  </div>
);
