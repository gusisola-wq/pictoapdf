import React from 'react';
import { FileText } from 'lucide-react';

interface PageManagerProps {
  pagesCount: number;
  activePageIndex: number;
  onAddPage: () => void;
  onDeletePage: (index: number) => void;
  onSelectPage: (index: number) => void;
}

const XIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export const PageManager: React.FC<PageManagerProps> = ({
  pagesCount,
  activePageIndex,
  onAddPage,
  onDeletePage,
  onSelectPage,
}) => {
  return (
    <div className="bg-white/5 backdrop-blur-md p-5 rounded-2xl border border-white/10 shadow-lg text-slate-100">
      <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-3">
        <FileText className="w-4 h-4 text-blue-400" />
        Gestión de Hojas (Páginas)
      </h3>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {Array.from({ length: pagesCount }).map((_, idx) => (
          <div key={idx} className="relative group">
            <button
              onClick={() => onSelectPage(idx)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activePageIndex === idx
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10'
              }`}
            >
              Pág. {idx + 1}
            </button>
            {pagesCount > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeletePage(idx);
                }}
                className="absolute -top-1.5 -right-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-full p-0.5 shadow-md scale-0 group-hover:scale-100 transition-all duration-150"
                title="Eliminar esta página"
              >
                <XIcon className="w-2.5 h-2.5" />
              </button>
            )}
          </div>
        ))}
        <button
          onClick={onAddPage}
          className="px-3.5 py-1.5 text-xs font-medium border border-dashed border-white/20 hover:border-blue-400 text-slate-300 hover:bg-white/5 rounded-lg transition-all"
        >
          + Nueva
        </button>
      </div>
      <p className="text-[11px] text-slate-400">
        Puedes agregar múltiples hojas A4 y exportarlas juntas en un único PDF.
      </p>
    </div>
  );
};
