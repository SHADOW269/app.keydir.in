import { prisma } from '@/lib/prisma';
import { CategoryContent } from '@/components/product/category-content';

export const dynamic = 'force-dynamic';

export default async function SwitchesPage() {
  const [banners, totalCount] = await Promise.all([
    prisma.banner.findMany({
      where: { status: 'live', locations: { some: { location: 'switches' } } },
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
    }),
    prisma.product.count({ where: { productType: 'switches', status: 'active' } }),
  ]);

  return (
    <CategoryContent
      productType="switch"
      displayName="Switches"
      emptyIcon="🔍"
      filtersEndpoint="/api/switches/filters"
      productsEndpoint="/api/switches"
      banners={banners}
      totalCount={totalCount}
    />
  );
}
