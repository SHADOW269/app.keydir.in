import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const q = searchParams.get('q') || undefined;
  const sort = searchParams.get('sort') || 'popular';
  const priceMin = searchParams.get('priceMin');
  const priceMax = searchParams.get('priceMax');
  const types = searchParams.getAll('type');
  const pins = searchParams.getAll('pin');
  const lubing = searchParams.getAll('lubing');
  const topHousing = searchParams.getAll('topHousing');
  const bottomHousing = searchParams.getAll('bottomHousing');
  const stemMaterial = searchParams.getAll('stemMaterial');
  const springWeight = searchParams.getAll('springWeight');
  const travel = searchParams.getAll('travel');
  const rgbCompat = searchParams.getAll('rgbCompat');
  const availability = searchParams.getAll('availability');
  const brands = searchParams.getAll('brand');
  const vendors = searchParams.getAll('vendor');
  const take = parseInt(searchParams.get('take') || '50', 10);

  const switchesCategory = await prisma.category.findUnique({
    where: { slug: 'switches' },
    select: { id: true },
  });

  if (!switchesCategory) {
    return NextResponse.json({ products: [], total: 0 });
  }

  const switchWhere: Prisma.SwitchDataWhereInput = {};
  if (types.length > 0) switchWhere.type = { in: types };
  if (lubing.length > 0) {
    if (lubing.includes('factory_lubed')) switchWhere.factoryLubed = true;
    if (lubing.includes('unlubed')) switchWhere.factoryLubed = false;
  }

  const productWhere: Prisma.ProductWhereInput = {
    categoryId: switchesCategory.id,
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
  const switchDataMap = new Map<string, Record<string, unknown>>();
  const switchDataRows = await prisma.switchData.findMany({
    where: { productId: { in: productIds } },
  });
  for (const sd of switchDataRows) {
    switchDataMap.set(sd.productId, sd as unknown as Record<string, unknown>);
  }

  let results = products.map((p) => {
    const upvotes = p.votes.filter((v) => v.type === 'upvote').length;
    const downvotes = p.votes.filter((v) => v.type === 'downvote').length;
    const totalVotes = upvotes + downvotes;
    const approval = totalVotes >= 10 ? Math.round((upvotes / totalVotes) * 100) : null;

    const sd = switchDataMap.get(p.id) as { type?: string | null; factoryLubed?: boolean; operatingForce?: number | null; soundTags?: string | null; feelTags?: string | null; useTags?: string | null; travel?: unknown; bottomOutForce?: number | null } | undefined;
    const tags: string[] = [];
    if (sd?.type) tags.push(sd.type.toUpperCase());
    if (sd?.factoryLubed) tags.push('FACTORY LUBED');
    if (sd?.operatingForce) tags.push(`${sd.operatingForce}G`);
    if (sd?.soundTags) {
      try { JSON.parse(sd.soundTags).forEach((t: string) => tags.push(t.toUpperCase())); } catch {}
    }
    if (sd?.feelTags) {
      try { JSON.parse(sd.feelTags).forEach((t: string) => tags.push(t.toUpperCase())); } catch {}
    }

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

  // Client-side filtering for switch-specific fields
  if (pins.length > 0) {
    results = results.filter((r) => {
      const specs = r.specs.map((s) => s.toLowerCase());
      return pins.some((p) => specs.includes(p.toLowerCase()));
    });
  }
  if (topHousing.length > 0) {
    results = results.filter((r) => {
      const specs = r.specs.map((s) => s.toLowerCase());
      return topHousing.some((h) => specs.includes(h.toLowerCase()));
    });
  }
  if (bottomHousing.length > 0) {
    results = results.filter((r) => {
      const specs = r.specs.map((s) => s.toLowerCase());
      return bottomHousing.some((h) => specs.includes(h.toLowerCase()));
    });
  }
  if (stemMaterial.length > 0) {
    results = results.filter((r) => {
      const specs = r.specs.map((s) => s.toLowerCase());
      return stemMaterial.some((m) => specs.includes(m.toLowerCase()));
    });
  }
  if (springWeight.length > 0) {
    results = results.filter((r) => {
      const specs = r.specs.map((s) => s.toLowerCase());
      return springWeight.some((w) => specs.includes(w.toLowerCase()));
    });
  }
  if (travel.length > 0) {
    results = results.filter((r) => {
      const specs = r.specs.map((s) => s.toLowerCase());
      return travel.some((t) => specs.includes(t.toLowerCase()));
    });
  }
  if (rgbCompat.length > 0) {
    results = results.filter((r) => {
      const specs = r.specs.map((s) => s.toLowerCase());
      return rgbCompat.some((c) => specs.includes(c.toLowerCase()));
    });
  }

  return NextResponse.json({ products: results, total });
}
