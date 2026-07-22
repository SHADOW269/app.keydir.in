import { ProductGridSkeleton } from '@/components/skeleton';

export default function SwitchesLoading() {
  return (
    <main className="catalog-page pt-28">
      <ProductGridSkeleton count={12} />
    </main>
  );
}
