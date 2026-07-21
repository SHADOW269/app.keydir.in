import { prisma } from '@/lib/prisma';
import { CategoryContent } from '@/components/product/category-content';

export const dynamic = 'force-dynamic';

export default async function KeycapsPage() {
  const [banners, totalCount] = await Promise.all([
    prisma.banner.findMany({
      where: { status: 'live', locations: { some: { location: 'keycaps' } } },
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
    }),
    prisma.product.count({ where: { productType: 'keycaps', status: 'active' } }),
  ]);

  return (
    <CategoryContent
      productType="keycap"
      displayName="Keycap Sets"
      emptyIcon="🔍"
      filtersEndpoint="/api/keycaps/filters"
      productsEndpoint="/api/keycaps"
      banners={banners}
      totalCount={totalCount}
    />
  );
}
