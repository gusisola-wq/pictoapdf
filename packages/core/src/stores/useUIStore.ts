import { create } from 'zustand';
import { TOAST_DURATION_MS } from '../constants';

export interface ConfirmModalState {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
}

const INITIAL_CONFIRM: ConfirmModalState = {
  isOpen: false,
  title: '',
  message: '',
  onConfirm: () => {},
};

interface UIStore {
  toastMessage: string | null;
  confirmModal: ConfirmModalState;
  triggerToast: (msg: string) => void;
  showConfirm: (title: string, message: string, onConfirm: () => void) => void;
  hideConfirm: () => void;
}

let _toastTimer: ReturnType<typeof setTimeout> | null = null;

export const useUIStore = create<UIStore>()((set) => ({
  toastMessage: null,
  confirmModal: INITIAL_CONFIRM,

  triggerToast: (msg: string) => {
    if (_toastTimer) clearTimeout(_toastTimer);
    set({ toastMessage: msg });
    _toastTimer = setTimeout(() => {
      set({ toastMessage: null });
      _toastTimer = null;
    }, TOAST_DURATION_MS);
  },

  showConfirm: (title: string, message: string, onConfirm: () => void) => {
    set({ confirmModal: { isOpen: true, title, message, onConfirm } });
  },

  hideConfirm: () => {
    set((s) => ({ confirmModal: { ...s.confirmModal, isOpen: false } }));
  },
}));
