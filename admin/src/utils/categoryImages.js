// Default photo shown for a product when it has no imageUrl of its own.
// Falls back further to the category emoji (see categoryIcons.js) when empty.
//
// To activate: paste a hosted photo URL for each category below — your own
// product shots, stock photos you have rights to, or AI-generated images
// (ask to generate them via Higgsfield once credits are available).
export const DEFAULT_CATEGORY_IMAGES = {
  Sparklers: '',
  'Flower Pots': '',
  Rockets: '',
  'Ground Chakkars': '',
  'Gift Boxes': '',
  Novelties: '',
  Other: '',
};

export function getCategoryImage(categoryName) {
  return DEFAULT_CATEGORY_IMAGES[categoryName] || '';
}
