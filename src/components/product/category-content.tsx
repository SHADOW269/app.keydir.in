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
import { Pagination } from '@/components/ui/pagination';
import { ProductGridSkeleton } from '@/components/skeleton';
import { clamp } from '@/lib/utils';
import { SORT_OPTIONS, type Banner, type FilterOptions } from '@/lib/constants';
import type { ProductCard as ProductCardType, SortOption } from '@/types';

interface CategoryContentProps {
  productType: string;
  displayName: string;
  emptyIcon: string;
  filtersEndpoint: string;
  productsEndpoint: string;
  defaultSort?: SortOption;
  priceMin?: number;
  priceMax?: number;
  banners?: Banner[];
  totalCount?: number;
}

export function CategoryContent({
  productType,
  displayName,
  emptyIcon,
  filtersEndpoint,
  productsEndpoint,
  defaultSort = 'popular',
  priceMin: fixedPriceMin,
  priceMax: fixedPriceMax,
  banners = [],
  totalCount = 0,
}: CategoryContentProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [products, setProducts] = useState<ProductCardType[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<SortOption>(() => (searchParams.get('sort') as SortOption) || defaultSort);
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const q = searchParams.get('q') || '';

  const [PRICE_MIN, setPRICE_MIN] = useState(fixedPriceMin ?? 0);
  const [PRICE_MAX, setPRICE_MAX] = useState(fixedPriceMax ?? Infinity);
  const [priceMin, setPriceMin] = useState<number>(() => {
    if (fixedPriceMin != null) return fixedPriceMin;
    const v = searchParams.get('priceMin');
    return v ? parseInt(v, 10) : 0;
  });
  const [priceMax, setPriceMax] = useState<number>(() => {
    if (fixedPriceMax != null) return fixedPriceMax;
    const v = searchParams.get('priceMax');
    return v ? parseInt(v, 10) : Infinity;
  });

  const [pending, setPending] = useState<Record<string, string[]>>(() => {
    const init: Record<string, string[]> = {};
    for (const key of searchParams.keys()) {
      if (key === 'q' || key === 'sort' || key === 'page') continue;
      init[key] = searchParams.getAll(key);
    }
    return init;
  });
  const [applied, setApplied] = useState<Record<string, string[]>>(pending);

  const activeCount = Object.values(applied).reduce((n, a) => n + a.length, 0);

  useEffect(() => {
    fetch(filtersEndpoint)
      .then((r) => r.json())
      .then((d: FilterOptions) => {
        setFilterOptions(d);
        if (fixedPriceMin == null) {
          setPRICE_MIN(d.priceMin);
          setPriceMin((prev) => prev || d.priceMin);
        }
        if (fixedPriceMax == null) {
          setPRICE_MAX(d.priceMax);
          setPriceMax((prev) => prev || d.priceMax);
        }
      })
      .catch(() => {});
  }, [filtersEndpoint, fixedPriceMin, fixedPriceMax]);

  const buildUrl = useCallback((s: SortOption, f: Record<string, string[]>, pMin: number, pMax: number, p: number) => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (s !== defaultSort) params.set('sort', s);
    if (p > 1) params.set('page', String(p));
    for (const [k, v] of Object.entries(f)) for (const val of v) params.append(k, val);
    if (pMin > PRICE_MIN) params.set('priceMin', String(pMin));
    if (pMax < PRICE_MAX) params.set('priceMax', String(pMax));
    const qs = params.toString();
    return `${pathname}${qs ? `?${qs}` : ''}`;
  }, [pathname, q, defaultSort, PRICE_MIN, PRICE_MAX]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams();
      if (q) p.set('q', q);
      p.set('sort', sort);
      p.set('page', String(page));
      for (const [k, v] of Object.entries(applied)) for (const val of v) p.append(k, val);
      if (applied.priceMin) p.set('priceMin', applied.priceMin[0]);
      if (applied.priceMax) p.set('priceMax', applied.priceMax[0]);
      const res = await fetch(`${productsEndpoint}?${p.toString()}`);
      if (res.ok) {
        const d = await res.json();
        setProducts(d.products ?? []);
        setTotal(d.total ?? 0);
        setTotalPages(d.totalPages ?? 1);
      }
    } catch {} finally { setLoading(false); }
  }, [q, sort, page, applied, productsEndpoint]);

  useEffect(() => { const t = setTimeout(fetchProducts, 0); return () => clearTimeout(t); }, [fetchProducts]);

  function handleSortChange(s: SortOption) {
    setSort(s);
    setPage(1);
    router.push(buildUrl(s, applied, priceMin, priceMax, 1), { scroll: false });
  }

  function toggleOption(key: string, val: string) {
    setPending((prev) => {
      const cur = prev[key] || [];
      return { ...prev, [key]: cur.includes(val) ? cur.filter((v) => v !== val) : [...cur, val] };
    });
  }

  function applyAndClose() {
    const next = { ...pending };
    if (priceMin > PRICE_MIN) next.priceMin = [String(priceMin)];
    else delete next.priceMin;
    if (priceMax < PRICE_MAX) next.priceMax = [String(priceMax)];
    else delete next.priceMax;
    setApplied(next);
    setPage(1);
    router.push(buildUrl(sort, next, priceMin, priceMax, 1), { scroll: false });
    setFiltersOpen(false);
  }

  function resetAndClose() {
    setPending({}); setApplied({});
    setPriceMin(PRICE_MIN); setPriceMax(PRICE_MAX);
    setPage(1);
    router.push(buildUrl(sort, {}, PRICE_MIN, PRICE_MAX, 1), { scroll: false });
    setFiltersOpen(false);
  }

  function removeFilter(key: string, val: string) {
    if (key === 'priceMin') setPriceMin(PRICE_MIN);
    if (key === 'priceMax') setPriceMax(PRICE_MAX);
    setApplied((prev) => {
      const u = { ...prev, [key]: (prev[key] || []).filter((v) => v !== val) };
      if (!u[key]?.length) delete u[key];
      setPending(u);
      setPage(1);
      const pMin = key === 'priceMin' ? PRICE_MIN : priceMin;
      const pMax = key === 'priceMax' ? PRICE_MAX : priceMax;
      router.push(buildUrl(sort, u, pMin, pMax, 1), { scroll: false });
      return u;
    });
  }

  function handlePriceMinChange(v: number) { setPriceMin(v); }
  function handlePriceMaxChange(v: number) { setPriceMax(v); }
  function handlePriceMinInput(v: string) {
    const n = parseInt(v.replace(/\D/g, ''), 10);
    if (!isNaN(n)) setPriceMin(clamp(n, PRICE_MIN, priceMax - 100));
  }
  function handlePriceMaxInput(v: string) {
    const n = parseInt(v.replace(/\D/g, ''), 10);
    if (!isNaN(n)) setPriceMax(clamp(n, priceMin + 100, PRICE_MAX));
  }

  const sortLabel = SORT_OPTIONS.find((o) => o.value === sort)?.label || 'Lowest Price';

  return (
    <div className="catalog-layout">
      <Navbar />
      {banners.length > 0 && <HeroBanner banners={banners} />}
      <div className="catalog-page">
        {totalCount === 0 ? (
          <EmptyCategory category={displayName} />
        ) : (
          <>
            <div className="catalog-toolbar">
              <div className="catalog-stats">
                <span>{total} {displayName}{displayName.endsWith('s') ? '' : 's'}</span>
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
                    priceMin={priceMin}
                    priceMax={priceMax}
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
          </div>

            {loading ? (
              <div className="catalog-product-area">
                <ProductGridSkeleton count={12} />
              </div>
            ) : products.length === 0 ? (
              <div className="catalog-empty">
                <div className="catalog-empty-icon">{emptyIcon}</div>
                <div className="catalog-empty-title">No {displayName} Found</div>
                <p className="catalog-empty-desc">Try adjusting your search or filters.</p>
                <button type="button" onClick={resetAndClose} className="btn-secondary">Clear Filters</button>
              </div>
            ) : (
              <div className="catalog-product-area">
                <div className="catalog-grid">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
                <Pagination page={page} totalPages={totalPages} />
              </div>
            )}
          </>
        )}
      </div>

      <SubmitProductCTA productType={productType} />

      <Footer />
    </div>
  );
}
