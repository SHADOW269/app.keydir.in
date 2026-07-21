import { BannerForm } from '@/components/admin/banner-form';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function EditBannerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const banner = await prisma.banner.findUnique({
    where: { id },
    include: { locations: true },
  });
  if (!banner) notFound();

  return (
    <BannerForm
      banner={banner}
      stats={{ clicks: banner.totalClicks, views: banner.totalViews, updatedAt: banner.updatedAt }}
    />
  );
}
