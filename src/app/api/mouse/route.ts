import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const q = searchParams.get('q') || undefined;
  const sort = searchParams.get('sort') || 'popular';
  const priceMin = searchParams.get('priceMin');
  const priceMax = searchParams.get('priceMax');
  const connections = searchParams.getAll('connection');
  const sensors = searchParams.getAll('sensor');
  const shapes = searchParams.getAll('shape');
  const weights = searchParams.getAll('weight');
  const pollingRates = searchParams.getAll('pollingRate');
  const switchTypes = searchParams.getAll('switchType');
  const rgbFilters = searchParams.getAll('rgb');
  const batteries = searchParams.getAll('battery');
  const gripStyles = searchParams.getAll('gripStyle');
  const sizes = searchParams.getAll('size');
  const availability = searchParams.getAll('availability');
  const brands = searchParams.getAll('brand');
  const vendors = searchParams.getAll('vendor');
  const take = parseInt(searchParams.get('take') || '50', 10);

  const mouseCategory = await prisma.category.findUnique({
    where: { slug: 'mouse' },
    select: { id: true },
  });

  if (!mouseCategory) {
    return NextResponse.json({ products: [], total: 0 });
  }

  const specFilters: Prisma.SpecificationWhereInput[] = [];
  const specGroups: Record<string, string[]> = {
    connection: connections,
    sensor: sensors,
    shape: shapes,
    weight: weights,
    polling_rate: pollingRates,
    switch_type: switchTypes,
    rgb: rgbFilters,
    battery: batteries,
    grip_style: gripStyles,
    size: sizes,
  };

  for (const [fieldSlug, values] of Object.entries(specGroups)) {
    if (values.length > 0) {
      specFilters.push({
        specField: { slug: fieldSlug },
        value: { in: values },
      });
    }
  }

  const where: Prisma.ProductWhereInput = {
    categoryId: mouseCategory.id,
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

  if (specFilters.length > 0) {
    where.specifications = { every: { AND: specFilters } };
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
        category: { select: { name: true, slug: true } },
        vendorProducts: {
          select: { totalPrice: true },
          orderBy: { totalPrice: 'asc' },
          take: 1,
        },
        specifications: {
          include: { specField: { select: { name: true, slug: true } } },
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
    const upvotes = p.votes.filter((v) => v.type === 'upvote').length;
    const downvotes = p.votes.filter((v) => v.type === 'downvote').length;
    const totalVotes = upvotes + downvotes;
    const approval = totalVotes >= 10 ? Math.round((upvotes / totalVotes) * 100) : null;

    const tags = p.specifications.map((s) => s.value.toUpperCase()).slice(0, 4);

    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      image: p.image,
      brand: p.brand,
      category: p.category,
      lowestPrice: p.vendorProducts[0]?.totalPrice ?? null,
      highestPrice: p.vendorProducts[0]?.totalPrice ?? null,
      vendorCount: p._count.vendorProducts,
      upvotes,
      downvotes,
      specs: tags,
      approval,
      userVote: (userVotes[p.id] as 'upvote' | 'downvote') || null,
    };
  });

  return NextResponse.json({ products: result, total });
}
