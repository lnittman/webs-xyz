import * as React from 'react';
import { cn } from '../../lib/utils';

export interface RowProps extends React.HTMLAttributes<HTMLDivElement> {
  spacing?: 'between' | 'around';
}

export const Row: React.FC<RowProps> = ({ spacing, className, children, ...rest }) => (
  <div
    className={cn(
      'flex items-center',
      spacing === 'between' && 'justify-between',
      spacing === 'around' && 'justify-around',
      className,
    )}
    {...rest}
  >
    {children}
  </div>
);
