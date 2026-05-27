import { FITZGERALD_CATEGORIES } from '@picto/core';
import { Volume2, X, Trash2 } from 'lucide-react';

interface SentenceItem {
  id: string;
  label: string;
  categoryId: string;
}

interface Props {
  sentence: SentenceItem[];
  onRemove: (index: number) => void;
  onClear: () => void;
  onSpeak: () => void;
}

const categoryMap = new Map(FITZGERALD_CATEGORIES.map((c) => [c.id, c]));

export function SentenceBar({ sentence, onRemove, onClear, onSpeak }: Props) {
  return (
    <div className="sticky bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-md border-t border-white/10 px-4 py-3 shadow-2xl z-40 min-h-[60px]">
      <div className="flex items-center gap-2 max-w-2xl mx-auto h-full">
        <div className="flex-1 flex flex-wrap items-center gap-1.5 min-h-[36px]">
          {sentence.map((item, i) => {
            const cat = categoryMap.get(item.categoryId);
            return (
              <span
                key={`${item.id}-${i}`}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold text-slate-800 border shadow-sm"
                style={{
                  backgroundColor: cat?.color ?? '#F3F4F6',
                  borderColor: cat?.borderColor ?? '#D1D5DB',
                }}
              >
                {item.label}
                <button
                  onClick={() => onRemove(i)}
                  className="ml-0.5 p-0.5 rounded-full hover:bg-black/10 transition cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            );
          })}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={onClear}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 transition cursor-pointer"
            title="Limpiar"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={onSpeak}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded-xl font-bold text-sm transition cursor-pointer shadow-lg"
          >
            <Volume2 className="w-4 h-4" />
            Hablar
          </button>
        </div>
      </div>
    </div>
  );
}
