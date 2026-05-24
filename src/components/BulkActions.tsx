import React, { useRef } from 'react';
import {
  UploadCloud,
  FolderOpen,
  Sparkles,
  Trash2,
  Download,
  RefreshCw,
} from 'lucide-react';

interface BulkActionsProps {
  onBulkUpload: (files: FileList) => void;
  onLoadSamples: () => void;
  onClearOnlyImages: () => void;
  onClearAllSlots: () => void;
  onExportPDF: () => void;
  onResetAll: () => void;
  isGeneratingPDF: boolean;
}

export const BulkActions: React.FC<BulkActionsProps> = ({
  onBulkUpload,
  onLoadSamples,
  onClearOnlyImages,
  onClearAllSlots,
  onExportPDF,
  onResetAll,
  isGeneratingPDF,
}) => {
  const bulkInputRef = useRef<HTMLInputElement>(null);

  const handleBulkFilesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      onBulkUpload(e.target.files);
    }
    e.target.value = '';
  };

  return (
    <div className="bg-white/5 backdrop-blur-md p-5 rounded-2xl border border-white/10 shadow-lg text-slate-100 space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-3">
          <UploadCloud className="w-4 h-4 text-emerald-400" />
          Cargar por Lotes (Bulk Upload)
        </h3>
        <div
          onClick={() => bulkInputRef.current?.click()}
          className="border border-dashed border-emerald-500/30 hover:border-emerald-400 bg-emerald-950/25 hover:bg-emerald-950/35 p-3 rounded-xl text-center cursor-pointer transition-all duration-200"
        >
          <FolderOpen className="w-5 h-5 text-emerald-400 mx-auto mb-1.5" />
          <span className="text-[11px] font-semibold text-emerald-300">Arrastrar o seleccionar lote de imágenes</span>
          <p className="text-[9px] text-slate-400 mt-0.5 leading-relaxed">Se colocarán consecutivamente en las celdas vacías.</p>
          <input
            type="file"
            ref={bulkInputRef}
            onChange={handleBulkFilesSelect}
            multiple
            accept="image/*"
            className="hidden"
          />
        </div>
      </div>

      <div className="border-t border-white/10 pt-3 space-y-3">
        <div className="flex justify-between items-center text-xs">
          <span className="font-semibold text-slate-200">Acciones Globales</span>
        </div>

        <div className="space-y-2">
          <button
            onClick={onLoadSamples}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10 text-slate-200 font-medium rounded-lg text-xs transition border border-white/5"
            title="Cargar rutinas diarias de ejemplo"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Cargar Ejemplo de Rutina
          </button>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onClearOnlyImages}
              className="flex items-center justify-center gap-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 rounded-lg text-xs font-semibold py-2 transition"
              title="Borrar únicamente las imágenes de la página conservando los textos"
            >
              <Trash2 className="w-3.5 h-3.5 opacity-60" />
              Borrar Imágenes
            </button>
            <button
              onClick={onClearAllSlots}
              className="flex items-center justify-center gap-1 border border-rose-600/30 hover:bg-rose-600/20 text-rose-200 font-semibold rounded-lg text-xs py-2 transition"
              title="Vaciar las imágenes y los textos de la página"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Vaciar Página
            </button>
          </div>
        </div>

        <button
          onClick={onExportPDF}
          disabled={isGeneratingPDF}
          className={`w-full py-3 px-4 text-white font-semibold rounded-xl shadow-lg flex items-center justify-center gap-2 text-sm transition-all duration-200 cursor-pointer ${
            isGeneratingPDF
              ? 'bg-slate-700 text-slate-400 cursor-not-allowed border border-white/10'
              : 'bg-emerald-600 hover:bg-emerald-500 hover:shadow-emerald-950/20 active:scale-[0.98]'
          }`}
        >
          {isGeneratingPDF ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-white/50" />
              Generando PDF...
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              Exportar a PDF Impresora
            </>
          )}
        </button>

        <button
          onClick={onResetAll}
          className="w-full py-3 px-4 bg-rose-700 hover:bg-rose-600 text-white font-semibold rounded-xl shadow-lg flex items-center justify-center gap-2 text-sm transition-all duration-200 cursor-pointer active:scale-95"
        >
          <RefreshCw className="w-4 h-4" />
          Restablecer a Configuración Inicial
        </button>
      </div>
    </div>
  );
};
