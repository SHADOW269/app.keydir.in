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
  const layouts = searchParams.getAll('layout');
  const caseMaterials = searchParams.getAll('caseMaterial');
  const mountTypes = searchParams.getAll('mountType');
  const connectivity = searchParams.getAll('connectivity');
  const pcbTypes = searchParams.getAll('pcbType');
  const keyboardTypes = searchParams.getAll('keyboardType');
  const plateMaterials = searchParams.getAll('plateMaterial');
  const rgb = searchParams.getAll('rgb');
  const availability = searchParams.getAll('availability');
  const brands = searchParams.getAll('brand');
  const vendors = searchParams.getAll('vendor');
  const switchTypes = searchParams.getAll('switchType');
  const take = parseInt(searchParams.get('take') || '50', 10);

  const keyboardCategory = await prisma.category.findUnique({
    where: { slug: 'keyboards' },
    select: { id: true },
  });

  if (!keyboardCategory) {
    return NextResponse.json({ products: [], total: 0 });
  }

  const specFilters: Prisma.SpecificationWhereInput[] = [];
  const specGroups: Record<string, string[]> = {
    layout: layouts,
    case_material: caseMaterials,
    mount_type: mountTypes,
    connectivity: connectivity,
    pcb_type: pcbTypes,
    keyboard_type: keyboardTypes,
    plate_material: plateMaterials,
    rgb: rgb,
    switch_type: switchTypes,
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
    categoryId: keyboardCategory.id,
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
        category: { select: { name: true, slug: true } },
        vendorProducts: {
          select: { totalPrice: true },
          orderBy: { totalPrice: 'asc' },
          take: 1,
        },
        specifications: {
          include: { specField: { select: { name: true } } },
          take: 4,
        },
        votes: { select: { type: true } },
        _count: { select: { vendorProducts: true } },
      },
    }),
    prisma.product.count({ where }),
  ]);

  // Get current user's votes for these products
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
    // Not authenticated — continue without user votes
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
      category: p.category,
      lowestPrice: p.vendorProducts[0]?.totalPrice ?? null,
      highestPrice: p.vendorProducts[0]?.totalPrice ?? null,
      vendorCount: p._count.vendorProducts,
      upvotes,
      downvotes,
      specs: p.specifications.map((s) => s.value).slice(0, 4),
      approval,
      userVote: (userVotes[p.id] as 'upvote' | 'downvote') || null,
    };
  });

  return NextResponse.json({ products: result, total });
}
