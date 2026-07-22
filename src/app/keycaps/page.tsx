import { Suspense } from 'react';
import KeycapsContent from './content';
import { CatalogSkeletonGrid } from '@/components/product/catalog-skeleton-grid';

export const dynamic = 'force-dynamic';

export default function KeycapsPage() {
  return (
    <Suspense fallback={<CatalogSkeletonGrid />}>
      <KeycapsContent />
    </Suspense>
  );
}
