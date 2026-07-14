import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const keyboardCategory = await prisma.category.findUnique({
    where: { slug: 'keyboards' },
    select: { id: true },
  });

  if (!keyboardCategory) {
    return NextResponse.json({ specFields: {}, brands: [], vendors: [], priceRange: { min: 0, max: 0 }, availability: [] });
  }

  const [specFields, brands, vendorRows, priceRow, availabilityRows] = await Promise.all([
    prisma.specField.findMany({
      where: { categoryId: keyboardCategory.id },
      select: {
        name: true,
        slug: true,
        specs: {
          select: { value: true },
          distinct: ['value'],
        },
      },
    }),
    prisma.brand.findMany({
      where: { products: { some: { categoryId: keyboardCategory.id } } },
      select: { name: true, slug: true },
      orderBy: { name: 'asc' },
    }),
    prisma.vendor.findMany({
      where: { vendorProducts: { some: { product: { categoryId: keyboardCategory.id } } } },
      select: { name: true, slug: true },
      orderBy: { name: 'asc' },
    }),
    prisma.vendorProduct.aggregate({
      where: { product: { categoryId: keyboardCategory.id } },
      _min: { totalPrice: true },
      _max: { totalPrice: true },
    }),
    prisma.vendorProduct.groupBy({
      by: ['stockStatus'],
      where: { product: { categoryId: keyboardCategory.id } },
      _count: { stockStatus: true },
    }),
  ]);

  const specFieldMap: Record<string, { name: string; slug: string; options: string[] }> = {};
  for (const sf of specFields) {
    specFieldMap[sf.slug] = {
      name: sf.name,
      slug: sf.slug,
      options: sf.specs.map((s) => s.value).sort(),
    };
  }

  return NextResponse.json({
    specFields: specFieldMap,
    brands,
    vendors: vendorRows,
    priceRange: {
      min: Number(priceRow._min.totalPrice ?? 0),
      max: Number(priceRow._max.totalPrice ?? 0),
    },
    availability: availabilityRows.map((a) => ({
      value: a.stockStatus,
      count: a._count.stockStatus,
    })),
  });
}
