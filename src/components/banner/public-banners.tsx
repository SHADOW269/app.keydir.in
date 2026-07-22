import { getBannersForLocation } from '@/lib/admin/banner-actions';
import { HeroBanner } from '@/components/banner/hero-banner';

export async function PublicBanners({ location }: { location: string }) {
  const banners = await getBannersForLocation(location);
  if (banners.length === 0) return null;
  return <HeroBanner banners={banners} />;
}
