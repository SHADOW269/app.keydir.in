export interface CompareProduct {
  slug: string;
  name: string;
  image: string | null;
  price: number | null;
  category: string;
}

type Listener = () => void;

const KEY = 'keydir_compare';
const MAX = 4;

let category: string | null = null;
let products: CompareProduct[] = [];
const listeners = new Set<Listener>();

function notify() {
  for (const fn of listeners) fn();
}

function persist() {
  try { localStorage.setItem(KEY, JSON.stringify({ category, products })); } catch {}
}

export function getCompareCategory(): string | null { return category; }
export function getCompareProducts(): CompareProduct[] { return [...products]; }
export function getCompareCount(): number { return products.length; }

export function isProductInCompare(slug: string): boolean {
  return products.some((p) => p.slug === slug);
}

export function canAddToCompare(productCategory: string): { ok: boolean; reason?: string } {
  if (products.length >= MAX) return { ok: false, reason: `Maximum of ${MAX} products.` };
  if (category && category !== productCategory) {
    return { ok: false, reason: `Clear the compare list first. Currently comparing ${category}.` };
  }
  return { ok: true };
}

export function addCompareProduct(product: CompareProduct): { ok: boolean; reason?: string } {
  const check = canAddToCompare(product.category);
  if (!check.ok) return check;
  if (products.some((p) => p.slug === product.slug)) return { ok: false, reason: 'Already in compare list.' };
  category = product.category;
  products = [...products, product];
  persist();
  notify();
  return { ok: true };
}

export function removeCompareProduct(slug: string) {
  products = products.filter((p) => p.slug !== slug);
  if (products.length === 0) category = null;
  persist();
  notify();
}

export function clearCompare() {
  category = null;
  products = [];
  persist();
  notify();
}

export function onCompareChange(fn: Listener): () => void {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}

export function loadCompareFromStorage(): { category: string | null; products: CompareProduct[] } {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.category && Array.isArray(parsed.products)) {
        category = parsed.category;
        products = parsed.products;
        return { category, products: [...products] };
      }
    }
  } catch {}
  return { category: null, products: [] };
}

export function syncCompareFromUrl(cat: string, slugs: string[]) {
  category = cat || null;
  products = slugs.map((s) => ({ slug: s, name: '', image: null, price: null, category: cat }));
  persist();
  notify();
}

export function clearCompareOnUnmount() {
  category = null;
  products = [];
  persist();
  notify();
}
