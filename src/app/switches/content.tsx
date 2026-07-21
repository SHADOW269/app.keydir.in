'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { SubmitProductCTA } from '@/components/layout/submit-product-cta';
import { Footer } from '@/components/layout/footer';
import { ProductCard } from '@/components/product/product-card';
import { EmptyCategory } from '@/components/product/empty-category';
import { HeroBanner } from '@/components/banner/hero-banner';
import FilterPanel from '@/components/product/filter-panel';
import type { ProductCard as ProductCardType, SortOption } from '@/types';

interface Banner {
  id: string;
  title: string;
  desktopImage: string | null;
  mobileImage: string | null;
  linkUrl: string | null;
  linkType: string;
  openNewTab: boolean;
}

interface FilterOptions {
  specs: Record<string, string[] | boolean[]>;
  brands: string[];
  vendors: string[];
  priceMin: number;
  priceMax: number;
}

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'lowest', label: 'Lowest Price' },
  { value: 'highest', label: 'Highest Price' },
  { value: 'newest', label: 'Newest' },
  { value: 'popular', label: 'Most Upvoted' },
  { value: 'vendors', label: 'Most Vendors' },
];

function clamp(v: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, v)); }

export default function SwitchesContent({ banners = [], totalCount = 0 }: { banners?: Banner[]; totalCount?: number }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [products, setProducts] = useState<ProductCardType[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<SortOption>(() => (searchParams.get('sort') as SortOption) || 'popular');
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const q = searchParams.get('q') || '';

  const [priceMin, setPriceMin] = useState(() => {
    const v = searchParams.get('priceMin');
    return v ? parseInt(v, 10) : null;
  });
  const [priceMax, setPriceMax] = useState(() => {
    const v = searchParams.get('priceMax');
    return v ? parseInt(v, 10) : null;
  });
  const [PRICE_MIN, setPRICE_MIN] = useState(0);
  const [PRICE_MAX, setPRICE_MAX] = useState(Infinity);

  const [pending, setPending] = useState<Record<string, string[]>>(() => {
    const init: Record<string, string[]> = {};
    for (const key of searchParams.keys()) {
      if (key === 'q' || key === 'sort') continue;
      init[key] = searchParams.getAll(key);
    }
    return init;
  });
  const [applied, setApplied] = useState<Record<string, string[]>>(pending);

  const activeCount = Object.values(applied).reduce((n, a) => n + a.length, 0);

  useEffect(() => {
    fetch('/api/switches/filters')
      .then((r) => r.json())
      .then((d: FilterOptions) => {
        setFilterOptions(d);
        setPRICE_MIN(d.priceMin);
        setPRICE_MAX(d.priceMax);
        setPriceMin((prev) => prev ?? d.priceMin);
        setPriceMax((prev) => prev ?? d.priceMax);
      })
      .catch(() => {});
  }, []);

  const buildUrl = useCallback((s: SortOption, f: Record<string, string[]>, pMin: number, pMax: number) => {
    const p = new URLSearchParams();
    if (q) p.set('q', q);
    if (s !== 'popular') p.set('sort', s);
    for (const [k, v] of Object.entries(f)) for (const val of v) p.append(k, val);
    if (pMin > PRICE_MIN) p.set('priceMin', String(pMin));
    if (pMax < PRICE_MAX) p.set('priceMax', String(pMax));
    const qs = p.toString();
    return `${pathname}${qs ? `?${qs}` : ''}`;
  }, [pathname, q, PRICE_MIN, PRICE_MAX]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams();
      if (q) p.set('q', q);
      p.set('sort', sort);
      for (const [k, v] of Object.entries(applied)) for (const val of v) p.append(k, val);
      if (applied.priceMin) p.set('priceMin', applied.priceMin[0]);
      if (applied.priceMax) p.set('priceMax', applied.priceMax[0]);
      const res = await fetch(`/api/switches?${p.toString()}`);
      if (res.ok) { const d = await res.json(); setProducts(d.products ?? []); setTotal(d.total ?? 0); }
    } catch {} finally { setLoading(false); }
  }, [q, sort, applied]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  function handleSortChange(s: SortOption) {
    setSort(s);
    router.push(buildUrl(s, applied, priceMin ?? PRICE_MIN, priceMax ?? PRICE_MAX), { scroll: false });
  }

  function toggleOption(key: string, val: string) {
    setPending((prev) => {
      const cur = prev[key] || [];
      return { ...prev, [key]: cur.includes(val) ? cur.filter((v) => v !== val) : [...cur, val] };
    });
  }

  function applyAndClose() {
    const next = { ...pending };
    const pMin = priceMin ?? PRICE_MIN;
    const pMax = priceMax ?? PRICE_MAX;
    if (pMin > PRICE_MIN) next.priceMin = [String(pMin)];
    else delete next.priceMin;
    if (pMax < PRICE_MAX) next.priceMax = [String(pMax)];
    else delete next.priceMax;
    setApplied(next);
    router.push(buildUrl(sort, next, pMin, pMax), { scroll: false });
    setFiltersOpen(false);
  }

  function resetAndClose() {
    setPending({}); setApplied({});
    setPriceMin(PRICE_MIN); setPriceMax(PRICE_MAX);
    router.push(buildUrl(sort, {}, PRICE_MIN, PRICE_MAX), { scroll: false });
    setFiltersOpen(false);
  }

  function removeFilter(key: string, val: string) {
    if (key === 'priceMin') setPriceMin(PRICE_MIN);
    if (key === 'priceMax') setPriceMax(PRICE_MAX);
    setApplied((prev) => {
      const u = { ...prev, [key]: (prev[key] || []).filter((v) => v !== val) };
      if (!u[key]?.length) delete u[key];
      setPending(u);
      const pMin = key === 'priceMin' ? PRICE_MIN : (priceMin ?? PRICE_MIN);
      const pMax = key === 'priceMax' ? PRICE_MAX : (priceMax ?? PRICE_MAX);
      router.push(buildUrl(sort, u, pMin, pMax), { scroll: false });
      return u;
    });
  }

  function handlePriceMinChange(v: number) { setPriceMin(v); }
  function handlePriceMaxChange(v: number) { setPriceMax(v); }
  function handlePriceMinInput(v: string) {
    const n = parseInt(v.replace(/\D/g, ''), 10);
    if (!isNaN(n)) setPriceMin(clamp(n, PRICE_MIN, (priceMax ?? PRICE_MAX) - 100));
  }
  function handlePriceMaxInput(v: string) {
    const n = parseInt(v.replace(/\D/g, ''), 10);
    if (!isNaN(n)) setPriceMax(clamp(n, (priceMin ?? PRICE_MIN) + 100, PRICE_MAX));
  }

  const sortLabel = SORT_OPTIONS.find((o) => o.value === sort)?.label || 'Lowest Price';

  return (
    <div className="catalog-layout">
      <Navbar />
      {banners.length > 0 && <HeroBanner banners={banners} />}
      <div className="catalog-page">
        {totalCount === 0 ? (
          <EmptyCategory category="Switches" />
        ) : (
          <>
            <div className="catalog-toolbar">
              <div className="catalog-stats">
                <span>{total} Switches</span>
                <span className="catalog-stats-sep">·</span>
                <span>Sorted by {sortLabel}</span>
              </div>
              <div className="catalog-controls">
                <button type="button" className={`catalog-filter-btn${filtersOpen ? ' active' : ''}`} onClick={() => setFiltersOpen(!filtersOpen)}>
                  <span className="catalog-filter-icon">⚙</span>
                  <span>Filters</span>
                  {activeCount > 0 && <span className="catalog-filter-count">{activeCount}</span>}
                </button>
                {filtersOpen && filterOptions && (
                  <FilterPanel
                    filterOptions={filterOptions}
                    pending={pending}
                    applied={applied}
                    priceMin={priceMin ?? PRICE_MIN}
                    priceMax={priceMax ?? PRICE_MAX}
                    PRICE_MIN={PRICE_MIN}
                    PRICE_MAX={PRICE_MAX}
                    onToggle={toggleOption}
                    onRemove={removeFilter}
                    onApply={applyAndClose}
                    onReset={resetAndClose}
                    onPriceMinChange={handlePriceMinChange}
                    onPriceMaxChange={handlePriceMaxChange}
                    onPriceMinInputChange={handlePriceMinInput}
                    onPriceMaxInputChange={handlePriceMaxInput}
                    onClose={() => setFiltersOpen(false)}
                  />
                )}
                <select value={sort} onChange={(e) => handleSortChange(e.target.value as SortOption)} className="catalog-sort-select">
                  {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
          </div> {/* .catalog-toolbar */}

            {loading ? (
              <div className="catalog-grid">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="product-card animate-pulse">
                    <div className="catalog-skel-img" />
                    <div className="product-card-body">
                      <div className="h-4 bg-[var(--border-subtle)] w-2/3 mb-3" />
                      <div className="flex justify-between items-center mb-3">
                        <div className="h-4 bg-[var(--border-subtle)] w-16" />
                        <div className="h-3 bg-[var(--border-subtle)] w-10" />
                      </div>
                      <div className="flex gap-2 mb-3">
                        <div className="h-3 bg-[var(--border-subtle)] w-12" />
                        <div className="h-3 bg-[var(--border-subtle)] w-14" />
                        <div className="h-3 bg-[var(--border-subtle)] w-10" />
                      </div>
                      <div className="h-3 bg-[var(--border-subtle)] w-1/2 mt-auto pt-3 border-t border-[var(--border-subtle)]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="catalog-empty">
                <div className="catalog-empty-icon">🔍</div>
                <div className="catalog-empty-title">No Switches Found</div>
                <p className="catalog-empty-desc">Try adjusting your search or filters.</p>
                <button type="button" onClick={resetAndClose} className="btn-secondary">Clear Filters</button>
              </div>
            ) : (
              <div className="catalog-grid">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <SubmitProductCTA productType="switch" />

      <Footer />
    </div>
  );
}
