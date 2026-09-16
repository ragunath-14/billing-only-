// Default emoji per category, used whenever a product has no imageUrl.
export const FALLBACK_CATEGORY_ICONS = {
  Sparklers: '✨', 'Flower Pots': '🌸', Rockets: '🚀',
  'Ground Chakkars': '🎡', 'Gift Boxes': '🎁', Novelties: '🎭', Other: '📦'
};

export function getCategoryIcon(categoryName, categories = []) {
  const cat = categories.find(c => c.name === categoryName);
  if (cat?.icon) return cat.icon;
  return FALLBACK_CATEGORY_ICONS[categoryName] || '📦';
}
