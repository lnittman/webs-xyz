'use client';
import * as React from 'react';
import { useModals } from './page/ModalContext';
import { cn } from '../../lib/utils';

export const ModalStack: React.FC = () => {
  const { modalStack, close } = useModals();
  const currentModal = modalStack[0]; // Only show the first (and only) modal

  if (!currentModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={() => close()}
      />

      {/* Modal Content */}
      <div className="relative pointer-events-auto z-10 animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-200">
        {React.createElement(currentModal.component as React.ComponentType<any>, currentModal.props)}
      </div>
    </div>
  );
};
