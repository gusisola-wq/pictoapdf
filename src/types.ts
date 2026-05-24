export type TextPosition = 'top' | 'bottom' | 'none';
export type TextCase = 'uppercase' | 'lowercase' | 'normal';
export type PaperSize = 'A4' | 'A5' | 'A6' | 'custom';

export interface FitzgeraldCategory {
  id: string;
  name: string;
  color: string; // Tailwind background style or hex color
  borderColor: string;
}

export const FITZGERALD_CATEGORIES: FitzgeraldCategory[] = [
  { id: 'none', name: 'Sin categoría (Blanco)', color: '#FFFFFF', borderColor: '#D1D5DB' },
  { id: 'noun', name: 'Sustantivo (Naranja/Amarillo)', color: '#FEF3C7', borderColor: '#F59E0B' }, // Yellow-100 / Amber
  { id: 'verb', name: 'Verbo (Verde)', color: '#DCFCE7', borderColor: '#10B981' }, // Green-100
  { id: 'adjective', name: 'Adjetivo (Azul)', color: '#DBEAFE', borderColor: '#3B82F6' }, // Blue-100
  { id: 'pronoun', name: 'Pronombre (Amarillo fuerte)', color: '#FEF08A', borderColor: '#EAB308' }, // Yellow-200
  { id: 'social', name: 'Social/Persona (Rosa/Morado)', color: '#FCE7F3', borderColor: '#EC4899' }, // Pink-100
  { id: 'miscellaneous', name: 'Misceláneo (Gris/Blanco)', color: '#F3F4F6', borderColor: '#9CA3AF' }, // Gray-100
];

export interface PictogramItem {
  id: string;
  imageUrl?: string; // Data URL or Object URL
  label: string;
  categoryId: string; // Fitzerald standard
  customColor?: string; // Custom overwrite background color
}

export interface GridSettings {
  columns: number;
  rows: number;
  gap: number;
  borderColor: string;
  borderWidth: number;
  borderRadius: number;
  textColor: string;
  fontSize: number;
  textPosition: TextPosition;
  textCase: TextCase;
  textBold: boolean;
  showGridLines: boolean;
  fitMode: 'contain' | 'cover';
  layoutMode: 'grid' | 'dimensions';
  picWidth: number;
  picHeight: number;
  paperSize: PaperSize;
  paperWidth: number;
  paperHeight: number;
  marginTop: number;
  marginBottom: number;
  marginLeft: number;
  marginRight: number;
}

export interface SheetPage {
  id: string;
  name: string;
  pictograms: Record<number, PictogramItem>; // Key is index in grid (0 to rows*cols - 1)
}
