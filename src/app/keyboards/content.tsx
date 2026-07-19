'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { SubmitProductCTA } from '@/components/layout/submit-product-cta';
import { Footer } from '@/components/layout/footer';
import { ProductCard } from '@/components/product/product-card';
import { EmptyCategory } from '@/components/product/empty-category';
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

const AVAILABILITY = ['In Stock', 'Pre-order', 'Group Buy', 'Coming Soon', 'Out of Stock'];

function fmtBool(val: string | boolean): string {
  if (typeof val === 'boolean') return val ? 'Yes' : 'No';
  return val;
}

function fmtPrice(n: number): string {
  return '₹' + n.toLocaleString('en-IN');
}

export default function KeyboardsContent({ banners = [], totalCount = 0 }: { banners?: Banner[]; totalCount?: number }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [products, setProducts] = useState<ProductCardType[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<SortOption>(() => (searchParams.get('sort') as SortOption) || 'lowest');
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Price range state
  const PRICE_MIN = 1499;
  const PRICE_MAX = 19999;
  const [priceMin, setPriceMin] = useState(PRICE_MIN);
  const [priceMax, setPriceMax] = useState(PRICE_MAX);
  const [dragging, setDragging] = useState<'min' | 'max' | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  // All filter state (synced to URL on apply)
  const [pending, setPending] = useState<Record<string, string[]>>(() => {
    const init: Record<string, string[]> = {};
    for (const key of searchParams.keys()) {
      if (key === 'q' || key === 'sort') continue;
      init[key] = searchParams.getAll(key);
    }
    return init;
  });
  const [applied, setApplied] = useState<Record<string, string[]>>(pending);

  const q = searchParams.get('q') || '';
  const activeCount = Object.values(applied).reduce((n, a) => n + a.length, 0);

  useEffect(() => {
    fetch('/api/keyboards/filters')
      .then((r) => r.json())
      .then((d: FilterOptions) => setFilterOptions(d))
      .catch(() => {});
  }, []);

  const buildUrl = useCallback((s: SortOption, f: Record<string, string[]>, pMin: number, pMax: number) => {
    const p = new URLSearchParams();
    if (q) p.set('q', q);
    if (s !== 'lowest') p.set('sort', s);
    for (const [k, v] of Object.entries(f)) for (const val of v) p.append(k, val);
    if (pMin > PRICE_MIN) p.set('priceMin', String(pMin));
    if (pMax < PRICE_MAX) p.set('priceMax', String(pMax));
    const qs = p.toString();
    return `${pathname}${qs ? `?${qs}` : ''}`;
  }, [pathname, q]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams();
      if (q) p.set('q', q);
      p.set('sort', sort);
      for (const [k, v] of Object.entries(applied)) for (const val of v) p.append(k, val);
      if (applied.priceMin) p.set('priceMin', applied.priceMin[0]);
      if (applied.priceMax) p.set('priceMax', applied.priceMax[0]);
      const res = await fetch(`/api/products?${p.toString()}`);
      if (res.ok) { const d = await res.json(); setProducts(d.products ?? []); setTotal(d.total ?? 0); }
    } catch {} finally { setLoading(false); }
  }, [q, sort, applied]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  function handleSortChange(s: SortOption) { setSort(s); router.push(buildUrl(s, applied, priceMin, priceMax), { scroll: false }); }

  function toggleOption(key: string, val: string) {
    setPending((prev) => {
      const cur = prev[key] || [];
      return { ...prev, [key]: cur.includes(val) ? cur.filter((v) => v !== val) : [...cur, val] };
    });
  }

  function applyFilters() {
    const next = { ...pending };
    if (priceMin > PRICE_MIN) next.priceMin = [String(priceMin)];
    else delete next.priceMin;
    if (priceMax < PRICE_MAX) next.priceMax = [String(priceMax)];
    else delete next.priceMax;
    setApplied(next);
    router.push(buildUrl(sort, next, priceMin, priceMax), { scroll: false });
  }

  function resetFilters() {
    setPending({}); setApplied({});
    setPriceMin(PRICE_MIN); setPriceMax(PRICE_MAX);
    router.push(buildUrl(sort, {}, PRICE_MIN, PRICE_MAX), { scroll: false });
  }

  function removeFilter(key: string, val: string) {
    if (key === 'priceMin') { setPriceMin(PRICE_MIN); }
    if (key === 'priceMax') { setPriceMax(PRICE_MAX); }
    setApplied((prev) => {
      const u = { ...prev, [key]: (prev[key] || []).filter((v) => v !== val) };
      if (!u[key]?.length) delete u[key];
      setPending(u);
      router.push(buildUrl(sort, u, key === 'priceMin' ? PRICE_MIN : priceMin, key === 'priceMax' ? PRICE_MAX : priceMax), { scroll: false });
      return u;
    });
  }

  // All selected chips
  const selectedChips = useMemo(() => {
    const chips: { key: string; val: string; label: string }[] = [];
    for (const [k, vals] of Object.entries(applied)) {
      for (const v of vals) {
        let label = fmtBool(v);
        if (k === 'priceMin') label = `Min ₹${parseInt(v).toLocaleString('en-IN')}`;
        else if (k === 'priceMax') label = `Max ₹${parseInt(v).toLocaleString('en-IN')}`;
        chips.push({ key: k, val: v, label });
      }
    }
    return chips;
  }, [applied]);

  const sortLabel = SORT_OPTIONS.find((o) => o.value === sort)?.label || 'Lowest Price';

  // ── Price range slider logic ──
  function pctToVal(pct: number) {
    return Math.round(PRICE_MIN + (pct / 100) * (PRICE_MAX - PRICE_MIN));
  }
  function valToPct(val: number) {
    return ((val - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100;
  }
  function clamp(v: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, v)); }

  function getPointerPct(e: React.PointerEvent | PointerEvent) {
    if (!sliderRef.current) return 0;
    const rect = sliderRef.current.getBoundingClientRect();
    return clamp(((e.clientX - rect.left) / rect.width) * 100, 0, 100);
  }

  function onPointerDown(handle: 'min' | 'max') {
    return (e: React.PointerEvent) => {
      e.preventDefault();
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      setDragging(handle);
    };
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!dragging) return;
    const pct = getPointerPct(e);
    const val = pctToVal(pct);
    if (dragging === 'min') setPriceMin(clamp(val, PRICE_MIN, priceMax - 100));
    else setPriceMax(clamp(val, priceMin + 100, PRICE_MAX));
  }

  function onPointerUp() { setDragging(null); }

  function onMinInputChange(v: string) {
    const n = parseInt(v.replace(/\D/g, ''), 10);
    if (!isNaN(n)) setPriceMin(clamp(n, PRICE_MIN, priceMax - 100));
  }
  function onMaxInputChange(v: string) {
    const n = parseInt(v.replace(/\D/g, ''), 10);
    if (!isNaN(n)) setPriceMax(clamp(n, priceMin + 100, PRICE_MAX));
  }

  const minPct = valToPct(priceMin);
  const maxPct = valToPct(priceMax);

  // ── Custom scrollbar (Linux overlay scrollbars ignore CSS) ──
  const scrollRef = useRef<HTMLDivElement>(null);
  const [thumbH, setThumbH] = useState(40);
  const [thumbTop, setThumbTop] = useState(0);
  const thumbDragging = useRef(false);
  const dragStartY = useRef(0);
  const dragStartScroll = useRef(0);

  function syncThumb() {
    const el = scrollRef.current;
    if (!el) return;
    const ratio = el.clientHeight / el.scrollHeight;
    setThumbH(Math.max(24, ratio * el.clientHeight));
    setThumbTop((el.scrollTop / el.scrollHeight) * el.clientHeight);
  }

  function onScrollContainerScroll() {
    if (!thumbDragging.current) syncThumb();
  }

  function onThumbDown(e: React.PointerEvent) {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    thumbDragging.current = true;
    dragStartY.current = e.clientY;
    dragStartScroll.current = scrollRef.current?.scrollTop || 0;
  }

  function onThumbMove(e: React.PointerEvent) {
    if (!thumbDragging.current || !scrollRef.current) return;
    const el = scrollRef.current;
    const dy = e.clientY - dragStartY.current;
    const scrollRatio = (el.scrollHeight - el.clientHeight) / (el.clientHeight - thumbH);
    el.scrollTop = dragStartScroll.current + dy * scrollRatio;
  }

  function onThumbUp() { thumbDragging.current = false; }

  function onTrackClick(e: React.MouseEvent<HTMLDivElement>) {
    if (!scrollRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientY - rect.top) / rect.height;
    scrollRef.current.scrollTop = pct * scrollRef.current.scrollHeight;
  }

  return (
    <div className="catalog-layout">
      <Navbar />
      {banners.length > 0 && <HeroBanner banners={banners} />}
      <div className="catalog-page">
        {totalCount === 0 ? (
          <EmptyCategory category="Keyboards" />
        ) : (
          <>
            <div className="catalog-toolbar">
              <div className="catalog-stats">
                <span>{total} Keyboards Found</span>
                <span className="catalog-stats-sep">·</span>
                <span>Sorted by {sortLabel}</span>
              </div>
              <div className="catalog-controls">
                <button type="button" className="catalog-filter-btn" onClick={() => setFiltersOpen(!filtersOpen)}>
                  <span className="catalog-filter-icon">⚙</span>
                  <span>Filters</span>
                  {activeCount > 0 && <span className="catalog-filter-count">{activeCount}</span>}
                </button>
                <select value={sort} onChange={(e) => handleSortChange(e.target.value as SortOption)} className="catalog-sort-select">
                  {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>

            {/* Filter Panel */}
            {filtersOpen && filterOptions && (
          <div className="kb-explorer">
            <div className="kb-explorer-center" style={{ maxWidth: '100%' }}>
              <div className="kb-explorer-header">Filters</div>
              <div
                className="kb-explorer-scroll"
                ref={scrollRef}
                onScroll={onScrollContainerScroll}
              >
                <div className="kb-explorer-options">
                  <div className="kb-explorer-group">
                    <div className="kb-explorer-group-label">Price Range</div>
                    <div className="kb-price-display">
                      <span>{fmtPrice(priceMin)}</span>
                      <span className="kb-explorer-price-sep">—</span>
                      <span>{priceMax >= PRICE_MAX ? `${fmtPrice(PRICE_MAX)}+` : fmtPrice(priceMax)}</span>
                    </div>
                    <div
                      className="kb-range-slider"
                      ref={sliderRef}
                      onPointerMove={onPointerMove}
                      onPointerUp={onPointerUp}
                      onPointerLeave={onPointerUp}
                    >
                      <div className="kb-range-track">
                        <div className="kb-range-active" style={{ left: `${minPct}%`, width: `${maxPct - minPct}%` }} />
                      </div>
                      <div
                        className="kb-range-handle"
                        style={{ left: `${minPct}%` }}
                        onPointerDown={onPointerDown('min')}
                      />
                      <div
                        className="kb-range-handle"
                        style={{ left: `${maxPct}%` }}
                        onPointerDown={onPointerDown('max')}
                      />
                    </div>
                    <div className="kb-price-inputs">
                      <div className="kb-price-input-wrap">
                        <span className="kb-price-input-prefix">₹</span>
                        <input
                          type="text"
                          className="kb-price-input"
                          value={priceMin.toLocaleString('en-IN')}
                          onChange={(e) => onMinInputChange(e.target.value)}
                        />
                      </div>
                      <span className="kb-explorer-price-sep">—</span>
                      <div className="kb-price-input-wrap">
                        <span className="kb-price-input-prefix">₹</span>
                        <input
                          type="text"
                          className="kb-price-input"
                          value={priceMax >= PRICE_MAX ? `${PRICE_MAX.toLocaleString('en-IN')}+` : priceMax.toLocaleString('en-IN')}
                          onChange={(e) => onMaxInputChange(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="kb-explorer-group">
                    <div className="kb-explorer-group-label">Availability</div>
                    <div className="kb-explorer-chips">
                      {AVAILABILITY.map((a) => (
                        <button key={a} type="button" className={`kb-explorer-chip ${(pending.availability || []).includes(a) ? 'active' : ''}`} onClick={() => toggleOption('availability', a)}>
                          <span className="kb-explorer-chk">{(pending.availability || []).includes(a) ? '☑' : '☐'}</span>{a}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="kb-cscroll-track" onClick={onTrackClick}>
                <div
                  className="kb-cscroll-thumb"
                  style={{ height: `${thumbH}px`, transform: `translateY(${thumbTop}px)` }}
                  onPointerDown={onThumbDown}
                  onPointerMove={onThumbMove}
                  onPointerUp={onThumbUp}
                />
              </div>
            </div>

            <div className="kb-explorer-right">
              <div className="kb-explorer-right-header">Selected</div>
              {selectedChips.length === 0 ? (
                <div className="kb-explorer-empty">No filters applied</div>
              ) : (
                <div className="kb-explorer-selected">
                  {selectedChips.map((c) => (
                    <span key={`${c.key}-${c.val}`} className="kb-explorer-sel-chip">
                      <span>{c.label}</span>
                      <button type="button" className="kb-explorer-sel-x" onClick={() => removeFilter(c.key, c.val)}>×</button>
                    </span>
                  ))}
                </div>
              )}
              <div className="kb-explorer-actions">
                <button type="button" className="btn-secondary" onClick={resetFilters}>Reset</button>
                <button type="button" className="btn-primary" onClick={() => { applyFilters(); setFiltersOpen(false); }}>Apply</button>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="catalog-product-area">
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
          </div>
        ) : products.length === 0 ? (
          <div className="catalog-empty">
            <div className="catalog-empty-icon">⌨</div>
            <div className="catalog-empty-title">No Keyboards Found</div>
            <p className="catalog-empty-desc">Try adjusting your search or filters.</p>
            <button type="button" onClick={resetFilters} className="btn-secondary">Clear Filters</button>
          </div>
        ) : (
          <div className="catalog-product-area">
            <div className="catalog-grid">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}
          </>
        )}
      </div>

      <SubmitProductCTA productType="keyboard" />

      <Footer />
    </div>
  );
}
