import { useState, useEffect, useRef } from 'react';
import { type BoardCell, FITZGERALD_CATEGORIES, uid } from '@picto/core';
import { X, Search, Loader2, ImageOff } from 'lucide-react';

interface Props {
  cell: BoardCell;
  position: number;
  onSave: (cell: BoardCell) => void;
  onDelete: (position: number) => void;
  onClose: () => void;
}

const ARASAAC_V1 = 'https://api.arasaac.org/v1/pictograms';
const ARASAAC_V2 = 'https://api.arasaac.org/v2/pictograms';

interface ArasaacPicto {
  _id: number;
  id?: number;
  idPictograma?: number;
  keywords: { keyword: string }[];
}

const categoryOptions = FITZGERALD_CATEGORIES.map((c) => ({
  value: c.id,
  label: c.name,
  color: c.color,
  borderColor: c.borderColor,
}));

function pictoId(p: ArasaacPicto): number {
  return p.id ?? p.idPictograma ?? p._id;
}

export function CellEditorModal({ cell, position, onSave, onDelete, onClose }: Props) {
  const [label, setLabel] = useState(cell.label);
  const [categoryId, setCategoryId] = useState(cell.categoryId);
  const [isFolder, setIsFolder] = useState(cell.isFolder);
  const [speakOnTap, setSpeakOnTap] = useState(cell.speakOnTap !== false);
  const [addToSentence, setAddToSentence] = useState(cell.addToSentence !== false);
  const [imageUrl, setImageUrl] = useState(cell.imageUrl || '');
  const [imageError, setImageError] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ArasaacPicto[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  async function trySearch(query: string): Promise<ArasaacPicto[] | null> {
    // Try v2 first, fall back to v1
    for (const base of [ARASAAC_V2, ARASAAC_V1]) {
      try {
        const res = await fetch(`${base}/es/search/${encodeURIComponent(query)}`, {
          signal: AbortSignal.timeout(5000),
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) return data;
        }
      } catch {
        // try next
      }
    }
    return null;
  }

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setSearchError(null);
      return;
    }
    setSearching(true);
    setSearchError(null);
    const timer = setTimeout(async () => {
      const data = await trySearch(searchQuery.trim());
      if (!mountedRef.current) return;
      if (data) {
        setSearchResults(data.slice(0, 24));
      } else {
        setSearchResults([]);
        setSearchError('No se pudieron cargar pictogramas. Verificá tu conexión o intentá de nuevo.');
      }
      setSearching(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const isNew = !cell.label;
  const cat = FITZGERALD_CATEGORIES.find((c) => c.id === categoryId);

  function handleSave() {
    const updated: BoardCell = {
      id: cell.id || uid('cell'),
      position,
      label: label.trim() || '(sin etiqueta)',
      categoryId,
      imageUrl: imageUrl || undefined,
      subBoardId: isFolder ? (cell.subBoardId || undefined) : undefined,
      isFolder,
      speakOnTap,
      addToSentence,
    };
    onSave(updated);
  }

  function selectPicto(id: number) {
    setImageUrl(`${ARASAAC_V1}/${id}`);
    setImageError(false);
    setSearchQuery('');
    setSearchResults([]);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-800 border border-white/10 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 sticky top-0 bg-slate-800 z-10">
          <h3 className="text-sm font-bold text-slate-100">
            {isNew ? 'Nueva celda' : 'Editar celda'}
          </h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Label */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
              Etiqueta
            </label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Nombre del pictograma"
              autoFocus
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>

          {/* ARASAAC search */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
              Imagen (ARASAAC)
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar pictograma..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
              {searching && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 animate-spin" />
              )}
            </div>

            {searchError && (
              <p className="mt-1 text-[11px] text-red-400 flex items-center gap-1">
                <ImageOff className="w-3 h-3" /> {searchError}
              </p>
            )}

            {/* Search results */}
            {searchResults.length > 0 && (
              <div className="mt-2 grid grid-cols-6 gap-1.5 max-h-44 overflow-y-auto rounded-xl bg-slate-900/50 border border-white/5 p-2">
                {searchResults.map((p) => {
                  const pid = pictoId(p);
                  const selected = imageUrl === `${ARASAAC_V1}/${pid}`;
                  return (
                    <button
                      key={pid}
                      onClick={() => selectPicto(pid)}
                      className={`aspect-square rounded-lg border-2 p-1 flex items-center justify-center transition cursor-pointer hover:border-blue-400 ${
                        selected ? 'border-blue-400 bg-blue-500/20' : 'border-transparent bg-white/5'
                      }`}
                    >
                      <img
                        src={`${ARASAAC_V1}/${pid}`}
                        alt={p.keywords?.[0]?.keyword ?? ''}
                        className="w-full h-full object-contain"
                        crossOrigin="anonymous"
                      />
                    </button>
                  );
                })}
              </div>
            )}

            {/* Selected image preview */}
            {imageUrl && (
              <div className="mt-2 flex items-center gap-3 px-3 py-2 rounded-xl bg-slate-900/50 border border-white/5">
                {imageError ? (
                  <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center text-slate-500">
                    <ImageOff className="w-5 h-5" />
                  </div>
                ) : (
                  <img
                    src={imageUrl}
                    alt=""
                    className="w-10 h-10 object-contain rounded-lg"
                    crossOrigin="anonymous"
                    onError={() => setImageError(true)}
                    onLoad={() => setImageError(false)}
                  />
                )}
                <span className="text-[11px] text-slate-400 truncate flex-1">
                  {imageError ? 'No se pudo cargar la imagen' : `ARASAAC #${imageUrl.split('/').pop()}`}
                </span>
                <button
                  onClick={() => { setImageUrl(''); setImageError(false); setSearchQuery(''); setSearchResults([]); }}
                  className="p-1 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
              Categoría
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {categoryOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setCategoryId(opt.value)}
                  className={`flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-semibold border-2 transition cursor-pointer ${
                    categoryId === opt.value
                      ? 'ring-2 ring-blue-400 ring-offset-1 ring-offset-slate-800'
                      : 'hover:brightness-110'
                  }`}
                  style={{
                    backgroundColor: opt.color,
                    borderColor: categoryId === opt.value ? '#60A5FA' : opt.borderColor,
                    color: opt.value === 'none' ? '#94A3B8' : '#1E293B',
                  }}
                >
                  <span className="truncate">{opt.label.split('(')[0].trim()}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div
            className="rounded-xl border-2 p-3 flex flex-col items-center justify-center gap-1 min-h-[70px]"
            style={{
              backgroundColor: cat?.color ?? '#F3F4F6',
              borderColor: cat?.borderColor ?? '#D1D5DB',
            }}
          >
            {imageUrl && !imageError && (
              <img
                src={imageUrl}
                alt=""
                className="w-10 h-10 object-contain"
                crossOrigin="anonymous"
                onError={() => setImageError(true)}
              />
            )}
            <span className="text-sm font-bold text-slate-800 drop-shadow-[0_1px_0_rgba(255,255,255,0.6)]">
              {label.trim() || 'Vista previa'}
            </span>
          </div>

          {/* Behaviors */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-2">
              Comportamiento
            </label>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setSpeakOnTap((v) => !v)}
                className={`flex items-center gap-3 w-full px-3 py-2 rounded-xl border transition cursor-pointer ${
                  speakOnTap
                    ? 'bg-blue-500/20 border-blue-500/40'
                    : 'bg-slate-900/50 border-white/5 hover:border-white/20'
                }`}
              >
                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition ${
                  speakOnTap
                    ? 'border-blue-400 bg-blue-500'
                    : 'border-slate-500 bg-transparent'
                }`}>
                  {speakOnTap && (
                    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className="text-xs text-slate-300">Hablar al tocar</span>
              </button>
              <button
                type="button"
                onClick={() => setAddToSentence((v) => !v)}
                className={`flex items-center gap-3 w-full px-3 py-2 rounded-xl border transition cursor-pointer ${
                  addToSentence
                    ? 'bg-blue-500/20 border-blue-500/40'
                    : 'bg-slate-900/50 border-white/5 hover:border-white/20'
                }`}
              >
                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition ${
                  addToSentence
                    ? 'border-blue-400 bg-blue-500'
                    : 'border-slate-500 bg-transparent'
                }`}>
                  {addToSentence && (
                    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className="text-xs text-slate-300">Agregar a la frase</span>
              </button>
              <button
                type="button"
                onClick={() => setIsFolder((v) => !v)}
                className={`flex items-center gap-3 w-full px-3 py-2 rounded-xl border transition cursor-pointer ${
                  isFolder
                    ? 'bg-blue-500/20 border-blue-500/40'
                    : 'bg-slate-900/50 border-white/5 hover:border-white/20'
                }`}
              >
                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition ${
                  isFolder
                    ? 'border-blue-400 bg-blue-500'
                    : 'border-slate-500 bg-transparent'
                }`}>
                  {isFolder && (
                    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className="text-xs text-slate-300">Abrir sub-tablero</span>
              </button>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 px-5 py-4 border-t border-white/10">
          <button
            onClick={() => onDelete(position)}
            className="px-3 py-2 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-500/10 transition cursor-pointer"
          >
            Eliminar
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
            className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition cursor-pointer shadow-lg"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
