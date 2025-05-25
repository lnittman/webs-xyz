import * as React from 'react';
import { cn } from '../../lib/utils';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  theme?: 'PRIMARY' | 'SECONDARY';
  isDisabled?: boolean;
  children?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  theme = 'PRIMARY',
  isDisabled,
  children,
  className,
  ...rest
}) => {
  const base = 'inline-block w-full font-mono uppercase px-2 transition-all text-base';
  const primary = 'bg-primary text-primary-foreground hover:bg-primary/80 focus:bg-primary/80';
  const secondary =
    'bg-background text-foreground shadow-inner shadow-border hover:bg-muted focus:bg-muted';
  const disabled = 'bg-muted text-muted-foreground cursor-not-allowed';
  const themeClass = theme === 'SECONDARY' ? secondary : primary;

  if (isDisabled) {
    return (
      <div className={cn(base, themeClass, disabled, className)}>{children}</div>
    );
  }

  return (
    <button
      className={cn(base, themeClass, className)}
      disabled={isDisabled}
      role="button"
      tabIndex={0}
      {...rest}
    >
      {children}
    </button>
  );
};
