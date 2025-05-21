import * as React from 'react';
import { cn } from '../../lib/utils';
import { ActionButton } from './ActionButton';

interface ButtonGroupItem {
  hotkey?: React.ReactNode;
  openHotkey?: string;
  onClick?: () => void;
  body: React.ReactNode;
  items?: any;
  selected?: boolean;
}

interface ButtonGroupProps {
  items?: ButtonGroupItem[];
  isFull?: boolean;
}

export const ButtonGroup: React.FC<ButtonGroupProps> = ({ items, isFull }) => {
  if (!items) return null;
  return (
    <div className={cn(isFull && 'grid grid-cols-3 gap-2')}>
      {items.map((each) => (
        <ActionButton key={String(each.body)} hotkey={each.hotkey} onClick={each.onClick} isSelected={each.selected}>
          {each.body}
        </ActionButton>
      ))}
    </div>
  );
};
