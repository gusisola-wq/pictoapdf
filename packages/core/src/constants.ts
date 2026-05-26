import type { GridSettings } from './types';

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

export const SVG_RENDER_SIZE = 200;
export const CELL_PADDING_MM = 2;
export const INITIAL_SCALE_WIDTH = 680;

export const GRID_COLUMNS_MIN = 1;
export const GRID_COLUMNS_MAX = 10;
export const GRID_ROWS_MIN = 1;
export const GRID_ROWS_MAX = 12;

export const PIC_WIDTH_MIN = 15;
export const PIC_WIDTH_MAX = 190;
export const PIC_HEIGHT_MIN = 15;
export const PIC_HEIGHT_MAX = 260;

export const GAP_MIN = 0;
export const GAP_MAX = 20;

export const PAPER_DIM_MIN = 50;
export const PAPER_DIM_MAX = 500;

export const MARGIN_MIN = 0;
export const MARGIN_MAX = 50;

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
