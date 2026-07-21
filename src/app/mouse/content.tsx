import { prisma } from '@/lib/prisma';
import { CategoryContent } from '@/components/product/category-content';

export const dynamic = 'force-dynamic';

export default async function MousePage() {
  const [banners, totalCount] = await Promise.all([
    prisma.banner.findMany({
      where: { status: 'live', locations: { some: { location: 'mouse' } } },
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
    }),
    prisma.product.count({ where: { productType: 'mouse', status: 'active' } }),
  ]);

  return (
    <CategoryContent
      productType="mouse"
      displayName="Mice"
      emptyIcon="🔍"
      filtersEndpoint="/api/mouse/filters"
      productsEndpoint="/api/mouse"
      banners={banners}
      totalCount={totalCount}
    />
  );
}
