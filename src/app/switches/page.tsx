import { Suspense } from 'react';
import SwitchesContent from './content';
import { CatalogSkeletonGrid } from '@/components/product/catalog-skeleton-grid';

export const dynamic = 'force-dynamic';

export default function SwitchesPage() {
  return (
    <Suspense fallback={<CatalogSkeletonGrid />}>
      <SwitchesContent />
    </Suspense>
  );
}
