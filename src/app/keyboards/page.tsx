import { Suspense } from 'react';
import KeyboardsContent from './content';
import { CatalogSkeletonGrid } from '@/components/product/catalog-skeleton-grid';

export const dynamic = 'force-dynamic';

export default function KeyboardsPage() {
  return (
    <Suspense fallback={<CatalogSkeletonGrid />}>
      <KeyboardsContent />
    </Suspense>
  );
}
