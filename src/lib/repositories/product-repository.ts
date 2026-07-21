import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export function extractJsonArray(val: unknown): string[] {
  if (Array.isArray(val)) return val.filter((v): v is string => typeof v === 'string');
  return [];
}

export function unique<T>(arr: (T | null | undefined)[]): T[] {
  return [...new Set(arr.filter((v): v is T => v != null && v !== ''))];
}

const PRODUCT_CARD_INCLUDE = {
  brand: { select: { name: true } },
  vendorProducts: {
    select: {
      totalPrice: true,
      effectivePrice: true,
      _count: { select: { coupons: { where: { enabled: true } } } },
    },
    orderBy: { effectivePrice: 'asc' as const },
    take: 1,
  },
  votes: { select: { type: true } },
  _count: { select: { vendorProducts: true } },
} satisfies Prisma.ProductInclude;

export type ProductWithRelations = Prisma.ProductGetPayload<{ include: typeof PRODUCT_CARD_INCLUDE }>;

export async function findProductCards(
  where: Prisma.ProductWhereInput,
  orderBy: Prisma.ProductOrderByWithRelationInput,
  take: number,
): Promise<ProductWithRelations[]> {
  return prisma.product.findMany({
    where,
    orderBy,
    take,
    include: PRODUCT_CARD_INCLUDE,
  });
}

export async function countProducts(where: Prisma.ProductWhereInput): Promise<number> {
  return prisma.product.count({ where });
}

export async function getUserVotes(
  profileId: string,
  productIds: string[],
): Promise<Record<string, string>> {
  const votes = await prisma.vote.findMany({
    where: { profileId, productId: { in: productIds } },
    select: { productId: true, type: true },
  });
  return Object.fromEntries(votes.map((v) => [v.productId, v.type]));
}

export async function findLowestPriceProducts(): Promise<ProductWithRelations[]> {
  return prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
    include: PRODUCT_CARD_INCLUDE,
  });
}

export async function findBestDeals() {
  return prisma.vendorProduct.findMany({
    orderBy: { effectivePrice: 'asc' },
    take: 10,
    where: { stockStatus: { in: ['in_stock', 'preorder'] } },
    include: {
      product: {
        select: {
          id: true, name: true, slug: true, image: true,
          brand: { select: { name: true } },
        },
      },
      vendor: { select: { name: true } },
    },
  });
}

export async function findTrendingProducts() {
  return prisma.product.findMany({
    include: {
      brand: { select: { name: true } },
      votes: { select: { type: true } },
    },
  });
}

export async function getFilterData(productType: string, specModel: string, specSelect: Record<string, boolean>) {
  const specModelMap: Record<string, any> = {
    keyboards: prisma.keyboardSpec,
    switches: prisma.switchSpec,
    keycaps: prisma.keycapSpec,
    mouse: prisma.mouseSpec,
  };

  const model = specModelMap[specModel] || prisma.keyboardSpec;

  const [specs, brandRows, vendorRows, priceRow] = await Promise.all([
    (model as any).findMany({
      where: { product: { productType } },
      select: specSelect,
    }),
    prisma.product.findMany({
      where: { productType, brandId: { not: null } },
      select: { brand: { select: { name: true } } },
      distinct: ['brandId'],
    }),
    prisma.vendorProduct.findMany({
      where: { product: { productType } },
      select: { vendor: { select: { name: true } } },
      distinct: ['vendorId'],
    }),
    prisma.vendorProduct.aggregate({
      where: { product: { productType } },
      _min: { totalPrice: true },
      _max: { totalPrice: true },
    }),
  ]);

  return { specs, brandRows, vendorRows, priceRow };
}

export { prisma };
