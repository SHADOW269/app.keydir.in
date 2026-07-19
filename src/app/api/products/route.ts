import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const q = searchParams.get('q') || undefined;
  const sort = searchParams.get('sort') || 'lowest';
  const priceMin = searchParams.get('priceMin');
  const priceMax = searchParams.get('priceMax');
  const availability = searchParams.getAll('availability');
  const special = searchParams.get('special') || undefined;
  const take = parseInt(searchParams.get('take') || '50', 10);

  const arraySpecKeys = [
    'keyboardStyle', 'mountingStyle', 'plateMaterial',
    'pcbType', 'connectivity', 'firmware',
    'switchCompat', 'switchType', 'switchBrand', 'switchModel',
    'keycapLegendType', 'keycapLegendPlacement',
  ] as const;

  const stringSpecKeys = [
    'layout', 'caseMaterial', 'lighting', 'ledOrientation',
    'keycapMaterial', 'keycapProfile', 'switchStemMaterial', 'switchSpringType',
  ] as const;

  const booleanSpecKeys = [
    'flexCuts', 'detachableCable', 'perKeyRgb', 'switchesIncluded',
    'factoryLubed', 'handLubed', 'switchLongPole', 'switchDustproofStem',
  ] as const;

  const where: Prisma.ProductWhereInput = {
    productType: 'keyboards',
  };

  if (q) {
    where.OR = [
      { name: { contains: q, mode: 'insensitive' } },
      { brand: { name: { contains: q, mode: 'insensitive' } } },
    ];
  }

  const specAnd: Prisma.KeyboardSpecWhereInput[] = [];

  for (const key of arraySpecKeys) {
    const values = searchParams.getAll(key);
    if (values.length > 0) {
      const orGroup: Prisma.KeyboardSpecWhereInput[] = values.map((v) => ({
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

  if (special) {
    specAnd.push({ specialFeatures: { contains: special, mode: 'insensitive' } });
  }

  if (specAnd.length > 0) {
    where.keyboardSpec = { AND: specAnd };
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
  if (availability.length > 0) {
    const stockValues = availability.map((s) => s.toLowerCase().replace(/\s+/g, '_'));
    vpConditions.push({ stockStatus: { in: stockValues } });
  }
  if (vpConditions.length > 0) {
    where.vendorProducts = { some: { AND: vpConditions } };
  }

  let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'asc' };
  switch (sort) {
    case 'highest':
    case 'newest':
      orderBy = { createdAt: 'desc' };
      break;
    case 'popular':
      orderBy = { votes: { _count: 'desc' } };
      break;
    case 'vendors':
      orderBy = { vendorProducts: { _count: 'desc' } };
      break;
    case 'drops':
      orderBy = { createdAt: 'asc' };
      break;
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      take,
      include: {
        brand: { select: { name: true } },
        vendorProducts: {
          select: { totalPrice: true },
          orderBy: { totalPrice: 'asc' },
          take: 1,
        },
        votes: { select: { type: true } },
        _count: { select: { vendorProducts: true } },
      },
    }),
    prisma.product.count({ where }),
  ]);

  let userVotes: Record<string, string> = {};
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const profile = await prisma.profile.findUnique({ where: { userId: user.id } });
      if (profile) {
        const votes = await prisma.vote.findMany({
          where: {
            profileId: profile.id,
            productId: { in: products.map((p) => p.id) },
          },
          select: { productId: true, type: true },
        });
        userVotes = Object.fromEntries(votes.map((v) => [v.productId, v.type]));
      }
    }
  } catch {
    // Not authenticated
  }

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
      lowestPrice: p.vendorProducts[0]?.totalPrice ?? null,
      highestPrice: p.vendorProducts[0]?.totalPrice ?? null,
      vendorCount: p._count.vendorProducts,
      upvotes,
      downvotes,
      approval,
      userVote: (userVotes[p.id] as 'upvote' | 'downvote') || null,
    };
  });

  return NextResponse.json({ products: result, total });
}
