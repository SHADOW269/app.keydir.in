import { Suspense } from 'react';
import { prisma } from '@/lib/prisma';
import KeycapsContent from './content';
import { getBannersForLocation } from '@/lib/admin/banner-actions';

export const dynamic = 'force-dynamic';

export default async function KeycapsPage() {
  const [banners, totalCount] = await Promise.all([
    getBannersForLocation('keycaps'),
    prisma.product.count({ where: { productType: 'keycaps' } }),
  ]);

  return (
    <Suspense
      fallback={
        <div className="catalog-page pt-28">
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
                </div>
              </div>
            ))}
          </div>
        </div>
      }
    >
      <KeycapsContent banners={banners} totalCount={totalCount} />
    </Suspense>
  );
}
