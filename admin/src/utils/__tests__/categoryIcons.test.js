import { describe, it, expect } from 'vitest';
import { getCategoryIcon, FALLBACK_CATEGORY_ICONS } from '../categoryIcons';

describe('getCategoryIcon', () => {
  it('returns the custom icon from a matching category', () => {
    const categories = [{ name: 'Sparklers', icon: '🎆' }];
    expect(getCategoryIcon('Sparklers', categories)).toBe('🎆');
  });

  it('falls back to the default emoji when the category has no custom icon', () => {
    const categories = [{ name: 'Sparklers' }];
    expect(getCategoryIcon('Sparklers', categories)).toBe(FALLBACK_CATEGORY_ICONS.Sparklers);
  });

  it('falls back to the default emoji when the category is not found', () => {
    expect(getCategoryIcon('Rockets', [])).toBe(FALLBACK_CATEGORY_ICONS.Rockets);
  });

  it('falls back to the generic box emoji for an unknown category name', () => {
    expect(getCategoryIcon('Mystery Item', [])).toBe('📦');
  });

  it('defaults the categories argument to an empty list', () => {
    expect(getCategoryIcon('Novelties')).toBe(FALLBACK_CATEGORY_ICONS.Novelties);
  });
});
