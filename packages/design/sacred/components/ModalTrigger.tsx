'use client';
import * as React from 'react';
import { useModals } from './page/ModalContext';

interface ModalTriggerProps {
  children: React.ReactElement<{ onClick?: React.MouseEventHandler }>;
  modal: React.ComponentType<any>;
  modalProps?: Record<string, any>;
}

export const ModalTrigger: React.FC<ModalTriggerProps> = ({ children, modal, modalProps = {} }) => {
  const { open } = useModals();
  const onHandleOpenModal = () => {
    open(modal, modalProps);
  };
  return React.cloneElement(children, {
    onClick: onHandleOpenModal,
  });
};
