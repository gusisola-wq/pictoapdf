import { describe, it, expect, vi, beforeEach } from 'vitest';

// jsPDF mock
vi.mock('jspdf', () => {
  const mockDoc = {
    addPage: vi.fn(),
    setDrawColor: vi.fn(),
    setLineWidth: vi.fn(),
    line: vi.fn(),
    setFillColor: vi.fn(),
    roundedRect: vi.fn(),
    rect: vi.fn(),
    setFont: vi.fn(),
    setFontSize: vi.fn(),
    setTextColor: vi.fn(),
    getTextWidth: vi.fn().mockReturnValue(10),
    splitTextToSize: vi.fn().mockReturnValue(['mock text']),
    text: vi.fn(),
    addImage: vi.fn(),
    output: vi.fn().mockReturnValue(new Blob()),
    internal: {
      pageSize: { width: 210, height: 297 },
    },
  };
  return { jsPDF: vi.fn(() => mockDoc) };
});

describe('hexToRgb', () => {
  it('should parse full hex', async () => {
    const { hexToRgb: fn } = await import('../utils/pdfGenerator');
    expect(fn('#FF0000')).toEqual([255, 0, 0]);
    expect(fn('#00FF00')).toEqual([0, 255, 0]);
    expect(fn('#0000FF')).toEqual([0, 0, 255]);
  });

  it('should parse shorthand hex', async () => {
    const { hexToRgb: fn } = await import('../utils/pdfGenerator');
    expect(fn('#F00')).toEqual([255, 0, 0]);
    expect(fn('#0F0')).toEqual([0, 255, 0]);
    expect(fn('#00F')).toEqual([0, 0, 255]);
  });

  it('should handle invalid hex gracefully', async () => {
    const { hexToRgb: fn } = await import('../utils/pdfGenerator');
    const [r, g, b] = fn('#XYZ');
    expect(r).toBe(0);
    expect(g).toBe(0);
    expect(b).toBe(0);
  });
});

describe('detectImageFormat', () => {
  it('should detect PNG from data URL', async () => {
    const { detectImageFormat: fn } = await import('../utils/pdfGenerator');
    expect(fn('data:image/png;base64,...')).toBe('PNG');
  });

  it('should detect JPEG from data URL', async () => {
    const { detectImageFormat: fn } = await import('../utils/pdfGenerator');
    expect(fn('data:image/jpeg;base64,...')).toBe('JPEG');
  });

  it('should detect WEBP from data URL', async () => {
    const { detectImageFormat: fn } = await import('../utils/pdfGenerator');
    expect(fn('data:image/webp;base64,...')).toBe('WEBP');
  });

  it('should detect PNG from extension', async () => {
    const { detectImageFormat: fn } = await import('../utils/pdfGenerator');
    expect(fn('https://example.com/image.png')).toBe('PNG');
    expect(fn('/path/image.svg')).toBe('PNG');
    expect(fn('/path/image.gif')).toBe('PNG');
  });

  it('should default to JPEG for unknown formats', async () => {
    const { detectImageFormat: fn } = await import('../utils/pdfGenerator');
    expect(fn('https://example.com/image.bmp')).toBe('JPEG');
    expect(fn('https://example.com/image')).toBe('JPEG');
  });
});
