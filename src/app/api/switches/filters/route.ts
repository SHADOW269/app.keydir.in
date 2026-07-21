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
    prisma.switchSpec.findMany({
      where: { product: { productType: 'switches' } },
      select: {
        factoryLubed: true, handLubed: true, factoryFilmed: true, breakInProgress: true,
        switchCompat: true, switchType: true, switchBrand: true, switchModel: true,
        switchStemMaterial: true, switchTopHousing: true, switchBottomHousing: true,
        switchSpringType: true,
        switchLongPole: true, switchLedDiffuser: true, switchDustproofStem: true, switchLightPipe: true,
      },
    }),
    prisma.product.findMany({
      where: { productType: 'switches', brandId: { not: null } },
      select: { brand: { select: { name: true } } },
      distinct: ['brandId'],
    }),
    prisma.vendorProduct.findMany({
      where: { product: { productType: 'switches' } },
      select: { vendor: { select: { name: true } } },
      distinct: ['vendorId'],
    }),
    prisma.vendorProduct.aggregate({
      where: { product: { productType: 'switches' } },
      _min: { totalPrice: true },
      _max: { totalPrice: true },
    }),
  ]);

  const specFilters = {
    factoryLubed: [true, false],
    handLubed: [true, false],
    factoryFilmed: [true, false],
    breakInProgress: [true, false],
    switchType: unique(specs.flatMap((s) => extractJsonArray(s.switchType))),
    switchBrand: unique(specs.flatMap((s) => extractJsonArray(s.switchBrand))),
    switchModel: unique(specs.flatMap((s) => extractJsonArray(s.switchModel))),
    switchStemMaterial: unique(specs.map((s) => s.switchStemMaterial)).sort(),
    switchTopHousing: unique(specs.map((s) => s.switchTopHousing)).sort(),
    switchBottomHousing: unique(specs.map((s) => s.switchBottomHousing)).sort(),
    switchSpringType: unique(specs.map((s) => s.switchSpringType)).sort(),
    switchLongPole: [true, false],
    switchLedDiffuser: [true, false],
    switchDustproofStem: [true, false],
    switchLightPipe: [true, false],
  };

  const brands = unique(brandRows.map((r) => r.brand?.name)).sort();
  const vendors = unique(vendorRows.map((r) => r.vendor?.name)).sort();
  const priceMin = Number(priceRow._min.totalPrice ?? 0);
  const priceMax = Number(priceRow._max.totalPrice ?? 0);

  return NextResponse.json({ brands, vendors, specs: specFilters, priceMin, priceMax });
}
