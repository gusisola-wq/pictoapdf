import React, { useEffect, useState, useCallback } from 'react';
import { usePictoGrid } from './hooks/usePictoGrid';
import { useToast } from './hooks/useToast';
import { useConfirmModal } from './hooks/useConfirmModal';
import { A4PagePreview } from './components/A4PagePreview';
import { Controls } from './components/Controls';
import { getPaperDimensions } from './utils/constants';
import {
  Download,
  Sparkles,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Trash2,
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
  X,
} from 'lucide-react';

export default function App() {
  const { toastMessage, triggerToast } = useToast();
  const { confirmModal, showConfirm, hideConfirm } = useConfirmModal();

  const grid = usePictoGrid(triggerToast);

  const [fitZoomMode, setFitZoomMode] = useState<'width' | 'page'>('width');
  const [showHelp, setShowHelp] = useState(false);

  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);

  const handleToggleFit = useCallback(() => {
    const pane = document.getElementById('preview-container-pane');
    if (!pane) return;
    const paneWidth = pane.clientWidth;

    if (fitZoomMode === 'width') {
      const zoomBar = pane.querySelector('[class*="rounded-xl"]');
      const zoomRect = zoomBar?.getBoundingClientRect();
      const availableH = zoomRect ? window.innerHeight - zoomRect.bottom - 24 : 400;
      const paper = getPaperDimensions(grid.settings);
      const aspectRatio = paper.height / paper.width;
      const widthFromHeight = Math.max(200, availableH / aspectRatio);
      grid.setScaleWidth(Math.min(paneWidth - 24, widthFromHeight));
      setFitZoomMode('page');
    } else {
      grid.setScaleWidth(Math.min(800, paneWidth - 48));
      setFitZoomMode('width');
    }
  }, [fitZoomMode, grid.settings, grid.setScaleWidth]);

  useEffect(() => {
    const handleResize = () => {
      const pane = document.getElementById('preview-container-pane');
      if (!pane) return;
      const paneWidth = pane.clientWidth;
      if (fitZoomMode === 'page') {
        const zoomBar = pane.querySelector('[class*="rounded-xl"]');
        const zoomRect = zoomBar?.getBoundingClientRect();
        const availableH = zoomRect ? window.innerHeight - zoomRect.bottom - 24 : 400;
        const paper = getPaperDimensions(grid.settings);
        const aspectRatio = paper.height / paper.width;
        const widthFromHeight = Math.max(200, availableH / aspectRatio);
        grid.setScaleWidth(Math.min(paneWidth - 24, widthFromHeight));
      } else {
        grid.setScaleWidth(Math.min(780, Math.max(380, paneWidth - 48)));
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [fitZoomMode, grid.settings, grid.setScaleWidth]);

  const handleClearAllSlots = () => {
    showConfirm(
      'Vaciar Página Completa',
      '¿Estás seguro de que deseas vaciar por completo esta página? Se borrarán definitivamente todas las imágenes, los textos y los colores de las celdas.',
      () => {
        grid.clearAllSlots();
        hideConfirm();
      },
    );
  };

  const handleClearOnlyImages = () => {
    showConfirm(
      'Borrar únicamente Imágenes',
      '¿Estás seguro de que deseas borrar solamente las imágenes de esta página? Las etiquetas de texto escritas y los colores Fitzgerald se conservarán intactos para que puedas re-utilizarlos.',
      () => {
        grid.clearOnlyImages();
        hideConfirm();
      },
    );
  };

  const handleDeletePage = (idx: number) => {
    if (grid.pages.length <= 1) return;
    showConfirm(
      'Eliminar Página A4',
      `¿Estás seguro de que deseas eliminar la Página ${idx + 1}? Esta acción no se puede deshacer y se perderán todos sus pictogramas de forma permanente.`,
      () => {
        grid.deletePage(idx);
        hideConfirm();
      },
    );
  };

  return (
    <div
      className="h-dvh bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#334155] text-slate-100 flex flex-col font-sans overflow-hidden"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          grid.handleBulkUpload(e.dataTransfer.files);
        }
      }}
    >
      <header className="bg-white/5 backdrop-blur-md border-b border-white/10 py-3.5 px-6 shadow-lg shrink-0 flex items-center justify-between z-30 sticky top-0">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-600 rounded-lg text-white shadow-lg">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight uppercase text-slate-100">
              Picto a PDF
            </h1>
            <p className="text-xs text-slate-400">
              Generador de hojas de pictogramas offline
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowHelp(true)}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-white/5 rounded-lg transition border border-white/10 cursor-pointer"
            title="¿Cómo funciona?"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
          <button
            onClick={grid.handleExportPDF}
            disabled={grid.isGeneratingPDF}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs rounded-full transition shadow-lg shadow-blue-900/20 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{grid.isGeneratingPDF ? 'Creando...' : 'Exportar PDF'}</span>
          </button>
        </div>
      </header>

      {toastMessage && (
        <div className="fixed bottom-4 right-4 z-50 bg-slate-900/90 backdrop-blur-md border border-white/10 text-slate-100 text-xs px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 max-w-sm animate-bounce">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <main className={`flex-1 max-h-full flex flex-col lg:flex-row ${
          leftCollapsed !== rightCollapsed ? 'overflow-hidden' : 'overflow-y-auto'
        } lg:overflow-hidden`}>
        <div
          className={`w-full lg:w-[420px] bg-white/5 backdrop-blur-xl border-r border-white/10 p-4 lg:p-6 flex flex-col lg:overflow-y-auto lg:max-h-full min-h-0 ${
            leftCollapsed ? 'flex-none' : (rightCollapsed ? 'flex-1 overflow-y-auto' : 'min-h-full shrink-0')
          } lg:flex-none lg:min-h-0`}
        >
          <div className="lg:hidden flex items-center justify-between mb-3 shrink-0">
            <span className="text-xs font-semibold tracking-wide text-slate-400 uppercase">Controles</span>
            <button
              onClick={() => setLeftCollapsed(c => !c)}
              className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-slate-200 transition cursor-pointer"
            >
              {leftCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
          </div>
          <div className={leftCollapsed ? 'hidden lg:block' : 'flex flex-col flex-1'}>
            <Controls
              settings={grid.settings}
              onSettingsChange={grid.setSettings}
              selectedSlot={grid.selectedSlot}
              selectedSlotItem={
                grid.selectedSlot !== null
                  ? grid.activePage.pictograms[grid.selectedSlot]
                  : undefined
              }
              onUpdateSlot={grid.handleUpdateSlot}
              onClearAllSlots={handleClearAllSlots}
              onClearOnlyImages={handleClearOnlyImages}
              onLoadSamples={grid.handleLoadSamples}
              onExportPDF={grid.handleExportPDF}
              pagesCount={grid.pages.length}
              activePageIndex={grid.activePageIndex}
              onAddPage={grid.handleAddPage}
              onDeletePage={handleDeletePage}
              onSelectPage={grid.setActivePageIndex}
              onBulkUpload={grid.handleBulkUpload}
              onReflow={grid.handleReflowPictograms}
              onResetAll={() =>
                showConfirm(
                  'Restablecer Picto a PDF',
                  '¿Estás seguro de que deseas restablecer la configuración de fábrica? Se eliminarán todas las imágenes, textos, colores, páginas y configuraciones personalizadas guardadas. Esta acción no se puede deshacer.',
                  () => {
                    grid.handleResetAll();
                    hideConfirm();
                  },
                )
              }
              isGeneratingPDF={grid.isGeneratingPDF}
              onCloseCellEditor={() => grid.setSelectedSlot(null)}
            />
          </div>
        </div>

        {!leftCollapsed && !rightCollapsed && (
          <div className="sticky bottom-0 z-10 lg:hidden bg-slate-800/90 backdrop-blur-md border-t border-white/10 px-4 py-2.5 flex items-center justify-between shrink-0">
            <span className="text-xs font-semibold tracking-wide text-slate-400 uppercase">Vista Previa</span>
            <button
              onClick={() => setRightCollapsed(true)}
              className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-slate-200 transition cursor-pointer"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        )}

        <div
          id="preview-container-pane"
          className={`flex flex-col bg-black/20 p-4 lg:p-6 select-none relative min-h-0 lg:overflow-y-auto ${
            rightCollapsed ? 'flex-none' : (leftCollapsed ? 'flex-1 overflow-y-auto' : 'min-h-full shrink-0')
          } lg:flex-1 lg:min-h-0`}
        >
          <div className={`lg:hidden items-center justify-between mb-3 shrink-0 ${
            leftCollapsed || rightCollapsed ? 'flex' : 'hidden'
          }`}>
            <span className="text-xs font-semibold tracking-wide text-slate-400 uppercase">Vista Previa</span>
            <button
              onClick={() => setRightCollapsed(c => !c)}
              className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-slate-200 transition cursor-pointer"
            >
              {rightCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
          </div>
          <div className={rightCollapsed ? 'hidden lg:flex flex-col' : 'flex flex-col flex-1'}>
            <div className="bg-white/5 backdrop-blur-md p-3 rounded-xl border border-white/10 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4 mb-4 shrink-0">
              <div className="flex items-center gap-3">
                <button
                  disabled={grid.activePageIndex === 0}
                  onClick={() => {
                    grid.setActivePageIndex(Math.max(0, grid.activePageIndex - 1));
                    grid.setSelectedSlot(null);
                    grid.setMoveSourceSlot(null);
                  }}
                  className={`p-1.5 rounded-lg border transition ${
                    grid.activePageIndex === 0
                      ? 'border-white/5 text-slate-600 cursor-not-allowed'
                      : 'border-white/15 hover:bg-white/5 text-slate-300'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="text-xs font-bold text-slate-200">
                  HOJA {grid.activePageIndex + 1} de {grid.pages.length}
                </div>

                <button
                  disabled={grid.activePageIndex === grid.pages.length - 1}
                  onClick={() => {
                    grid.setActivePageIndex(Math.min(grid.pages.length - 1, grid.activePageIndex + 1));
                    grid.setSelectedSlot(null);
                    grid.setMoveSourceSlot(null);
                  }}
                  className={`p-1.5 rounded-lg border transition ${
                    grid.activePageIndex === grid.pages.length - 1
                      ? 'border-white/5 text-slate-600 cursor-not-allowed'
                      : 'border-white/15 hover:bg-white/5 text-slate-300'
                  }`}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                <span className="text-xs font-medium text-slate-400 italic">
                  {grid.activePage.name}
                </span>

                <div className="flex items-center gap-1.5 ml-1 border-l border-white/10 pl-2.5">
                  <button
                    type="button"
                    onClick={handleClearOnlyImages}
                    className="px-2.5 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 rounded-lg text-[10px] font-semibold transition cursor-pointer"
                    title="Borrar todas las imágenes de esta página conservando las etiquetas escritas"
                  >
                    Borrar Imágenes
                  </button>
                  <button
                    type="button"
                    onClick={handleClearAllSlots}
                    className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 rounded-lg text-[10px] font-semibold transition cursor-pointer"
                    title="Vaciar texto e imágenes de todas las celdas"
                  >
                    Vaciar Todo
                  </button>
                  {grid.pages.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleDeletePage(grid.activePageIndex)}
                      className="px-2.5 py-1 bg-rose-600/10 hover:bg-rose-600/20 text-rose-300 border border-rose-600/20 rounded-lg text-[10px] font-semibold transition cursor-pointer"
                      title="Eliminar esta página completa"
                    >
                      Borrar Página
                    </button>
                  )}
                </div>
              </div>

              {grid.moveSourceSlot !== null && (
                <div className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-200 rounded-lg text-[11px] font-semibold animate-pulse">
                  Modo Reordenar: Haz clic en otra celda de la hoja para intercambiar
                </div>
              )}

              <div className="flex items-center gap-3">
                <button
                  onClick={() => grid.setScaleWidth(Math.max(300, grid.scaleWidth - 50))}
                  className="p-1 text-slate-400 hover:text-slate-200 hover:bg-white/5 rounded transition"
                  title="Reducir tamaño del preview"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-1">
                  <span className="text-xs font-mono font-semibold text-slate-400">Preview:</span>
                  <span className="text-xs font-mono font-bold text-slate-200">
                    {Math.round((grid.scaleWidth / 793.7) * 100)}%
                  </span>
                </div>

                <button
                  onClick={() => grid.setScaleWidth(Math.min(1200, grid.scaleWidth + 50))}
                  className="p-1 text-slate-400 hover:text-slate-200 hover:bg-white/5 rounded transition"
                  title="Ampliar tamaño del preview"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>

                <button
                  onClick={handleToggleFit}
                  className={`p-1 rounded transition border ${
                    fitZoomMode === 'page'
                      ? 'bg-blue-600/20 text-blue-300 border-blue-500/40'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border-white/10'
                  }`}
                  title={fitZoomMode === 'page' ? 'Ajustar al ancho' : 'Ajustar a página completa'}
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="flex-1 flex justify-center items-start overflow-x-auto min-h-0">
              <A4PagePreview
                page={grid.activePage}
                settings={grid.settings}
                scaleWidth={grid.scaleWidth}
                selectedSlot={grid.selectedSlot}
                onSlotSelect={(idx) => {
                  grid.setSelectedSlot(idx === grid.selectedSlot ? null : idx);
                  grid.setMoveSourceSlot(null);
                }}
                onSlotClear={(idx, e) => {
                  e.stopPropagation();
                  grid.handleUpdateSlot(idx, null);
                }}
                onSlotMoveStart={grid.handleSlotMoveStart}
                moveSourceSlot={grid.moveSourceSlot}
                onSlotDropToSwap={grid.handleSlotDropToSwap}
              />
            </div>
          </div>
        </div>

      </main>

      {confirmModal.isOpen && (
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
                onClick={confirmModal.onConfirm}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs rounded-lg transition shadow-lg shadow-rose-950/20 cursor-pointer"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {showHelp && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]">
          <div className="bg-slate-900 border border-white/10 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative text-left animate-in fade-in duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-blue-400" />
                ¿Cómo funciona este Generador de Pictogramas?
              </h3>
              <button
                onClick={() => setShowHelp(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4 text-xs text-slate-300">
              <div className="space-y-1 bg-slate-950/40 p-3.5 rounded-xl border border-white/5">
                <div className="font-bold text-slate-100 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-300 flex items-center justify-center font-mono shrink-0">1</span>
                  Carga tus imágenes
                </div>
                <p className="leading-relaxed text-slate-400">
                  Haz clic en cualquier celda para cargar fotos o dibujos desde tu PC o tablet. También puedes <strong>arrastrar y soltar múltiples archivos</strong> de golpe. Todo el proceso se realiza <strong>en forma local</strong>: tus imágenes nunca salen de tu dispositivo.
                </p>
              </div>
              <div className="space-y-1 bg-slate-950/40 p-3.5 rounded-xl border border-white/5">
                <div className="font-bold text-slate-100 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-mono shrink-0">2</span>
                  Ajusta la cuadrícula
                </div>
                <p className="leading-relaxed text-slate-400">
                  Cambia el número de filas, columnas y la separación entre ellas (gap). Todas las celdas conservarán exactamente el mismo tamaño para un acabado perfecto.
                </p>
              </div>
              <div className="space-y-1 bg-slate-950/40 p-3.5 rounded-xl border border-white/5">
                <div className="font-bold text-slate-100 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center font-mono shrink-0">3</span>
                  Reorganiza el contenido
                </div>
                <p className="leading-relaxed text-slate-400">
                  Si al modificar el tamaño de la cuadrícula algunas imágenes quedan fuera de la hoja, usa el botón <strong>"Reorganizar Pictogramas"</strong> para redistribuirlas automáticamente en todas las páginas sin perder ninguna.
                </p>
              </div>
              <div className="space-y-1 bg-slate-950/40 p-3.5 rounded-xl border border-white/5">
                <div className="font-bold text-slate-100 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center font-mono shrink-0">4</span>
                  Exporta a PDF
                </div>
                <p className="leading-relaxed text-slate-400">
                  Exporta tu composición a un PDF estandarizado. La generación del PDF se realiza <strong>en forma local</strong> en tu dispositivo, sin enviar ningún dato a servidores externos.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
