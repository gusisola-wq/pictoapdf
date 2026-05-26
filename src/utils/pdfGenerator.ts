import { jsPDF } from 'jspdf';
import { SheetPage, GridSettings, PictogramItem, FITZGERALD_CATEGORIES } from '../types';
import { PX_TO_MM, PT_TO_MM, getPaperDimensions, getPrintArea } from './constants';

interface LoadedImage {
  element: HTMLImageElement;
  width: number;
  height: number;
}

export function hexToRgb(hex: string): [number, number, number] {
  const cleanHex = hex.replace('#', '');
  if (cleanHex.length === 3) {
    const r = parseInt(cleanHex[0] + cleanHex[0], 16) || 0;
    const g = parseInt(cleanHex[1] + cleanHex[1], 16) || 0;
    const b = parseInt(cleanHex[2] + cleanHex[2], 16) || 0;
    return [r, g, b];
  }
  const r = parseInt(cleanHex.substring(0, 2), 16) || 0;
  const g = parseInt(cleanHex.substring(2, 4), 16) || 0;
  const b = parseInt(cleanHex.substring(4, 6), 16) || 0;
  return [r, g, b];
}

function isSvgUrl(url: string): boolean {
  return url.startsWith('data:image/svg') || url.toLowerCase().endsWith('.svg');
}

function renderSvgToCanvas(img: HTMLImageElement, size: number): Promise<string> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(img, 0, 0, size, size);
    }
    resolve(canvas.toDataURL('image/png'));
  });
}

function loadImageAsync(url: string): Promise<LoadedImage> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = async () => {
      let w = img.naturalWidth || 100;
      let h = img.naturalHeight || 100;
      if (isSvgUrl(url) || w === 0 || h === 0) {
        const renderSize = 200;
        const pngDataUrl = await renderSvgToCanvas(img, renderSize);
        const pngImg = new Image();
        pngImg.onload = () => {
          resolve({
            element: pngImg,
            width: pngImg.naturalWidth || renderSize,
            height: pngImg.naturalHeight || renderSize,
          });
        };
        pngImg.onerror = () => resolve({ element: pngImg, width: renderSize, height: renderSize });
        pngImg.src = pngDataUrl;
      } else {
        resolve({ element: img, width: w, height: h });
      }
    };
    img.onerror = () => {
      const fallback = new Image();
      fallback.onload = () => {
        resolve({
          element: fallback,
          width: 100,
          height: 100,
        });
      };
      fallback.onerror = () => {
        const dummyImg = new Image();
        dummyImg.width = 100;
        dummyImg.height = 100;
        resolve({ element: dummyImg, width: 100, height: 100 });
      };
      fallback.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    };
    img.src = url;
  });
}

function wrapText(doc: jsPDF, text: string, maxWidth: number): string[] {
  return doc.splitTextToSize(text, maxWidth);
}

export function detectImageFormat(url: string): string {
  if (url.startsWith('data:image/png') || url.startsWith('data:image/svg')) {
    return 'PNG';
  }
  if (url.startsWith('data:image/jpeg') || url.startsWith('data:image/jpg')) {
    return 'JPEG';
  }
  if (url.startsWith('data:image/webp')) {
    return 'WEBP';
  }
  const ext = url.split('.').pop()?.toLowerCase() ?? '';
  if (['png', 'svg', 'gif', 'webp'].includes(ext)) {
    return 'PNG';
  }
  return 'JPEG';
}

export async function generatePDF(
  pages: SheetPage[],
  settings: GridSettings,
): Promise<Blob> {
  const paper = getPaperDimensions(settings);
  const printArea = getPrintArea(settings);

  const PAGE_WIDTH = paper.width;
  const PAGE_HEIGHT = paper.height;
  const MARGIN_LEFT = settings.marginLeft;
  const MARGIN_RIGHT = settings.marginRight;
  const MARGIN_TOP = settings.marginTop;
  const MARGIN_BOTTOM = settings.marginBottom;

  const doc = new jsPDF({
    orientation: settings.orientation === 'landscape' ? 'landscape' : 'portrait',
    unit: 'mm',
    format: [PAGE_WIDTH, PAGE_HEIGHT],
  });

  let cols = settings.columns;
  let rows = settings.rows;
  const gap = settings.gap;

  if (settings.layoutMode === 'dimensions') {
    cols = Math.max(1, Math.floor((printArea.width + gap) / (settings.picWidth + gap)));
    rows = Math.max(1, Math.floor((printArea.height + gap) / (settings.picHeight + gap)));
  }

  let cellWidth = (printArea.width - (cols - 1) * gap) / cols;
  let cellHeight = (printArea.height - (rows - 1) * gap) / rows;
  let startX = MARGIN_LEFT;
  let startY = MARGIN_TOP;

  if (settings.layoutMode === 'dimensions') {
    cellWidth = settings.picWidth;
    cellHeight = settings.picHeight;
    const totalGridWidth = cols * cellWidth + (cols - 1) * gap;
    const totalGridHeight = rows * cellHeight + (rows - 1) * gap;
    startX = MARGIN_LEFT + Math.max(0, (printArea.width - totalGridWidth) / 2);
    startY = MARGIN_TOP + Math.max(0, (printArea.height - totalGridHeight) / 2);
  }

  const imageCache: Record<string, LoadedImage> = {};
  const urlsToLoad = new Set<string>();

  pages.forEach((page) => {
    Object.values(page.pictograms).forEach((pic) => {
      if (pic.imageUrl) {
        urlsToLoad.add(pic.imageUrl);
      }
    });
  });

  const loadPromises = Array.from(urlsToLoad).map(async (url) => {
    const loaded = await loadImageAsync(url);
    imageCache[url] = loaded;
  });

  await Promise.all(loadPromises);

  pages.forEach((page, pageIdx) => {
    if (pageIdx > 0) {
      doc.addPage();
    }

    if (settings.showGridLines) {
      doc.setDrawColor(230, 230, 230);
      doc.setLineWidth(0.2);
      doc.line(MARGIN_LEFT, MARGIN_TOP, PAGE_WIDTH - MARGIN_RIGHT, MARGIN_TOP);
      doc.line(MARGIN_LEFT, PAGE_HEIGHT - MARGIN_BOTTOM, PAGE_WIDTH - MARGIN_RIGHT, PAGE_HEIGHT - MARGIN_BOTTOM);
      doc.line(MARGIN_LEFT, MARGIN_TOP, MARGIN_LEFT, PAGE_HEIGHT - MARGIN_BOTTOM);
      doc.line(PAGE_WIDTH - MARGIN_RIGHT, MARGIN_TOP, PAGE_WIDTH - MARGIN_RIGHT, PAGE_HEIGHT - MARGIN_BOTTOM);
    }

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const slotIdx = r * cols + c;
        const pic = page.pictograms[slotIdx];

        const cellX = startX + c * (cellWidth + gap);
        const cellY = startY + r * (cellHeight + gap);

        let bgColor = '#FFFFFF';
        let drawColor = settings.borderColor || '#000000';

        if (pic) {
          const category = FITZGERALD_CATEGORIES.find((cat) => cat.id === pic.categoryId);
          if (category && category.id !== 'none') {
            bgColor = category.color;
            drawColor = category.borderColor;
          }
          if (pic.customColor) {
            bgColor = pic.customColor;
          }
        }

        const [bgR, bgG, bgB] = hexToRgb(bgColor);
        doc.setFillColor(bgR, bgG, bgB);

        const [borderR, borderG, borderB] = hexToRgb(drawColor);
        doc.setDrawColor(borderR, borderG, borderB);

        const actualBorderWidth = settings.borderWidth * PX_TO_MM;
        doc.setLineWidth(actualBorderWidth);

        const radius = settings.borderRadius * PX_TO_MM;

        if (radius > 0) {
          doc.roundedRect(cellX, cellY, cellWidth, cellHeight, radius, radius, 'FD');
        } else {
          doc.rect(cellX, cellY, cellWidth, cellHeight, 'FD');
        }

        const padding = 2;
        const innerX = cellX + padding;
        const innerY = cellY + padding;
        const innerWidth = cellWidth - padding * 2;
        const innerHeight = cellHeight - padding * 2;

        if (innerWidth <= 0 || innerHeight <= 0) continue;

        let labelText = pic ? pic.label : '';
        if (settings.textCase === 'uppercase') {
          labelText = labelText.toUpperCase();
        } else if (settings.textCase === 'lowercase') {
          labelText = labelText.toLowerCase();
        }

        let textHeightSpace = 0;
        let finalFontSize = settings.fontSize;

        if (labelText && settings.textPosition !== 'none') {
          textHeightSpace = finalFontSize * PT_TO_MM + 3;
          if (textHeightSpace > innerHeight * 0.4) {
            textHeightSpace = innerHeight * 0.4;
            finalFontSize = Math.floor((innerHeight * 0.4) / PT_TO_MM) - 2;
          }
        }

        const imageAreaHeight = innerHeight - textHeightSpace;
        let imageY = innerY;
        let textY = innerY + imageAreaHeight + 2;

        if (settings.textPosition === 'top') {
          imageY = innerY + textHeightSpace;
          textY = innerY + finalFontSize * PT_TO_MM;
        }

        if (pic && pic.imageUrl && imageCache[pic.imageUrl]) {
          const loadedImg = imageCache[pic.imageUrl];
          const imgAspect = loadedImg.width / loadedImg.height;
          const boxAspect = innerWidth / imageAreaHeight;

          let renderWidth = innerWidth;
          let renderHeight = imageAreaHeight;
          let renderX = innerX;
          let renderY = imageY;

          if (settings.fitMode === 'contain') {
            if (imgAspect > boxAspect) {
              renderWidth = innerWidth;
              renderHeight = innerWidth / imgAspect;
              renderY = imageY + (imageAreaHeight - renderHeight) / 2;
            } else {
              renderHeight = imageAreaHeight;
              renderWidth = imageAreaHeight * imgAspect;
              renderX = innerX + (innerWidth - renderWidth) / 2;
            }
          } else {
            if (imgAspect > boxAspect) {
              renderHeight = imageAreaHeight;
              renderWidth = imageAreaHeight * imgAspect;
              renderX = innerX - (renderWidth - innerWidth) / 2;
            } else {
              renderWidth = innerWidth;
              renderHeight = innerWidth / imgAspect;
              renderY = imageY - (renderHeight - imageAreaHeight) / 2;
            }
          }

          if (renderX < cellX) {
            renderX = cellX;
            renderWidth = cellWidth;
          }
          if (renderY < cellY) {
            renderY = cellY;
            renderHeight = cellHeight;
          }
          if (renderWidth > cellWidth) renderWidth = cellWidth;
          if (renderHeight > cellHeight) renderHeight = cellHeight;

          try {
            const format = detectImageFormat(pic.imageUrl);
            doc.addImage(loadedImg.element, format, renderX, renderY, renderWidth, renderHeight);
          } catch (e) {
            console.error('Error drawing image in PDF:', e);
          }
        }

        if (labelText && settings.textPosition !== 'none') {
          doc.setFont('Helvetica', settings.textBold ? 'bold' : 'normal');
          doc.setFontSize(finalFontSize);
          const [txR, txG, txB] = hexToRgb(settings.textColor);
          doc.setTextColor(txR, txG, txB);
          const wrapped = wrapText(doc, labelText, innerWidth);
          let currentTextY = textY;
          wrapped.forEach((line) => {
            const stringWidth = doc.getTextWidth(line);
            const textX = innerX + (innerWidth - stringWidth) / 2;
            if (currentTextY >= cellY && currentTextY <= cellY + cellHeight - 1) {
              doc.text(line, textX, currentTextY);
            }
            currentTextY += finalFontSize * PT_TO_MM + 0.5;
          });
        }
      }
    }
  });

  return doc.output('blob');
}
