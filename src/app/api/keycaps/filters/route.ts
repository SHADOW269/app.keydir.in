import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function extractJsonArray(val: unknown): string[] {
  if (Array.isArray(val)) return val.filter((v): v is string => typeof v === 'string');
  return [];
}

function unique<T>(arr: (T | null | undefined)[]): T[] {
  return [...new Set(arr.filter((v): v is T => v != null && v !== ''))];
}

export async function GET() {
  const [specs, brandRows, vendorRows, priceRow] = await Promise.all([
    prisma.keycapSpec.findMany({
      where: { product: { productType: 'keycaps' } },
      select: {
        keycapProfile: true, keycapLayoutSupport: true,
        keycapMaterial: true, keycapManufacturing: true,
        keycapLegends: true, keycapLegendPlacement: true,
        keycapLanguage: true, keycapKeyCount: true, keycapStemCompat: true,
        keycapThickness: true, keycapColorway: true, keycapManufacturer: true, keycapDesigner: true,
        keycapNovelties: true, keycapSpacebars: true, keycapAccentKeys: true, keycapArtisan: true,
      },
    }),
    prisma.product.findMany({
      where: { productType: 'keycaps', brandId: { not: null } },
      select: { brand: { select: { name: true } } },
      distinct: ['brandId'],
    }),
    prisma.vendorProduct.findMany({
      where: { product: { productType: 'keycaps' } },
      select: { vendor: { select: { name: true } } },
      distinct: ['vendorId'],
    }),
    prisma.vendorProduct.aggregate({
      where: { product: { productType: 'keycaps' } },
      _min: { totalPrice: true },
      _max: { totalPrice: true },
    }),
  ]);

  const specFilters = {
    keycapProfile: unique(specs.flatMap((s) => extractJsonArray(s.keycapProfile))),
    keycapLayoutSupport: unique(specs.flatMap((s) => extractJsonArray(s.keycapLayoutSupport))),
    keycapMaterial: unique(specs.flatMap((s) => extractJsonArray(s.keycapMaterial))),
    keycapManufacturing: unique(specs.flatMap((s) => extractJsonArray(s.keycapManufacturing))),
    keycapLegends: unique(specs.flatMap((s) => extractJsonArray(s.keycapLegends))),
    keycapLegendPlacement: unique(specs.flatMap((s) => extractJsonArray(s.keycapLegendPlacement))),
    keycapLanguage: unique(specs.flatMap((s) => extractJsonArray(s.keycapLanguage))),
    keycapKeyCount: unique(specs.flatMap((s) => extractJsonArray(s.keycapKeyCount))),
    keycapStemCompat: unique(specs.flatMap((s) => extractJsonArray(s.keycapStemCompat))),
    keycapThickness: unique(specs.map((s) => s.keycapThickness)).sort(),
    keycapColorway: unique(specs.map((s) => s.keycapColorway)).sort(),
    keycapManufacturer: unique(specs.flatMap((s) => extractJsonArray(s.keycapManufacturer))),
    keycapDesigner: unique(specs.map((s) => s.keycapDesigner)).sort(),
    keycapNovelties: [true, false],
    keycapSpacebars: [true, false],
    keycapAccentKeys: [true, false],
    keycapArtisan: [true, false],
  };

  const brands = unique(brandRows.map((r) => r.brand?.name)).sort();
  const vendors = unique(vendorRows.map((r) => r.vendor?.name)).sort();
  const priceMin = Number(priceRow._min.totalPrice ?? 0);
  const priceMax = Number(priceRow._max.totalPrice ?? 0);

  return NextResponse.json({ brands, vendors, specs: specFilters, priceMin, priceMax });
}
