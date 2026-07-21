import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { computeVoteStats } from '@/lib/vote-utils';
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
    'mouseConnection', 'mousePollingRate', 'mouseGripType', 'mouseCompatibility', 'mouseAccessories',
  ] as const;

  const stringSpecKeys = [
    'mouseSensor', 'mouseShape', 'mouseHandOrientation', 'mouseSize',
    'mouseSwitches', 'mouseEncoder', 'mouseScrollWheel', 'mouseChargingPort',
    'mouseFeet', 'mouseShellMaterial', 'mouseColor', 'mouseWarranty', 'mouseLod',
  ] as const;

  const booleanSpecKeys = [
    'mouseRgb', 'mouseSoftwareRequired', 'mouseOnboardMemory',
  ] as const;

  const where: Prisma.ProductWhereInput = {
    productType: 'mouse',
  };

  if (q) {
    where.OR = [
      { name: { contains: q, mode: 'insensitive' } },
      { brand: { name: { contains: q, mode: 'insensitive' } } },
    ];
  }

  if (brands.length > 0) {
    where.brand = { name: { in: brands } };
  }

  const specAnd: Prisma.MouseSpecWhereInput[] = [];

  for (const key of arraySpecKeys) {
    const values = searchParams.getAll(key);
    if (values.length > 0) {
      const orGroup: Prisma.MouseSpecWhereInput[] = values.map((v) => ({
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
    where.mouseSpec = { AND: specAnd };
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
    where.vendorProducts = { some: { AND: vpConditions } };
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
      orderBy = { name: 'asc' } as Prisma.ProductOrderByWithRelationInput;
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
          select: { totalPrice: true, effectivePrice: true, _count: { select: { coupons: { where: { enabled: true } } } } },
          orderBy: { effectivePrice: 'asc' },
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
  } catch {}

  const result = products.map((p) => {
    const { upvotes, downvotes, approval } = computeVoteStats(p.votes);

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
      userVote: (userVotes[p.id] as 'upvote' | 'downvote') || null,
    };
  });

  return NextResponse.json({ products: result, total });
}
