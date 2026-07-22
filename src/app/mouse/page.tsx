import { Suspense } from 'react';
import MouseContent from './content';
import { CatalogSkeletonGrid } from '@/components/product/catalog-skeleton-grid';

export const dynamic = 'force-dynamic';

export default function MousePage() {
  return (
    <Suspense fallback={<CatalogSkeletonGrid />}>
      <MouseContent />
    </Suspense>
  );
}
