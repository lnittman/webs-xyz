import * as React from 'react';
import { ButtonGroup } from './ButtonGroup';
import { cn } from '../../lib/utils';

export interface ActionBarItem {
  hotkey?: React.ReactNode;
  onClick?: () => void;
  openHotkey?: string;
  selected?: boolean;
  body: React.ReactNode;
  items?: any;
}

export interface ActionBarProps {
  items: ActionBarItem[];
  className?: string;
}

export const ActionBar: React.FC<ActionBarProps> = ({ items, className }) => (
  <div className={cn('bg-background shadow-inner shadow-border', className)}>
    <ButtonGroup items={items} />
  </div>
);
