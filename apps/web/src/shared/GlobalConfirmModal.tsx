import { useUIStore } from '@picto/core';
import { Trash2 } from 'lucide-react';

export function GlobalConfirmModal() {
  const { confirmModal, hideConfirm } = useUIStore();
  if (!confirmModal.isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]">
      <div className="bg-slate-900 border border-white/10 rounded-2xl max-w-sm w-full p-5 shadow-2xl relative text-left animate-in fade-in duration-200">
        <h3 className="text-sm font-bold text-slate-100 mb-2 flex items-center gap-2">
          <Trash2 className="w-4 h-4 text-rose-400 shrink-0" />
          {confirmModal.title}
        </h3>
        <p className="text-[12px] text-slate-300 mb-5 leading-normal">
          {confirmModal.message}
        </p>
        <div className="flex justify-end gap-2.5">
          <button
            type="button"
            onClick={hideConfirm}
            className="px-3.5 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 font-semibold text-xs rounded-lg transition border border-white/5 cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => {
              confirmModal.onConfirm();
              hideConfirm();
            }}
            className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs rounded-lg transition shadow-lg shadow-rose-950/20 cursor-pointer"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}
