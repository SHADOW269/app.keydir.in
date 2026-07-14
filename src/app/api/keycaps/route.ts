import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const q = searchParams.get('q') || undefined;
  const sort = searchParams.get('sort') || 'popular';
  const priceMin = searchParams.get('priceMin');
  const priceMax = searchParams.get('priceMax');
  const profiles = searchParams.getAll('profile');
  const materials = searchParams.getAll('material');
  const legendTypes = searchParams.getAll('legend');
  const layouts = searchParams.getAll('layout');
  const languages = searchParams.getAll('language');
  const themes = searchParams.getAll('theme');
  const colorFamilies = searchParams.getAll('color');
  const shineThrough = searchParams.getAll('shineThrough');
  const compatibility = searchParams.getAll('compatibility');
  const availability = searchParams.getAll('availability');
  const brands = searchParams.getAll('brand');
  const vendors = searchParams.getAll('vendor');
  const take = parseInt(searchParams.get('take') || '50', 10);

  const keycapsCategory = await prisma.category.findUnique({
    where: { slug: 'keycaps' },
    select: { id: true },
  });

  if (!keycapsCategory) {
    return NextResponse.json({ products: [], total: 0 });
  }

  // Query KeycapData for profile/material filters
  const keycapDataWhere: Prisma.KeycapDataWhereInput = {};
  if (profiles.length > 0) keycapDataWhere.profile = { in: profiles };
  if (materials.length > 0) keycapDataWhere.material = { in: materials };

  const matchingKeycapIds = await prisma.keycapData.findMany({
    where: keycapDataWhere,
    select: { productId: true },
  }).then((rows) => rows.map((r) => r.productId));

  const productWhere: Prisma.ProductWhereInput = {
    categoryId: keycapsCategory.id,
  };

  if (profiles.length > 0 || materials.length > 0) {
    productWhere.id = { in: matchingKeycapIds };
  }

  if (q) {
    productWhere.OR = [
      { name: { contains: q, mode: 'insensitive' } },
      { brand: { name: { contains: q, mode: 'insensitive' } } },
    ];
  }

  if (brands.length > 0) {
    productWhere.brand = { name: { in: brands } };
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
        category: { select: { name: true, slug: true } },
        vendorProducts: {
          select: { totalPrice: true },
          orderBy: { totalPrice: 'asc' },
          take: 1,
        },
        votes: { select: { type: true } },
        _count: { select: { vendorProducts: true } },
      },
    }),
    prisma.product.count({ where: productWhere }),
  ]);

  const productIds = products.map((p) => p.id);
  const keycapDataMap = new Map<string, { profile?: string | null; material?: string | null; manufactureMethod?: string | null; language?: string | null }>();
  if (productIds.length > 0) {
    const keycapDataRows = await prisma.keycapData.findMany({
      where: { productId: { in: productIds } },
    });
    for (const kd of keycapDataRows) {
      keycapDataMap.set(kd.productId, kd);
    }
  }

  let results = products.map((p) => {
    const upvotes = p.votes.filter((v) => v.type === 'upvote').length;
    const downvotes = p.votes.filter((v) => v.type === 'downvote').length;
    const totalVotes = upvotes + downvotes;
    const approval = totalVotes >= 10 ? Math.round((upvotes / totalVotes) * 100) : null;

    const kd = keycapDataMap.get(p.id);
    const tags: string[] = [];
    if (kd?.profile) tags.push(kd.profile.toUpperCase());
    if (kd?.material) tags.push(kd.material.toUpperCase());
    if (kd?.manufactureMethod) tags.push(kd.manufactureMethod.toUpperCase());
    if (kd?.language && kd.language !== 'English') tags.push(kd.language.toUpperCase());

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
      specs: tags.slice(0, 4),
      approval,
      userVote: null,
    };
  });

  // Client-side filtering for fields not in KeycapData model
  if (legendTypes.length > 0) {
    results = results.filter((r) => {
      const specs = r.specs.map((s) => s.toLowerCase());
      return legendTypes.some((l) => specs.includes(l.toLowerCase()));
    });
  }
  if (layouts.length > 0) {
    results = results.filter((r) => {
      const specs = r.specs.map((s) => s.toLowerCase());
      return layouts.some((l) => specs.includes(l.toLowerCase()));
    });
  }
  if (themes.length > 0) {
    results = results.filter((r) => {
      const specs = r.specs.map((s) => s.toLowerCase());
      return themes.some((t) => specs.includes(t.toLowerCase()));
    });
  }
  if (colorFamilies.length > 0) {
    results = results.filter((r) => {
      const specs = r.specs.map((s) => s.toLowerCase());
      return colorFamilies.some((c) => specs.includes(c.toLowerCase()));
    });
  }
  if (shineThrough.length > 0) {
    results = results.filter((r) => {
      const specs = r.specs.map((s) => s.toLowerCase());
      return shineThrough.some((s) => specs.includes(s.toLowerCase()));
    });
  }
  if (compatibility.length > 0) {
    results = results.filter((r) => {
      const specs = r.specs.map((s) => s.toLowerCase());
      return compatibility.some((c) => specs.includes(c.toLowerCase()));
    });
  }
  if (languages.length > 0) {
    results = results.filter((r) => {
      const specs = r.specs.map((s) => s.toLowerCase());
      return languages.some((l) => specs.includes(l.toLowerCase()));
    });
  }

  return NextResponse.json({ products: results, total });
}
