import React, { useRef } from 'react';
import { PictogramItem, FITZGERALD_CATEGORIES } from '../types';
import { Settings2, UploadCloud, Trash2, HelpCircle, X } from 'lucide-react';

interface CellEditorProps {
  selectedSlot: number | null;
  selectedSlotItem: PictogramItem | undefined;
  onUpdateSlot: (slotIdx: number, item: Partial<PictogramItem> | null) => void;
  onClose?: () => void;
}

export const CellEditor: React.FC<CellEditorProps> = ({
  selectedSlot,
  selectedSlotItem,
  onUpdateSlot,
  onClose,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCellImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (selectedSlot === null || !e.target.files?.[0]) return;
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      onUpdateSlot(selectedSlot, {
        imageUrl: reader.result as string,
        label: selectedSlotItem?.label ? selectedSlotItem.label : file.name.split('.')[0],
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleCellImageDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (selectedSlot === null || !e.dataTransfer.files?.[0]) return;
    const file = e.dataTransfer.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      onUpdateSlot(selectedSlot, {
        imageUrl: reader.result as string,
        label: selectedSlotItem?.label ? selectedSlotItem.label : file.name.split('.')[0],
      });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className={`p-5 rounded-2xl border transition-all duration-300 shadow-lg ${
      selectedSlot !== null
        ? 'bg-blue-950/30 border-blue-500/50 ring-2 ring-blue-500/20 text-slate-100'
        : 'bg-white/5 backdrop-blur-md border-white/10 text-slate-300'
    }`}>
      {selectedSlot === null ? (
        <div className="text-center py-4">
          <Settings2 className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <h3 className="text-xs font-semibold text-slate-200 mb-1">Editar Celda</h3>
          <p className="text-[11px] text-slate-400 max-w-[240px] mx-auto leading-relaxed">
            Haz clic en cualquier celda para cargarle una imagen, cambiar su etiqueta y clase de color.
          </p>
        </div>
      ) : (
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xs font-bold text-blue-300 uppercase tracking-wide">
              Configurar Celda #{selectedSlot + 1}
            </h3>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => onUpdateSlot(selectedSlot, null)}
                className="text-[10px] text-rose-400 hover:text-rose-300 font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Vaciar celda"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Vaciar
              </button>
              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-white/10 transition-colors cursor-pointer"
                  title="Cerrar editor"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="mb-3">
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              Etiqueta / Texto de la Celda
            </label>
            <input
              type="text"
              placeholder="Escribe el nombre del pictograma..."
              value={selectedSlotItem?.label || ''}
              onChange={(e) => onUpdateSlot(selectedSlot, { label: e.target.value })}
              className="w-full text-xs p-2.5 rounded-lg border border-white/15 focus:border-blue-400 focus:outline-none bg-slate-950/50 text-white font-sans shadow-inner transition-colors"
            />
          </div>

          <div className="mb-4">
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              Imagen / Pictograma
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleCellImageDrop}
              className="border-2 border-dashed border-blue-500/30 hover:border-blue-400 bg-blue-950/20 hover:bg-blue-950/30 rounded-xl p-4 cursor-pointer text-center transition-all duration-200"
            >
              {selectedSlotItem?.imageUrl ? (
                <div className="flex flex-col items-center gap-1.5">
                  <img
                    src={selectedSlotItem.imageUrl}
                    alt="Miniatura"
                    className="h-10 w-10 object-contain rounded shadow bg-white border border-white/10"
                  />
                  <span className="text-[10px] text-blue-300 font-semibold underline">Cambiar imagen</span>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <UploadCloud className="w-6 h-6 text-blue-400 mb-1" />
                  <span className="text-[10px] text-blue-300 font-semibold">Seleccionar o soltar imagen</span>
                  <span className="text-[9px] text-slate-400 mt-0.5">PNG, JPG, SVG, etc.</span>
                </div>
              )}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleCellImageSelect}
                accept="image/*"
                className="hidden"
              />
            </div>
          </div>

          <div className="border-t border-white/10 pt-3">
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                Categoría de Color (Fitzgerald Key)
                <span className="group relative cursor-help">
                  <HelpCircle className="w-3 h-3 text-slate-400 hover:text-slate-200" />
                  <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 p-2.5 bg-slate-950 border border-white/15 text-slate-300 text-[9px] rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30 leading-normal">
                    Estándar comunicativo visual donde cada categoría gramatical tiene un color para facilitar el lenguaje.
                  </span>
                </span>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-1.5 text-[10px]">
              {FITZGERALD_CATEGORIES.map((cat) => {
                const isSelected = (selectedSlotItem?.categoryId || 'none') === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => onUpdateSlot(selectedSlot, { categoryId: cat.id })}
                    className={`flex items-center gap-1.5 p-1.5 rounded-md border text-left transition ${
                      isSelected
                        ? 'border-blue-500 font-bold bg-white/10 text-white ring-1 ring-blue-500/40 shadow-sm'
                        : 'border-white/10 hover:bg-white/5 text-slate-300'
                    }`}
                    style={{ borderLeftColor: cat.borderColor, borderLeftWidth: '3.5px' }}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full border border-white/25 shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="truncate">{cat.name.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>

            <div className="mt-3 flex items-center gap-2">
              <span className="text-[10px] text-slate-400 shrink-0">O color personalizado:</span>
              <input
                type="color"
                value={selectedSlotItem?.customColor || '#FFFFFF'}
                onChange={(e) => onUpdateSlot(selectedSlot, { customColor: e.target.value })}
                className="w-6 h-6 p-0 border border-white/20 rounded cursor-pointer bg-transparent"
                title="Fondo personalizado"
              />
              {selectedSlotItem?.customColor && (
                <button
                  onClick={() => onUpdateSlot(selectedSlot, { customColor: undefined })}
                  className="text-[9px] text-rose-400 underline hover:text-rose-300"
                >
                  Restablecer
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
