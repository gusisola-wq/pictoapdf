import { describe, it, expect } from 'vitest';
import { FITZGERALD_CATEGORIES } from '../types';

describe('FITZGERALD_CATEGORIES', () => {
  it('should have 7 categories', () => {
    expect(FITZGERALD_CATEGORIES).toHaveLength(7);
  });

  it('should include all required categories', () => {
    const ids = FITZGERALD_CATEGORIES.map((c) => c.id);
    expect(ids).toContain('none');
    expect(ids).toContain('noun');
    expect(ids).toContain('verb');
    expect(ids).toContain('adjective');
    expect(ids).toContain('pronoun');
    expect(ids).toContain('social');
    expect(ids).toContain('miscellaneous');
  });

  it('every category should have color and borderColor', () => {
    for (const cat of FITZGERALD_CATEGORIES) {
      expect(cat.color).toBeTruthy();
      expect(cat.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(cat.borderColor).toBeTruthy();
      expect(cat.borderColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });
});
