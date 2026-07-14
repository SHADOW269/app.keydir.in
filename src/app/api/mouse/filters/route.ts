import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const mouseCategory = await prisma.category.findUnique({
    where: { slug: 'mouse' },
    select: { id: true },
  });

  if (!mouseCategory) {
    return NextResponse.json({
      specFields: [], brands: [], vendors: [], priceRange: { min: 0, max: 100000 },
    });
  }

  const [specFields, products, vendorProducts] = await Promise.all([
    prisma.specField.findMany({
      where: { categoryId: mouseCategory.id },
      select: { name: true, slug: true, options: true },
    }),
    prisma.product.findMany({
      where: { categoryId: mouseCategory.id },
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
      where: { product: { categoryId: mouseCategory.id } },
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
    specFields: specFields.map((sf) => ({
      name: sf.name,
      slug: sf.slug,
      options: sf.options ? JSON.parse(sf.options) as string[] : [],
    })),
    brands: Array.from(brandMap.values()).sort((a, b) => a.name.localeCompare(b.name)),
    vendors: Array.from(vendorMap.values()).sort((a, b) => a.name.localeCompare(b.name)),
    priceRange: {
      min: prices.length > 0 ? Math.floor(Math.min(...prices)) : 0,
      max: prices.length > 0 ? Math.ceil(Math.max(...prices)) : 100000,
    },
  });
}
