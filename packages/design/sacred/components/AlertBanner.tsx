import * as React from 'react';
import { cn } from '../../lib/utils';

export interface AlertBannerProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({ children, className, style, ...rest }) => (
  <div
    className={cn(
      'bg-border text-foreground shadow-[1ch_1ch_0_0_var(--theme-border-subdued)] p-2 font-medium',
      className,
    )}
    style={style}
    {...rest}
  >
    {children}
  </div>
);
