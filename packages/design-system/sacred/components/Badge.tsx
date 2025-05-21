import * as React from 'react';
import { cn } from '../../lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({ children, className, ...rest }) => (
  <span
    className={cn(
      'inline-block bg-border text-foreground font-mono uppercase px-1 text-center',
      className,
    )}
    {...rest}
  >
    {children}
  </span>
);
