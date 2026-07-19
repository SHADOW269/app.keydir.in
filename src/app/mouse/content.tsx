'use client';

import { useState, useEffect, useCallback } from 'react';
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

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'lowest', label: 'Lowest Price' },
  { value: 'highest', label: 'Highest Price' },
  { value: 'newest', label: 'Newest' },
  { value: 'popular', label: 'Most Upvoted' },
  { value: 'vendors', label: 'Most Vendors' },
];

export default function MouseContent({ banners = [], totalCount = 0 }: { banners?: Banner[]; totalCount?: number }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [products, setProducts] = useState<ProductCardType[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<SortOption>(() => (searchParams.get('sort') as SortOption) || 'lowest');

  const q = searchParams.get('q') || '';

  const buildUrl = useCallback(
    (s: SortOption, search: string) => {
      const params = new URLSearchParams();
      if (search) params.set('q', search);
      if (s !== 'lowest') params.set('sort', s);
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
      const res = await fetch(`/api/mouse?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products ?? []);
        setTotal(data.total ?? 0);
      }
    } catch {} finally { setLoading(false); }
  }, [q, sort]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  function handleSortChange(s: SortOption) {
    setSort(s);
    router.push(buildUrl(s, q), { scroll: false });
  }

  const sortLabel = SORT_OPTIONS.find((o) => o.value === sort)?.label || 'Lowest Price';

  return (
    <div className="catalog-layout">
      <Navbar />
      {banners.length > 0 && <HeroBanner banners={banners} />}
      <div className="catalog-page">
        {totalCount === 0 ? (
          <EmptyCategory category="Mice" />
        ) : (
          <>
            <div className="catalog-toolbar">
              <div className="catalog-stats">
                <span>{total} Mice</span>
                <span className="catalog-stats-sep">·</span>
                <span>Sorted by {sortLabel}</span>
              </div>
              <div className="catalog-controls">
                <select value={sort} onChange={(e) => handleSortChange(e.target.value as SortOption)} className="catalog-sort-select">
                  {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>

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
                <div className="catalog-empty-title">No Mice Found</div>
                <p className="catalog-empty-desc">Try adjusting your search query.</p>
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

      <SubmitProductCTA productType="mouse" />

      <Footer />
    </div>
  );
}
