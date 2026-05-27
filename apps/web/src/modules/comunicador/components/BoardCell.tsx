import { useState } from 'react';
import { type BoardCell as BoardCellType, FITZGERALD_CATEGORIES } from '@picto/core';
import { ChevronRight, Pencil, ImageOff } from 'lucide-react';

interface Props {
  cell: BoardCellType;
  editMode: boolean;
  onClick: () => void;
}

const categoryMap = new Map(FITZGERALD_CATEGORIES.map((c) => [c.id, c]));

export function BoardCellComponent({ cell, editMode, onClick }: Props) {
  const cat = categoryMap.get(cell.categoryId);
  const [imgError, setImgError] = useState(false);
  const isEmpty = !cell.label;
  // Fix legacy /png suffix from API URL
  const imgSrc = cell.imageUrl?.replace(/\/png(?:\?\d+)?$/, '');

  return (
    <button
      onClick={onClick}
      className={`
        relative flex flex-col items-center justify-center gap-0.5
        w-full h-full rounded-2xl border-2 p-1.5
        transition-transform active:scale-95 hover:ring-2 hover:ring-white/40
        cursor-pointer select-none overflow-hidden
        ${isEmpty ? 'border-dashed border-slate-500' : ''}
      `}
      style={isEmpty ? {} : {
        backgroundColor: cat?.color ?? '#F3F4F6',
        borderColor: cat?.borderColor ?? '#D1D5DB',
      }}
    >
      {editMode && !isEmpty && (
        <span className="absolute top-0.5 left-0.5 p-0.5 rounded-md bg-black/30 text-white/80 z-10">
          <Pencil className="w-2.5 h-2.5" />
        </span>
      )}

      {isEmpty ? (
        <span className="font-bold text-lg leading-none text-slate-500">+</span>
      ) : (
        <>
          {imgSrc && !imgError && (
              <img
              src={imgSrc}
              alt=""
              className="w-full h-full max-h-[65%] object-contain"
              crossOrigin="anonymous"
              onError={() => setImgError(true)}
              loading="lazy"
            />
          )}
          {imgSrc && imgError && (
            <span className="w-full h-full max-h-[65%] flex items-center justify-center text-slate-400">
              <ImageOff className="w-5 h-5" />
            </span>
          )}
          <span className="text-[10px] sm:text-xs font-bold leading-tight text-center text-slate-800 drop-shadow-[0_1px_0_rgba(255,255,255,0.6)] px-0.5 line-clamp-2">
            {cell.label}
          </span>
        </>
      )}

      {!isEmpty && cell.isFolder && (
        <span className="absolute top-0.5 right-0.5 text-slate-500">
          <ChevronRight className="w-3 h-3" />
        </span>
      )}
    </button>
  );
}
