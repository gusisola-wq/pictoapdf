export type TextPosition = 'top' | 'bottom' | 'none';
export type TextCase = 'uppercase' | 'lowercase' | 'normal';
export type PaperSize = 'A4' | 'A5' | 'A6' | 'custom';
export type Orientation = 'portrait' | 'landscape';

export interface FitzgeraldCategory {
  id: string;
  name: string;
  color: string;
  borderColor: string;
}

export const FITZGERALD_CATEGORIES: FitzgeraldCategory[] = [
  { id: 'none', name: 'Sin categoría (Blanco)', color: '#FFFFFF', borderColor: '#D1D5DB' },
  { id: 'noun', name: 'Sustantivo (Naranja/Amarillo)', color: '#FEF3C7', borderColor: '#F59E0B' },
  { id: 'verb', name: 'Verbo (Verde)', color: '#DCFCE7', borderColor: '#10B981' },
  { id: 'adjective', name: 'Adjetivo (Azul)', color: '#DBEAFE', borderColor: '#3B82F6' },
  { id: 'pronoun', name: 'Pronombre (Amarillo fuerte)', color: '#FEF08A', borderColor: '#EAB308' },
  { id: 'social', name: 'Social/Persona (Rosa/Morado)', color: '#FCE7F3', borderColor: '#EC4899' },
  { id: 'miscellaneous', name: 'Misceláneo (Gris/Blanco)', color: '#F3F4F6', borderColor: '#9CA3AF' },
];

export interface PictogramItem {
  id: string;
  imageUrl?: string;
  label: string;
  categoryId: string;
  customColor?: string;
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
  orientation: Orientation;
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
  pictograms: Record<number, PictogramItem>;
}

export interface User {
  id: string;
  name: string;
  avatar: string;
  createdAt: number;
}

export interface SavedGridState {
  settings: GridSettings;
  pages: SheetPage[];
  activePageIndex: number;
}
