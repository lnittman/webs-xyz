import * as React from 'react';
import { cn } from '../../lib/utils';

interface DefaultLayoutProps {
  previewPixelSRC: string;
  children?: React.ReactNode;
}

export const DefaultLayout: React.FC<DefaultLayoutProps> = ({ previewPixelSRC, children }) => (
  <div className={cn('relative')}> 
    <img className="absolute inset-0 w-full h-full object-cover" src={previewPixelSRC} alt="" />
    {children}
  </div>
);
