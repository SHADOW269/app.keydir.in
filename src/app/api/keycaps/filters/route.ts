import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const keycapsCategory = await prisma.category.findUnique({
    where: { slug: 'keycaps' },
    select: { id: true },
  });

  if (!keycapsCategory) {
    return NextResponse.json({
      profiles: [], brands: [], vendors: [], priceRange: { min: 0, max: 100000 },
    });
  }

  const [products, vendorProducts] = await Promise.all([
    prisma.product.findMany({
      where: { categoryId: keycapsCategory.id },
      select: {
        brand: { select: { name: true, slug: true } },
        vendorProducts: {
          select: {
            vendor: { select: { name: true, slug: true } },
            totalPrice: true,
            stockStatus: true,
          },
        },
      },
    }),
    prisma.vendorProduct.findMany({
      where: { product: { categoryId: keycapsCategory.id } },
      select: { totalPrice: true },
    }),
  ]);

  const brandMap = new Map<string, { name: string; slug: string }>();
  const vendorMap = new Map<string, { name: string; slug: string }>();

  for (const p of products) {
    if (p.brand) brandMap.set(p.brand.slug, { name: p.brand.name, slug: p.brand.slug });
    for (const vp of p.vendorProducts) {
      vendorMap.set(vp.vendor.slug, { name: vp.vendor.name, slug: vp.vendor.slug });
    }
  }

  const prices = vendorProducts.map((vp) => Number(vp.totalPrice)).filter((n) => !isNaN(n) && n > 0);

  return NextResponse.json({
    profiles: ['cherry', 'oem', 'xda', 'dsa', 'csa', 'kat', 'mt3', 'mda', 'asa', 'osa'],
    brands: Array.from(brandMap.values()).sort((a, b) => a.name.localeCompare(b.name)),
    vendors: Array.from(vendorMap.values()).sort((a, b) => a.name.localeCompare(b.name)),
    priceRange: {
      min: prices.length > 0 ? Math.floor(Math.min(...prices)) : 0,
      max: prices.length > 0 ? Math.ceil(Math.max(...prices)) : 100000,
    },
  });
}
