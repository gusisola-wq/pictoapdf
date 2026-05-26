import type { FC } from 'react';
import { GridSettings } from '../types';
import { Type } from 'lucide-react';

interface TextStylingProps {
  settings: GridSettings;
  onSettingsChange: (settings: GridSettings) => void;
}

export const TextStyling: FC<TextStylingProps> = ({
  settings,
  onSettingsChange,
}) => {
  const handleSettingUpdate = <K extends keyof GridSettings>(
    key: K,
    value: GridSettings[K],
  ) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  return (
    <div className="bg-white/5 backdrop-blur-md p-5 rounded-2xl border border-white/10 shadow-lg text-slate-100">
      <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-4">
        <Type className="w-4 h-4 text-blue-400" />
        Estilos de Texto y Etiqueta
      </h3>

      <div className="mb-4">
        <label className="block text-xs font-medium text-slate-300 mb-1.5">
          Posición del Texto
        </label>
        <div className="grid grid-cols-3 gap-1 bg-slate-950/40 p-1 rounded-lg border border-white/5">
          {(['top', 'bottom', 'none'] as const).map((pos) => (
            <button
              key={pos}
              type="button"
              onClick={() => handleSettingUpdate('textPosition', pos)}
              className={`py-1 text-xs font-medium rounded-md capitalize transition-all ${
                settings.textPosition === pos
                  ? 'bg-white/10 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {pos === 'top' ? 'Arriba' : pos === 'bottom' ? 'Abajo' : 'Ocultar'}
            </button>
          ))}
        </div>
      </div>

      {settings.textPosition !== 'none' && (
        <>
          <div className="mb-4">
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-medium text-slate-300">Tamaño de Fuente</label>
              <span className="text-xs font-mono font-semibold text-slate-200 bg-white/5 px-1.5 py-0.5 rounded border border-white/5">
                {settings.fontSize} pt
              </span>
            </div>
            <input
              type="range"
              min="6"
              max="32"
              step="1"
              value={settings.fontSize}
              onChange={(e) => handleSettingUpdate('fontSize', parseInt(e.target.value))}
              className="w-full accent-blue-500 cursor-pointer h-1.5 bg-slate-900/50 rounded-lg appearance-none"
            />
          </div>

          <div className="flex flex-col gap-2.5 mb-4 border-t border-white/10 pt-3">
            <label className="flex items-center gap-2 text-xs font-medium text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.textBold}
                onChange={(e) => handleSettingUpdate('textBold', e.target.checked)}
                className="rounded text-blue-500 focus:ring-blue-500 bg-white/5 border-white/20 w-4 h-4"
              />
              Texto en Negrita (Bold)
            </label>

            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-300">Formato de Letra</span>
              <div className="flex gap-1 bg-slate-950/40 p-0.5 rounded-lg border border-white/5">
                {(['normal', 'uppercase', 'lowercase'] as const).map((caseStyle) => (
                  <button
                    key={caseStyle}
                    type="button"
                    onClick={() => handleSettingUpdate('textCase', caseStyle)}
                    className={`px-2 py-0.5 text-[10px] font-medium rounded transition ${
                      settings.textCase === caseStyle
                        ? 'bg-white/10 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {caseStyle === 'normal' ? 'Ab' : caseStyle === 'uppercase' ? 'AB' : 'ab'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      <div className="border-t border-white/10 pt-3 space-y-3">
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-medium text-slate-300">Grosor de Borde</label>
            <span className="text-xs font-mono text-slate-400">{settings.borderWidth} px</span>
          </div>
          <input
            type="range"
            min="0"
            max="6"
            step="1"
            value={settings.borderWidth}
            onChange={(e) => handleSettingUpdate('borderWidth', parseInt(e.target.value))}
            className="w-full accent-blue-500 cursor-pointer h-1.5 bg-slate-900/50 rounded-lg appearance-none"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-medium text-slate-300">Bordes Redondeados</label>
            <span className="text-xs font-mono text-slate-400">{settings.borderRadius} px</span>
          </div>
          <input
            type="range"
            min="0"
            max="20"
            step="1"
            value={settings.borderRadius}
            onChange={(e) => handleSettingUpdate('borderRadius', parseInt(e.target.value))}
            className="w-full accent-blue-500 cursor-pointer h-1.5 bg-slate-900/50 rounded-lg appearance-none"
          />
        </div>

        <div className="flex items-center justify-between text-xs text-slate-300 pt-1">
          <span>Ajuste de Imagen</span>
          <div className="flex gap-1 bg-slate-950/40 p-0.5 rounded-lg border border-white/5">
            {(['contain', 'cover'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => handleSettingUpdate('fitMode', mode)}
                className={`px-2.5 py-0.5 text-[10px] font-medium rounded transition ${
                  settings.fitMode === mode
                    ? 'bg-white/10 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title={mode === 'contain' ? 'Ajustar imagen conservando proporciones sin recortar' : 'Llenar recuadro (puede recortar la imagen)'}
              >
                {mode === 'contain' ? 'Ajustar' : 'Llenar'}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
