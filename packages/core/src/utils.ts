import type { GridSettings } from './types';

let _idCounter = 0;

export function uid(prefix: string): string {
  return `${prefix}-${++_idCounter}-${Date.now()}`;
}

export const DEFAULT_SETTINGS: GridSettings = {
  columns: 4,
  rows: 4,
  gap: 4,
  borderColor: '#374151',
  borderWidth: 2,
  borderRadius: 8,
  textColor: '#1F2937',
  fontSize: 14,
  textPosition: 'bottom',
  textCase: 'uppercase',
  textBold: true,
  showGridLines: true,
  fitMode: 'contain',
  layoutMode: 'grid',
  picWidth: 46,
  picHeight: 46,
  paperSize: 'A4',
  orientation: 'portrait',
  paperWidth: 210,
  paperHeight: 297,
  marginTop: 5,
  marginBottom: 15,
  marginLeft: 5,
  marginRight: 5,
};
