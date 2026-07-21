import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const q = searchParams.get('q') || undefined;
  const sort = searchParams.get('sort') || 'popular';
  const priceMin = searchParams.get('priceMin');
  const priceMax = searchParams.get('priceMax');
  const availability = searchParams.getAll('availability');
  const brands = searchParams.getAll('brand');
  const vendors = searchParams.getAll('vendor');
  const take = parseInt(searchParams.get('take') || '50', 10);

  const arraySpecKeys = [
    'switchCompat', 'switchType', 'switchBrand', 'switchModel',
  ] as const;

  const stringSpecKeys = [
    'switchStemMaterial', 'switchTopHousing', 'switchBottomHousing', 'switchSpringType',
  ] as const;

  const booleanSpecKeys = [
    'factoryLubed', 'handLubed', 'factoryFilmed', 'breakInProgress',
    'switchLongPole', 'switchLedDiffuser', 'switchDustproofStem', 'switchLightPipe',
  ] as const;

  const productWhere: Prisma.ProductWhereInput = {
    productType: 'switches',
  };

  if (q) {
    productWhere.OR = [
      { name: { contains: q, mode: 'insensitive' } },
      { brand: { name: { contains: q, mode: 'insensitive' } } },
    ];
  }

  if (brands.length > 0) {
    productWhere.brand = { name: { in: brands } };
  }

  const specAnd: Prisma.SwitchSpecWhereInput[] = [];

  for (const key of arraySpecKeys) {
    const values = searchParams.getAll(key);
    if (values.length > 0) {
      const orGroup: Prisma.SwitchSpecWhereInput[] = values.map((v) => ({
        [key]: { path: [], equals: v },
      }));
      specAnd.push({ OR: orGroup });
    }
  }

  for (const key of stringSpecKeys) {
    const values = searchParams.getAll(key);
    if (values.length > 0) {
      specAnd.push({ [key]: { in: values } });
    }
  }

  for (const key of booleanSpecKeys) {
    const val = searchParams.get(key);
    if (val === 'true' || val === 'false') {
      specAnd.push({ [key]: val === 'true' });
    }
  }

  if (specAnd.length > 0) {
    productWhere.switchSpec = { AND: specAnd };
  }

  const vpConditions: Prisma.VendorProductWhereInput[] = [];
  if (priceMin || priceMax) {
    vpConditions.push({
      totalPrice: {
        ...(priceMin ? { gte: parseFloat(priceMin) } : {}),
        ...(priceMax ? { lte: parseFloat(priceMax) } : {}),
      },
    });
  }
  if (vendors.length > 0) {
    vpConditions.push({ vendor: { name: { in: vendors } } });
  }
  if (availability.length > 0) {
    const stockValues = availability.map((s) => s.toLowerCase().replace(/\s+/g, '_'));
    vpConditions.push({ stockStatus: { in: stockValues } });
  }
  if (vpConditions.length > 0) {
    productWhere.vendorProducts = { some: { AND: vpConditions } };
  }

  let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' };
  switch (sort) {
    case 'lowest':
      orderBy = { vendorProducts: { _count: 'asc' } };
      break;
    case 'highest':
      orderBy = { vendorProducts: { _count: 'desc' } };
      break;
    case 'newest':
      orderBy = { createdAt: 'desc' };
      break;
    case 'popular':
      orderBy = { votes: { _count: 'desc' } };
      break;
    case 'vendors':
      orderBy = { vendorProducts: { _count: 'desc' } };
      break;
    case 'alpha':
      orderBy = { name: 'asc' };
      break;
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where: productWhere,
      orderBy,
      take,
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
    }),
    prisma.product.count({ where: productWhere }),
  ]);

  const result = products.map((p) => {
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

  return NextResponse.json({ products: result, total });
}
