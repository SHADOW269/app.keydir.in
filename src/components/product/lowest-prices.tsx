import { prisma } from '@/lib/prisma';
import { LowestPricesClient } from './lowest-prices-client';

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
    const upvotes = p.votes.filter((v) => v.type === 'upvote').length;
    const downvotes = p.votes.filter((v) => v.type === 'downvote').length;
    const totalVotes = upvotes + downvotes;
    const approval = totalVotes >= 10 ? Math.round((upvotes / totalVotes) * 100) : null;

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
      upvotes,
      downvotes,
      approval,
      userVote: null,
    };
  });

  return <LowestPricesClient items={items} />;
}
