import { useState, useEffect } from 'react';
import type { CommunicatorBoard } from '@picto/core';
import { X } from 'lucide-react';

interface Props {
  board: CommunicatorBoard;
  onSave: (data: { name: string; columns: number; rows: number }) => void;
  onDelete: () => void;
  onClose: () => void;
}

export function BoardSettingsPanel({ board, onSave, onDelete, onClose }: Props) {
  const [name, setName] = useState(board.name);
  const [columns, setColumns] = useState(board.columns);
  const [rows, setRows] = useState(board.rows);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const canSave = name.trim().length > 0;

  function handleSave() {
    if (!canSave) return;
    onSave({
      name: name.trim(),
      columns: Math.max(1, Math.min(10, columns)),
      rows: Math.max(1, Math.min(10, rows)),
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-800 border border-white/10 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <h3 className="text-sm font-bold text-slate-100">Configurar tablero</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
              Nombre del tablero
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>

          {/* Grid dimensions */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
                Columnas
              </label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setColumns(Math.max(1, columns - 1))}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-sm text-slate-300 hover:bg-white/5 transition cursor-pointer"
                >
                  −
                </button>
                <span className="w-8 text-center text-sm font-bold text-slate-200">{columns}</span>
                <button
                  onClick={() => setColumns(Math.min(10, columns + 1))}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-sm text-slate-300 hover:bg-white/5 transition cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
                Filas
              </label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setRows(Math.max(1, rows - 1))}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-sm text-slate-300 hover:bg-white/5 transition cursor-pointer"
                >
                  −
                </button>
                <span className="w-8 text-center text-sm font-bold text-slate-200">{rows}</span>
                <button
                  onClick={() => setRows(Math.min(10, rows + 1))}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-sm text-slate-300 hover:bg-white/5 transition cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Preview grid info */}
          <div className="rounded-xl bg-slate-900/50 border border-white/5 px-4 py-3 text-center">
            <span className="text-xs text-slate-400">
              {columns} × {rows} = <strong className="text-slate-200">{columns * rows}</strong> celdas
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 px-5 py-4 border-t border-white/10">
          <button
            onClick={onDelete}
            className="px-3 py-2 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-500/10 transition cursor-pointer"
          >
            Eliminar tablero
          </button>
          <div className="flex-1" />
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-white/5 transition cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!canSave}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white transition cursor-pointer shadow-lg"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
