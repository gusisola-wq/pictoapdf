import { useState, useCallback } from 'react';

export interface ConfirmModalState {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
}

const INITIAL: ConfirmModalState = {
  isOpen: false,
  title: '',
  message: '',
  onConfirm: () => {},
};

export function useConfirmModal() {
  const [confirmModal, setConfirmModal] = useState<ConfirmModalState>(INITIAL);

  const showConfirm = useCallback(
    (title: string, message: string, onConfirm: () => void) => {
      setConfirmModal({ isOpen: true, title, message, onConfirm });
    },
    [],
  );

  const hideConfirm = useCallback(() => {
    setConfirmModal((prev) => ({ ...prev, isOpen: false }));
  }, []);

  return { confirmModal, showConfirm, hideConfirm };
}
