import React from 'react';
import { GridSettings } from '../types';
import { Columns, Grid3X3, Settings2, RefreshCw } from 'lucide-react';
import { getPrintArea, getPaperDimensions, PAPER_SIZES } from '../utils/constants';

interface GridControlsProps {
  settings: GridSettings;
  onSettingsChange: (settings: GridSettings) => void;
  onReflow: () => void;
}

export const GridControls: React.FC<GridControlsProps> = ({
  settings,
  onSettingsChange,
  onReflow,
}) => {
  const handleSettingUpdate = <K extends keyof GridSettings>(
    key: K,
    value: GridSettings[K],
  ) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  const onPaperSizeChange = (size: GridSettings['paperSize']) => {
    const preset = PAPER_SIZES[size as keyof typeof PAPER_SIZES];
    if (preset) {
      onSettingsChange({
        ...settings,
        paperSize: size,
        paperWidth: preset.width,
        paperHeight: preset.height,
      });
    } else {
      onSettingsChange({ ...settings, paperSize: size });
    }
  };

  const printArea = getPrintArea(settings);
  const paperDims = getPaperDimensions(settings);

  return (
    <div className="bg-white/5 backdrop-blur-md p-5 rounded-2xl border border-white/10 shadow-lg text-slate-100">
      <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-4">
        <Settings2 className="w-4 h-4 text-blue-400" />
        Dimensiones de la Cuadrícula
      </h3>

      <div className="grid grid-cols-2 gap-1 bg-slate-950/40 p-1 rounded-lg border border-white/5 mb-4">
        <button
          type="button"
          onClick={() => handleSettingUpdate('layoutMode', 'grid')}
          className={`py-1.5 text-xs font-medium rounded-md transition-all ${
            settings.layoutMode !== 'dimensions'
              ? 'bg-white/10 text-white shadow-sm font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Filas y Columnas
        </button>
        <button
          type="button"
          onClick={() => handleSettingUpdate('layoutMode', 'dimensions')}
          className={`py-1.5 text-xs font-medium rounded-md transition-all ${
            settings.layoutMode === 'dimensions'
              ? 'bg-white/10 text-white shadow-sm font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Medidas del Picto
        </button>
      </div>

      {settings.layoutMode !== 'dimensions' ? (
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Columns className="w-3.5 h-3.5 text-slate-400" />
              Columnas
            </label>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleSettingUpdate('columns', Math.max(1, settings.columns - 1))}
                className="w-8 h-8 flex items-center justify-center border border-white/10 rounded-lg hover:bg-white/10 active:bg-white/15 text-slate-200 text-sm font-bold"
              >
                -
              </button>
              <span className="flex-1 text-center font-mono text-sm font-semibold text-slate-100">
                {settings.columns}
              </span>
              <button
                type="button"
                onClick={() => handleSettingUpdate('columns', Math.min(10, settings.columns + 1))}
                className="w-8 h-8 flex items-center justify-center border border-white/10 rounded-lg hover:bg-white/10 active:bg-white/15 text-slate-200 text-sm font-bold"
              >
                +
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Grid3X3 className="w-3.5 h-3.5 text-slate-400" />
              Filas
            </label>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleSettingUpdate('rows', Math.max(1, settings.rows - 1))}
                className="w-8 h-8 flex items-center justify-center border border-white/10 rounded-lg hover:bg-white/10 active:bg-white/15 text-slate-200 text-sm font-bold"
              >
                -
              </button>
              <span className="flex-1 text-center font-mono text-sm font-semibold text-slate-100">
                {settings.rows}
              </span>
              <button
                type="button"
                onClick={() => handleSettingUpdate('rows', Math.min(12, settings.rows + 1))}
                className="w-8 h-8 flex items-center justify-center border border-white/10 rounded-lg hover:bg-white/10 active:bg-white/15 text-slate-200 text-sm font-bold"
              >
                +
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4 mb-4">
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                Ancho del Pictograma
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSettingUpdate('picWidth', Math.max(15, (settings.picWidth || 46) - 1))}
                  className="w-6 h-6 flex items-center justify-center border border-white/15 hover:bg-white/10 active:bg-white/15 rounded text-xs text-white"
                >
                  -
                </button>
                <span className="text-xs font-mono font-bold text-blue-300 bg-blue-900/40 px-1.5 py-0.5 rounded border border-blue-500/20">
                  {settings.picWidth || 46} mm
                </span>
                <button
                  type="button"
                  onClick={() => handleSettingUpdate('picWidth', Math.min(190, (settings.picWidth || 46) + 1))}
                  className="w-6 h-6 flex items-center justify-center border border-white/15 hover:bg-white/10 active:bg-white/15 rounded text-xs text-white"
                >
                  +
                </button>
              </div>
            </div>
            <input
              type="range"
              min="15"
              max="190"
              step="1"
              value={settings.picWidth || 46}
              onChange={(e) => handleSettingUpdate('picWidth', parseInt(e.target.value))}
              className="w-full accent-blue-500 cursor-pointer h-1.5 bg-slate-900/50 rounded-lg appearance-none"
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                Alto del Pictograma
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSettingUpdate('picHeight', Math.max(15, (settings.picHeight || 46) - 1))}
                  className="w-6 h-6 flex items-center justify-center border border-white/15 hover:bg-white/10 active:bg-white/15 rounded text-xs text-white"
                >
                  -
                </button>
                <span className="text-xs font-mono font-bold text-blue-300 bg-blue-900/40 px-1.5 py-0.5 rounded border border-blue-500/20">
                  {settings.picHeight || 46} mm
                </span>
                <button
                  type="button"
                  onClick={() => handleSettingUpdate('picHeight', Math.min(260, (settings.picHeight || 46) + 1))}
                  className="w-6 h-6 flex items-center justify-center border border-white/15 hover:bg-white/10 active:bg-white/15 rounded text-xs text-white"
                >
                  +
                </button>
              </div>
            </div>
            <input
              type="range"
              min="15"
              max="260"
              step="1"
              value={settings.picHeight || 46}
              onChange={(e) => handleSettingUpdate('picHeight', parseInt(e.target.value))}
              className="w-full accent-blue-500 cursor-pointer h-1.5 bg-slate-900/50 rounded-lg appearance-none"
            />
          </div>
          <div className="bg-blue-950/40 border border-blue-500/20 rounded-xl p-3 text-xs text-blue-300 space-y-1">
            <div className="font-semibold text-slate-200">
              Distribución automática calculada:
            </div>
            <div className="flex justify-between">
              <span>Columnas que caben:</span>
              <span className="font-mono text-white font-bold">
                {Math.max(1, Math.floor((printArea.width + settings.gap) / ((settings.picWidth || 46) + settings.gap)))}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Filas que caben:</span>
              <span className="font-mono text-white font-bold">
                {Math.max(1, Math.floor((printArea.height + settings.gap) / ((settings.picHeight || 46) + settings.gap)))}
              </span>
            </div>
            <div className="flex justify-between border-t border-white/10 pt-1 mt-1 text-[11px]">
              <span className="font-medium text-slate-300">Total por página {settings.paperSize.toUpperCase()}:</span>
              <span className="font-mono text-emerald-400 font-bold">
                {Math.max(1, Math.floor((printArea.width + settings.gap) / ((settings.picWidth || 46) + settings.gap))) *
                 Math.max(1, Math.floor((printArea.height + settings.gap) / ((settings.picHeight || 46) + settings.gap)))} pictos
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="mb-4">
        <div className="flex justify-between items-center mb-1.5">
          <label className="text-xs font-medium text-slate-300">
            Separación entre Pictogramas
          </label>
          <span className="text-xs font-mono font-semibold text-blue-300 bg-blue-900/40 border border-blue-500/20 px-1.5 py-0.5 rounded">
            {settings.gap} mm
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="20"
          step="1"
          value={settings.gap}
          onChange={(e) => handleSettingUpdate('gap', parseInt(e.target.value))}
          className="w-full accent-blue-500 cursor-pointer h-1.5 bg-slate-900/50 rounded-lg appearance-none"
        />
      </div>

      <button
        onClick={onReflow}
        className="w-full mb-4 py-2 px-3 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer active:scale-95"
        title="Reorganizar pictogramas en todas las páginas según las dimensiones actuales"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        Reorganizar Pictogramas
      </button>

      <div className="space-y-4">
        <div className="bg-slate-900/40 rounded-xl p-3.5 border border-white/5 text-xs space-y-3">
          <div className="font-semibold text-slate-200 mb-1 flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            Tamaño de Hoja
          </div>

          <div className="grid grid-cols-4 gap-1 bg-slate-950/40 p-1 rounded-lg border border-white/5">
            {(['A4', 'A5', 'A6', 'custom'] as const).map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => onPaperSizeChange(size)}
                className={`py-1 text-xs font-medium rounded-md transition-all ${
                  settings.paperSize === size
                    ? 'bg-white/10 text-white shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {size === 'custom' ? 'Personalizado' : size}
              </button>
            ))}
          </div>

          {settings.paperSize === 'custom' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">Ancho</label>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleSettingUpdate('paperWidth', Math.max(50, (settings.paperWidth ?? 210) - 1))}
                    className="w-6 h-6 flex items-center justify-center border border-white/15 hover:bg-white/10 rounded text-xs text-white"
                  >
                    -
                  </button>
                  <span className="flex-1 text-center font-mono text-xs font-bold text-blue-300 bg-blue-900/40 px-1 py-0.5 rounded border border-blue-500/20">
                    {settings.paperWidth ?? 210} mm
                  </span>
                  <button
                    onClick={() => handleSettingUpdate('paperWidth', Math.min(500, (settings.paperWidth ?? 210) + 1))}
                    className="w-6 h-6 flex items-center justify-center border border-white/15 hover:bg-white/10 rounded text-xs text-white"
                  >
                    +
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">Alto</label>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleSettingUpdate('paperHeight', Math.max(50, (settings.paperHeight ?? 297) - 1))}
                    className="w-6 h-6 flex items-center justify-center border border-white/15 hover:bg-white/10 rounded text-xs text-white"
                  >
                    -
                  </button>
                  <span className="flex-1 text-center font-mono text-xs font-bold text-blue-300 bg-blue-900/40 px-1 py-0.5 rounded border border-blue-500/20">
                    {settings.paperHeight ?? 297} mm
                  </span>
                  <button
                    onClick={() => handleSettingUpdate('paperHeight', Math.min(500, (settings.paperHeight ?? 297) + 1))}
                    className="w-6 h-6 flex items-center justify-center border border-white/15 hover:bg-white/10 rounded text-xs text-white"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center gap-1.5 text-slate-400 text-[11px] border-t border-white/5 pt-2">
            <span>Medida actual:</span>
            <span className="font-mono text-white font-semibold">{paperDims.width} x {paperDims.height} mm</span>
          </div>
        </div>

        <div className="bg-slate-900/40 rounded-xl p-3.5 border border-white/5 text-xs space-y-3">
          <div className="font-semibold text-slate-200 mb-1 flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            Márgenes (mm)
          </div>

          <MarginControl
            label="Superior"
            value={settings.marginTop}
            min={0}
            max={50}
            onChange={(v) => handleSettingUpdate('marginTop', v)}
          />
          <MarginControl
            label="Inferior"
            value={settings.marginBottom}
            min={0}
            max={50}
            onChange={(v) => handleSettingUpdate('marginBottom', v)}
          />
          <MarginControl
            label="Izquierdo"
            value={settings.marginLeft}
            min={0}
            max={50}
            onChange={(v) => handleSettingUpdate('marginLeft', v)}
          />
          <MarginControl
            label="Derecho"
            value={settings.marginRight}
            min={0}
            max={50}
            onChange={(v) => handleSettingUpdate('marginRight', v)}
          />
        </div>
      </div>
    </div>
  );
};

function MarginControl({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-400 text-[11px]">{label}</span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onChange(Math.max(min, value - 1))}
          className="w-6 h-6 flex items-center justify-center border border-white/15 hover:bg-white/10 rounded text-xs text-white font-bold"
        >
          -
        </button>
        <span className="w-10 text-center font-mono text-xs font-bold text-white bg-slate-950/60 px-1 py-0.5 rounded border border-white/10">
          {value}
        </span>
        <button
          onClick={() => onChange(Math.min(max, value + 1))}
          className="w-6 h-6 flex items-center justify-center border border-white/15 hover:bg-white/10 rounded text-xs text-white font-bold"
        >
          +
        </button>
      </div>
    </div>
  );
}
