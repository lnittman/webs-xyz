import * as React from 'react';
import { cn } from '../../lib/utils';

export interface DividerProps extends React.HTMLAttributes<HTMLHRElement> {}

export const Divider: React.FC<DividerProps> = ({ className, ...rest }) => (
  <hr className={cn('border-border my-1', className)} {...rest} />
);
