import { describe, it, expect } from 'vitest';
import { PAPER_SIZES, PX_TO_MM, PT_TO_MM, getPaperDimensions, getPrintArea } from '../utils/constants';
import { GridSettings } from '../types';

const BASE_SETTINGS: GridSettings = {
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

describe('PAPER_SIZES', () => {
  it('should have correct A4 dimensions', () => {
    expect(PAPER_SIZES.A4.width).toBe(210);
    expect(PAPER_SIZES.A4.height).toBe(297);
  });

  it('should have correct A5 dimensions', () => {
    expect(PAPER_SIZES.A5.width).toBe(148);
    expect(PAPER_SIZES.A5.height).toBe(210);
  });

  it('should have correct A6 dimensions', () => {
    expect(PAPER_SIZES.A6.width).toBe(105);
    expect(PAPER_SIZES.A6.height).toBe(148);
  });
});

describe('conversion constants', () => {
  it('PX_TO_MM should be positive', () => {
    expect(PX_TO_MM).toBeGreaterThan(0);
  });

  it('PT_TO_MM should be positive', () => {
    expect(PT_TO_MM).toBeGreaterThan(0);
  });
});

describe('getPaperDimensions', () => {
  it('should return A4 for A4 paper size', () => {
    const dims = getPaperDimensions(BASE_SETTINGS);
    expect(dims.width).toBe(210);
    expect(dims.height).toBe(297);
  });

  it('should return A5 for A5 paper size', () => {
    const dims = getPaperDimensions({ ...BASE_SETTINGS, paperSize: 'A5' });
    expect(dims.width).toBe(148);
    expect(dims.height).toBe(210);
  });

  it('should return A6 for A6 paper size', () => {
    const dims = getPaperDimensions({ ...BASE_SETTINGS, paperSize: 'A6' });
    expect(dims.width).toBe(105);
    expect(dims.height).toBe(148);
  });

  it('should return custom dimensions for custom paper size', () => {
    const dims = getPaperDimensions({
      ...BASE_SETTINGS,
      paperSize: 'custom',
      paperWidth: 300,
      paperHeight: 400,
    });
    expect(dims.width).toBe(300);
    expect(dims.height).toBe(400);
  });

  it('should swap dimensions for landscape A4', () => {
    const dims = getPaperDimensions({ ...BASE_SETTINGS, orientation: 'landscape' });
    expect(dims.width).toBe(297);
    expect(dims.height).toBe(210);
  });

  it('should swap dimensions for landscape A5', () => {
    const dims = getPaperDimensions({ ...BASE_SETTINGS, paperSize: 'A5', orientation: 'landscape' });
    expect(dims.width).toBe(210);
    expect(dims.height).toBe(148);
  });

  it('should NOT swap dimensions for custom paper in landscape', () => {
    const dims = getPaperDimensions({
      ...BASE_SETTINGS,
      paperSize: 'custom',
      orientation: 'landscape',
      paperWidth: 300,
      paperHeight: 400,
    });
    expect(dims.width).toBe(300);
    expect(dims.height).toBe(400);
  });
});

describe('getPrintArea', () => {
  it('should compute printable area for A4 with default margins', () => {
    const area = getPrintArea(BASE_SETTINGS);
    expect(area.width).toBe(200);
    expect(area.height).toBe(277);
  });

  it('should respect custom margins', () => {
    const area = getPrintArea({
      ...BASE_SETTINGS,
      marginLeft: 10,
      marginRight: 10,
      marginTop: 10,
      marginBottom: 20,
    });
    expect(area.width).toBe(190);
    expect(area.height).toBe(267);
  });
});
