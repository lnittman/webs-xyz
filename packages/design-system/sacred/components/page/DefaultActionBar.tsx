'use client';
import * as React from 'react';
import { ButtonGroup } from '../ButtonGroup';
import { cn } from '../../../lib/utils';

interface DefaultActionBarItem {
  hotkey: string;
  onClick: () => void;
  body: React.ReactNode;
  items?: any;
}

interface DefaultActionBarProps {
  items?: DefaultActionBarItem[];
}

export const DefaultActionBar: React.FC<DefaultActionBarProps> = ({ items = [] }) => (
  <div className={cn('bg-background shadow-inner shadow-border')}>
    <ButtonGroup items={items} isFull />
  </div>
);
