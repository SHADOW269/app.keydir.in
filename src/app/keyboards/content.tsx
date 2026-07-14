'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { ProductCard } from '@/components/product/product-card';
import { FilterModal } from '@/components/product/filter-modal';
import { SlidersHorizontal } from 'lucide-react';
import { HeroBanner } from '@/components/banner/hero-banner';
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

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'lowest', label: 'Lowest Price' },
  { value: 'highest', label: 'Highest Price' },
  { value: 'newest', label: 'Newest' },
  { value: 'popular', label: 'Most Upvoted' },
  { value: 'vendors', label: 'Most Vendors' },
];

function readFiltersFromParams(params: URLSearchParams) {
  const filters: Record<string, string[]> = {};
  const skipKeys = new Set(['q', 'sort', 'priceMin', 'priceMax']);
  for (const [key, value] of params.entries()) {
    if (!skipKeys.has(key)) {
      if (!filters[key]) filters[key] = [];
      filters[key].push(value);
    }
  }
  return filters;
}

export default function KeyboardsContent({ banners = [] }: { banners?: Banner[] }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [products, setProducts] = useState<ProductCardType[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<SortOption>(() => (searchParams.get('sort') as SortOption) || 'lowest');
  const [filters, setFilters] = useState<Record<string, string[]>>(() => readFiltersFromParams(searchParams));
  const [priceRange, setPriceRange] = useState<{ min: string; max: string }>({
    min: searchParams.get('priceMin') || '',
    max: searchParams.get('priceMax') || '',
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [draftPreviewCount, setDraftPreviewCount] = useState<number | null>(null);
  const liveFetchRef = useRef<AbortController | null>(null);

  const q = searchParams.get('q') || '';
  const activeFilterCount =
    Object.values(filters).reduce((sum, arr) => sum + arr.length, 0) +
    (priceRange.min ? 1 : 0) +
    (priceRange.max ? 1 : 0);

  const buildUrl = useCallback(
    (f: Record<string, string[]>, p: { min: string; max: string }, s: SortOption, search: string) => {
      const params = new URLSearchParams();
      if (search) params.set('q', search);
      if (s !== 'lowest') params.set('sort', s);
      if (p.min) params.set('priceMin', p.min);
      if (p.max) params.set('priceMax', p.max);
      for (const [key, values] of Object.entries(f)) {
        for (const v of values) params.append(key, v);
      }
      const qs = params.toString();
      return `${pathname}${qs ? `?${qs}` : ''}`;
    },
    [pathname]
  );

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      params.set('sort', sort);
      if (priceRange.min) params.set('priceMin', priceRange.min);
      if (priceRange.max) params.set('priceMax', priceRange.max);
      for (const [key, values] of Object.entries(filters)) {
        for (const v of values) params.append(key, v);
      }
      const res = await fetch(`/api/products?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products ?? []);
        setTotal(data.total ?? 0);
      }
    } catch {} finally { setLoading(false); }
  }, [q, sort, filters, priceRange]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleDraftChange = useCallback(
    (df: Record<string, string[]>, dp: { min: string; max: string }) => {
      if (liveFetchRef.current) liveFetchRef.current.abort();
      const ctrl = new AbortController();
      liveFetchRef.current = ctrl;
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      params.set('sort', sort);
      if (dp.min) params.set('priceMin', dp.min);
      if (dp.max) params.set('priceMax', dp.max);
      for (const [key, values] of Object.entries(df)) {
        for (const v of values) params.append(key, v);
      }
      fetch(`/api/products?${params.toString()}`, { signal: ctrl.signal })
        .then((r) => r.json())
        .then((d) => setDraftPreviewCount(d.total ?? 0))
        .catch(() => {});
    },
    [q, sort]
  );

  function handleSortChange(s: SortOption) {
    setSort(s);
    router.push(buildUrl(filters, priceRange, s, q), { scroll: false });
  }

  function handleApply(f: Record<string, string[]>, p: { min: string; max: string }) {
    setFilters(f);
    setPriceRange(p);
    setDraftPreviewCount(null);
    router.push(buildUrl(f, p, sort, q), { scroll: false });
  }

  const sortLabel = SORT_OPTIONS.find((o) => o.value === sort)?.label || 'Lowest Price';

  return (
    <div className="catalog-layout">
      <Navbar />
      {banners.length > 0 && <HeroBanner banners={banners} />}
      <div className="catalog-page">
        {/* Toolbar: stats left, filter+sort right */}
        <div className="catalog-toolbar">
          <div className="catalog-stats">
            <span>{total} Products</span>
            <span className="catalog-stats-sep">·</span>
            <span>Sorted by {sortLabel}</span>
          </div>
          <div className="catalog-controls">
            <button className="catalog-filter-btn" onClick={() => setModalOpen(true)} type="button">
              <SlidersHorizontal size={14} />
              Filter
              {activeFilterCount > 0 && <span className="badge b-yellow">{activeFilterCount}</span>}
            </button>
            <select
              value={sort}
              onChange={(e) => handleSortChange(e.target.value as SortOption)}
              className="catalog-sort-select"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Product grid */}
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
          <div className="neo-card p-12 text-center">
            <div className="font-[family-name:var(--f-d)] text-2xl font-extrabold uppercase mb-2">No Keyboards Found</div>
            <p className="font-[family-name:var(--f-m)] text-sm text-[var(--text-muted)]">Try adjusting your filters or search query.</p>
          </div>
        ) : (
          <div className="catalog-grid">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>

      <div className="catalog-page" style={{ paddingBottom: '80px' }}>
        <div className="cta-section" style={{ background: 'var(--cta-bg)', position: 'relative', overflow: 'hidden' }}>
          <div className="section-tag-label"><span className="dot" /> SYSTEM_ONLINE // COMMUNITY_REQUEST</div>
          <h2 style={{ fontFamily: 'var(--f-d)', fontSize: 'clamp(2rem,5vw,4rem)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '-.05em', lineHeight: .9, marginBottom: '1.5rem' }}>
            CAN&apos;T FIND<br />YOUR PRODUCT?
          </h2>
          <p style={{ fontFamily: 'var(--f-m)', fontSize: '.9rem', maxWidth: '520px', marginBottom: '2rem', lineHeight: 1.75, color: 'var(--cta-text-muted)' }}>
            Missing a keyboard, switch, keycap, vendor, builder, or group buy?<br />
            Help us improve KeyDir by submitting it to our team.<br />
            We&apos;re constantly expanding the directory with community contributions.
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <a href="https://keydir.in/contact/" target="_blank" rel="noopener" className="btn-primary">CONTACT US →</a>
          </div>
        </div>
      </div>

      <FilterModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onApply={handleApply}
        liveCount={draftPreviewCount ?? total}
        onFilterChange={handleDraftChange}
      />

      <Footer />
    </div>
  );
}
