export interface CategoryConfig {
  slug: string;
  label: string;
  singular: string;
  icon: string;
}

export const PRODUCT_CATEGORIES: CategoryConfig[] = [
  { slug: 'keyboards', label: 'Keyboards', singular: 'Keyboard', icon: '⌨' },
  { slug: 'switches', label: 'Switches', singular: 'Switch', icon: '🔘' },
  { slug: 'keycaps', label: 'Keycaps', singular: 'Keycap', icon: '🎨' },
  { slug: 'mouse', label: 'Mouse', singular: 'Mouse', icon: '🖱' },
];

export function getCategoryBySlug(slug: string): CategoryConfig | undefined {
  return PRODUCT_CATEGORIES.find((c) => c.slug === slug);
}
