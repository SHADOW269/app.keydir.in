import { prisma } from '@/lib/prisma';
import { CategoryContent } from '@/components/product/category-content';

export const dynamic = 'force-dynamic';

export default async function KeyboardsPage() {
  const [banners, totalCount] = await Promise.all([
    prisma.banner.findMany({
      where: { status: 'live', locations: { some: { location: 'keyboards' } } },
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
    }),
    prisma.product.count({ where: { productType: 'keyboards', status: 'active' } }),
  ]);

  return (
    <CategoryContent
      productType="keyboard"
      displayName="Keyboards"
      emptyIcon="⌨"
      filtersEndpoint="/api/keyboards/filters"
      productsEndpoint="/api/products"
      defaultSort="lowest"
      priceMin={1499}
      priceMax={19999}
      banners={banners}
      totalCount={totalCount}
    />
  );
}
