import { HeroBannerSkeleton, HeroContentSkeleton } from '@/components/skeleton';

export default function HomeLoading() {
  return (
    <main className="page-body">
      <HeroBannerSkeleton />
      <HeroContentSkeleton />
    </main>
  );
}
