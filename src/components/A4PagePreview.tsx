import React from 'react';
import { SheetPage, GridSettings, FITZGERALD_CATEGORIES } from '../types';
import { Plus, X, ArrowLeftRight } from 'lucide-react';
import { getPaperDimensions, getPrintArea, A4_WIDTH_PX_96DPI, PT_TO_PX } from '../utils/constants';

interface A4PagePreviewProps {
  page: SheetPage;
  settings: GridSettings;
  scaleWidth: number;
  selectedSlot: number | null;
  onSlotSelect: (slotIndex: number) => void;
  onSlotClear: (slotIndex: number, e: React.MouseEvent) => void;
  onSlotMoveStart: (slotIndex: number, e: React.MouseEvent) => void;
  moveSourceSlot: number | null;
  onSlotDropToSwap: (targetIndex: number) => void;
}

export const A4PagePreview: React.FC<A4PagePreviewProps> = ({
  page,
  settings,
  scaleWidth,
  selectedSlot,
  onSlotSelect,
  onSlotClear,
  onSlotMoveStart,
  moveSourceSlot,
  onSlotDropToSwap,
}) => {
  const paper = getPaperDimensions(settings);
  const printArea = getPrintArea(settings);
  const aspectRatio = paper.height / paper.width;
  const scaleHeight = scaleWidth * aspectRatio;

  const marginLeft = (settings.marginLeft / paper.width) * scaleWidth;
  const marginRight = (settings.marginRight / paper.width) * scaleWidth;
  const marginTop = (settings.marginTop / paper.height) * scaleHeight;
  const marginBottom = (settings.marginBottom / paper.height) * scaleHeight;

  let cols = settings.columns;
  let rows = settings.rows;

  if (settings.layoutMode === 'dimensions') {
    const gapMm = settings.gap;
    cols = Math.max(1, Math.floor((printArea.width + gapMm) / (settings.picWidth + gapMm)));
    rows = Math.max(1, Math.floor((printArea.height + gapMm) / (settings.picHeight + gapMm)));
  }

  const gap = (settings.gap / paper.width) * scaleWidth;

  const gridWidth = scaleWidth - marginLeft - marginRight;
  const gridHeight = scaleHeight - marginTop - marginBottom;
  const mmToPx = scaleWidth / paper.width;

  let cellWidthPx: number;
  let cellHeightPx: number;
  let calculatedGridWidth: number;
  let calculatedGridHeight: number;
  let leftOffset: number;
  let topOffset: number;

  if (settings.layoutMode === 'dimensions') {
    cellWidthPx = settings.picWidth * mmToPx;
    cellHeightPx = settings.picHeight * mmToPx;
    calculatedGridWidth = cols * cellWidthPx + (cols - 1) * gap;
    calculatedGridHeight = rows * cellHeightPx + (rows - 1) * gap;
    leftOffset = marginLeft + Math.max(0, (gridWidth - calculatedGridWidth) / 2);
    topOffset = marginTop + Math.max(0, (gridHeight - calculatedGridHeight) / 2);
  } else {
    calculatedGridWidth = gridWidth;
    calculatedGridHeight = gridHeight;
    cellWidthPx = (gridWidth - (cols - 1) * gap) / cols;
    cellHeightPx = (gridHeight - (rows - 1) * gap) / rows;
    leftOffset = marginLeft;
    topOffset = marginTop;
  }

  return (
    <div className="relative flex justify-center items-center py-6">
      <div
        id="a4-sheet-preview"
        className="relative bg-white shadow-2xl transition-all duration-300 border border-neutral-300"
        style={{
          width: `${scaleWidth}px`,
          height: `${scaleHeight}px`,
        }}
      >
        {settings.showGridLines && (
          <div
            className="absolute border border-dashed border-sky-300/40 pointer-events-none"
            style={{
              left: `${marginLeft}px`,
              top: `${marginTop}px`,
              width: `${gridWidth}px`,
              height: `${gridHeight}px`,
            }}
          />
        )}

        <div
          className="absolute"
          style={{
            left: `${leftOffset}px`,
            top: `${topOffset}px`,
            width: `${calculatedGridWidth}px`,
            height: `${calculatedGridHeight}px`,
            display: 'grid',
            gridTemplateColumns: `repeat(${cols}, ${settings.layoutMode === 'dimensions' ? `${cellWidthPx}px` : '1fr'})`,
            gridTemplateRows: `repeat(${rows}, ${settings.layoutMode === 'dimensions' ? `${cellHeightPx}px` : '1fr'})`,
            gap: `${gap}px`,
          }}
        >
          {Array.from({ length: rows * cols }).map((_, idx) => {
            const pic = page.pictograms[idx];
            const isSelected = selectedSlot === idx;
            const isMovingSource = moveSourceSlot === idx;

            let bgColor = '#FFFFFF';
            let borderColor = settings.borderColor || '#D1D5DB';

            if (pic) {
              const category = FITZGERALD_CATEGORIES.find((cat) => cat.id === pic.categoryId);
              if (category && category.id !== 'none') {
                bgColor = category.color;
                borderColor = category.borderColor;
              }
              if (pic.customColor) {
                bgColor = pic.customColor;
              }
            }

            let labelText = pic ? pic.label : '';
            if (settings.textCase === 'uppercase') {
              labelText = labelText.toUpperCase();
            } else if (settings.textCase === 'lowercase') {
              labelText = labelText.toLowerCase();
            }

            const borderStyle = {
              borderColor,
              borderWidth: `${settings.borderWidth}px`,
              borderRadius: `${settings.borderRadius}px`,
              backgroundColor: bgColor,
            };

            const scaleFactor = scaleWidth / A4_WIDTH_PX_96DPI;
            const scaledFontSize = Math.max(7, settings.fontSize * PT_TO_PX * scaleFactor);

            return (
              <div
                key={idx}
                id={`cell-slot-${idx}`}
                className={`relative group flex flex-col justify-between overflow-hidden cursor-pointer select-none transition-all duration-200 ${
                  isSelected ? 'ring-3 ring-sky-500 ring-offset-1 z-10 scale-[1.02]' : ''
                } ${isMovingSource ? 'opacity-50 ring-2 ring-amber-500 ring-offset-1 scale-[0.98]' : ''} ${
                  moveSourceSlot !== null && moveSourceSlot !== idx
                    ? 'hover:ring-3 hover:ring-amber-400 hover:scale-[1.01]'
                    : 'hover:shadow-md'
                }`}
                style={borderStyle}
                onClick={() => {
                  if (moveSourceSlot !== null) {
                    onSlotDropToSwap(idx);
                  } else {
                    onSlotSelect(idx);
                  }
                }}
                onDragOver={(e) => e.preventDefault()}
              >
                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 flex gap-1 z-20 transition-opacity">
                  {pic && (
                    <>
                      <button
                        title="Intercambiar / Mover"
                        className="p-1 text-xs bg-amber-500 text-white rounded hover:bg-amber-600 transition shadow"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSlotMoveStart(idx, e);
                        }}
                      >
                        <ArrowLeftRight className="w-3 h-3" />
                      </button>
                      <button
                        title="Eliminar pictograma"
                        className="p-1 text-xs bg-rose-500 text-white rounded hover:bg-rose-600 transition shadow"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSlotClear(idx, e);
                        }}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </>
                  )}
                </div>

                {!pic && (
                  <div className="absolute bottom-1 right-2 text-[10px] text-neutral-300 font-mono">
                    #{idx + 1}
                  </div>
                )}

                {settings.textPosition === 'top' && (
                  <div
                    className="w-full text-center px-1 font-sans py-0.5 mt-0.5 font-medium break-words leading-tight flex-none"
                    style={{
                      fontSize: `${scaledFontSize}px`,
                      color: settings.textColor,
                      fontWeight: settings.textBold ? 'bold' : 'normal',
                    }}
                  >
                    {labelText || <span className="opacity-0">.</span>}
                  </div>
                )}

                <div className="flex-1 w-full h-full min-h-0 flex items-center justify-center p-1.5 relative">
                  {pic && pic.imageUrl ? (
                    <img
                      src={pic.imageUrl}
                      alt={pic.label}
                      referrerPolicy="no-referrer"
                      className={`w-full h-full max-w-full max-h-full ${
                        settings.fitMode === 'contain' ? 'object-contain' : 'object-cover'
                      }`}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-neutral-300 group-hover:text-neutral-400 transition-colors">
                      <Plus className="w-5 h-5 mb-1 stroke-[1.5]" />
                      <span className="text-[10px] text-center font-sans px-1">Cargar</span>
                    </div>
                  )}
                </div>

                {settings.textPosition === 'bottom' && (
                  <div
                    className="w-full text-center px-1 font-sans py-0.5 mb-0.5 font-medium break-words leading-tight flex-none"
                    style={{
                      fontSize: `${scaledFontSize}px`,
                      color: settings.textColor,
                      fontWeight: settings.textBold ? 'bold' : 'normal',
                    }}
                  >
                    {labelText || <span className="opacity-0">.</span>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
