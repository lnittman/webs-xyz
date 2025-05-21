'use client';
import * as React from 'react';
import { useModals } from './page/ModalContext';
import { cn } from '../../lib/utils';

export const ModalStack: React.FC = () => {
  const { modalStack } = useModals();
  const total = modalStack.length;

  return (
    <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
      {modalStack.map((modal, index) => {
        const offset = total - 1 - index;
        const translateY = -offset * 40;
        const blur = offset * 1.1;
        const ModalComponent = modal.component as React.ComponentType<any>;
        return (
          <div
            key={modal.key}
            className="absolute pointer-events-auto transition-opacity transition-transform"
            style={{ zIndex: 10 + index, transform: `translateY(${translateY}px)`, filter: `blur(${blur}px)` }}
          >
            <ModalComponent {...modal.props} />
          </div>
        );
      })}
    </div>
  );
};
