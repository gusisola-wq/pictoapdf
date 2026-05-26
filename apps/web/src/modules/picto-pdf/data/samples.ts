import { PictogramItem } from '../types';

// Simple high-contrast SVG drawings for everyday activities
const createSvgDataUrl = (path: string, viewBox = "0 0 24 24") => {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="24" height="24" fill="none" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${path}</svg>`
  )}`;
};

export const SAMPLE_IMAGES = {
  desayuno: createSvgDataUrl(
    `<path d="M17 8h1a4 4 0 1 1 0 8h-1" /><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8z" /><line x1="6" y1="2" x2="6" y2="4" /><line x1="10" y1="2" x2="10" y2="4" /><line x1="14" y1="2" x2="14" y2="4" />`
  ),
  dientes: createSvgDataUrl(
    `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="M8 10.5c1.5 1.5 3.5 1.5 5 0" /><path d="M9 13.5c1 1.5 2.5 1.5 3.5 0" stroke-width="1.5" /><path d="M8 8V7a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v1" /><path d="M13 8V7a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v1" />`
  ),
  colegio: createSvgDataUrl(
    `<path d="m12 3-10 9h3v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8h3L12 3z" /><path d="M9 21V12h6v9" />`
  ),
  almuerzo: createSvgDataUrl(
    `<path d="M12 2v20" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /><circle cx="12" cy="12" r="10" stroke-dasharray="4 4" />`
  ),
  jugar: createSvgDataUrl(
    `<circle cx="12" cy="12" r="10" /><path d="M6 12c0-3.3 2.7-6 6-6" /><path d="M18 12c0 3.3-2.7 6-6 6" /><line x1="12" y1="2" x2="12" y2="22" />`
  ),
  baño: createSvgDataUrl(
    `<path d="M22 17H2a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3z" /><path d="M7 14c0-3 3-5 5-5s5 2 5 5" /><path d="M12 9V3a1 1 0 0 1 1-1h3" /><path d="M14 6h.01" />`
  ),
  dormir: createSvgDataUrl(
    `<path d="M2 4v16" /><path d="M2 13h18a2 2 0 0 0 2-2V4" /><path d="M2 8h16a2 2 0 0 0 2-2V4" /><path d="M10 17h10" /><path d="M12 5v4" />`
  ),
  tele: createSvgDataUrl(
    `<rect x="2" y="3" width="20" height="13" rx="2" /><path d="m12 16 3 5" /><path d="M12 16l-3 5" /><path d="M8 21h8" /><path d="M6 8h12v4H6z" />`
  )
};

export const INITIAL_SAMPLE_PICTOGRAMS: Record<number, PictogramItem> = {
  0: {
    id: 'sample-1',
    imageUrl: SAMPLE_IMAGES.desayuno,
    label: 'Desayuno',
    categoryId: 'noun',
  },
  1: {
    id: 'sample-2',
    imageUrl: SAMPLE_IMAGES.dientes,
    label: 'Lavarse los dientes',
    categoryId: 'verb',
  },
  2: {
    id: 'sample-3',
    imageUrl: SAMPLE_IMAGES.colegio,
    label: 'Ir al colegio',
    categoryId: 'verb',
  },
  3: {
    id: 'sample-4',
    imageUrl: SAMPLE_IMAGES.almuerzo,
    label: 'Almorzar',
    categoryId: 'verb',
  },
  4: {
    id: 'sample-5',
    imageUrl: SAMPLE_IMAGES.jugar,
    label: 'Jugar',
    categoryId: 'verb',
  },
  5: {
    id: 'sample-6',
    imageUrl: SAMPLE_IMAGES.baño,
    label: 'Bañarse',
    categoryId: 'verb',
  },
  6: {
    id: 'sample-7',
    imageUrl: SAMPLE_IMAGES.dormir,
    label: 'Dormir',
    categoryId: 'verb',
  },
  7: {
    id: 'sample-8',
    imageUrl: SAMPLE_IMAGES.tele,
    label: 'Ver televisión',
    categoryId: 'miscellaneous',
  },
};
