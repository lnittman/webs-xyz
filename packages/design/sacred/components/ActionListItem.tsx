import * as React from 'react';
import { cn } from '../../lib/utils';

export interface ActionListItemProps {
  style?: React.CSSProperties;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  href?: string;
  target?: string;
  onClick?: React.MouseEventHandler<HTMLDivElement | HTMLAnchorElement>;
}

export const ActionListItem: React.FC<ActionListItemProps> = ({
  href,
  target,
  onClick,
  children,
  icon,
  style,
}) => {
  const classes = cn('flex items-start justify-between cursor-pointer');
  const content = (
    <>
      <figure className="icon flex h-6 w-6 items-center justify-center bg-foreground text-background mr-2">
        {icon}
      </figure>
      <span className="flex-1 bg-background px-1">{children}</span>
    </>
  );
  if (href) {
    return (
      <a href={href} target={target} className={classes} style={style} tabIndex={0} role="link">
        {content}
      </a>
    );
  }
  return (
    <div onClick={onClick} className={classes} style={style} tabIndex={0} role="button">
      {content}
    </div>
  );
};
