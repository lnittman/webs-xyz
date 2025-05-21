import * as React from 'react';
import { cn } from '../../lib/utils';

interface ActionButtonProps {
  onClick?: () => void;
  hotkey?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  isSelected?: boolean;
}

export const ActionButton = React.forwardRef<HTMLDivElement, ActionButtonProps>(
  ({ onClick, hotkey, children, className, isSelected }, ref) => (
    <div
      ref={ref}
      role="button"
      tabIndex={0}
      onClick={onClick}
      className={cn(
        'inline-flex items-center justify-between font-mono text-base select-none',
        'cursor-pointer outline-none',
        'hover:[&_.hotkey]:bg-primary hover:[&_.content]:shadow-inner hover:[&_.content]:shadow-primary',
        'focus:[&_.hotkey]:bg-primary focus:[&_.content]:shadow-inner focus:[&_.content]:shadow-primary',
        isSelected && '[&_.content]:bg-primary',
        className,
      )}
    >
      {hotkey ? (
        <span className="hotkey bg-muted text-foreground px-1">{hotkey}</span>
      ) : null}
      <span className="content bg-background shadow-inner shadow-muted px-1 uppercase">
        {children}
      </span>
    </div>
  ),
);

ActionButton.displayName = 'ActionButton';
