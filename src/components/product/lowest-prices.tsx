import { prisma } from '@/lib/prisma';
import { LowestPricesClient } from './lowest-prices-client';
import { computeVoteStats } from '@/lib/vote-utils';

export async function LowestPrices() {
  const recent = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
    include: {
      brand: { select: { name: true } },
      vendorProducts: {
        select: { totalPrice: true, effectivePrice: true, _count: { select: { coupons: { where: { enabled: true } } } } },
        orderBy: { effectivePrice: 'asc' },
        take: 1,
      },
      votes: { select: { type: true } },
      _count: { select: { vendorProducts: true } },
    },
  });

  if (recent.length === 0) return null;

  const items = recent.map((p) => {
    const stats = computeVoteStats(p.votes);

    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      image: p.image,
      brand: p.brand,
      productType: p.productType,
      lowestPrice: p.vendorProducts[0]?.effectivePrice ?? null,
      originalPrice: p.vendorProducts[0]?.totalPrice ?? null,
      hasCoupons: (p.vendorProducts[0]?._count?.coupons ?? 0) > 0,
      vendorCount: p._count.vendorProducts,
      upvotes: stats.upvotes,
      downvotes: stats.downvotes,
      approval: stats.approval,
      userVote: null,
    };
  });

  return <LowestPricesClient items={items} />;
}
