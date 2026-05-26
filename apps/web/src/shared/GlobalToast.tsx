import { useUIStore } from '@picto/core';
import { Sparkles } from 'lucide-react';

export function GlobalToast() {
  const toastMessage = useUIStore((s) => s.toastMessage);
  if (!toastMessage) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-slate-900/90 backdrop-blur-md border border-white/10 text-slate-100 text-xs px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 max-w-sm animate-bounce">
      <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
      <span>{toastMessage}</span>
    </div>
  );
}
