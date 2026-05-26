import { GridSettings } from '../types';

export const PAPER_SIZES = {
  A4: { width: 210, height: 297, label: 'A4' },
  A5: { width: 148, height: 210, label: 'A5' },
  A6: { width: 105, height: 148, label: 'A6' },
} as const;

export const PX_TO_MM = 0.264583;
export const PT_TO_MM = 0.353;
export const PT_TO_PX = 1.33;
export const A4_WIDTH_PX_96DPI = 793.7;

export const STORAGE_KEY = 'pictodraft-state';
export const TOAST_DURATION_MS = 4500;

export function getPaperDimensions(settings: GridSettings): { width: number; height: number } {
  let width: number;
  let height: number;

  if (settings.paperSize === 'custom') {
    width = Math.max(50, settings.paperWidth ?? 210);
    height = Math.max(50, settings.paperHeight ?? 297);
  } else {
    const preset = PAPER_SIZES[settings.paperSize as keyof typeof PAPER_SIZES] ?? PAPER_SIZES.A4;
    width = preset.width;
    height = preset.height;
  }

  if (settings.orientation === 'landscape') {
    [width, height] = [height, width];
  }

  return { width, height };
}

export function getPrintArea(settings: GridSettings): { width: number; height: number } {
  const dims = getPaperDimensions(settings);
  return {
    width: dims.width - settings.marginLeft - settings.marginRight,
    height: dims.height - settings.marginTop - settings.marginBottom,
  };
}
