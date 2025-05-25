import * as React from 'react';
import { cn } from '../../lib/utils';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  href?: string;
  target?: string;
  children?: React.ReactNode;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  href,
  target,
  children,
  className,
  style,
  ...rest
}) => {
  const backgroundStyle = src ? { backgroundImage: `url(${src})`, backgroundSize: 'cover' } : {};
  const element = href ? (
    <a
      className={cn('inline-block w-8 h-8 bg-center bg-cover', className)}
      style={{ ...style, ...backgroundStyle }}
      href={href}
      target={target}
      tabIndex={0}
      role="link"
    />
  ) : (
    <figure
      className={cn('inline-block w-8 h-8 bg-center bg-cover', className)}
      style={{ ...style, ...backgroundStyle }}
    />
  );

  if (!children) return element;

  return (
    <div className={cn('flex items-center gap-2', className)} {...rest} style={undefined}>
      {element}
      <span>{children}</span>
    </div>
  );
};
