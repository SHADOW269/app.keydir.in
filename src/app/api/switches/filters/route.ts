import { NextResponse } from 'next/server';
import { getFilterData, unique } from '@/lib/repositories/product-repository';

export async function GET() {
  const { specs, brandRows, vendorRows, priceRow } = await getFilterData('switches', 'switches', {
    factoryLubed: true, handLubed: true, factoryFilmed: true, breakInProgress: true,
    switchCompat: true, switchType: true, switchBrand: true, switchModel: true,
    switchStemMaterial: true, switchTopHousing: true, switchBottomHousing: true,
    switchSpringType: true,
    switchLongPole: true, switchLedDiffuser: true, switchDustproofStem: true, switchLightPipe: true,
  });

  const extractJsonArray = (val: unknown): string[] =>
    Array.isArray(val) ? val.filter((v): v is string => typeof v === 'string') : [];

  const specFilters = {
    factoryLubed: [true, false],
    handLubed: [true, false],
    factoryFilmed: [true, false],
    breakInProgress: [true, false],
    switchType: unique(specs.flatMap((s: any) => extractJsonArray(s.switchType))),
    switchBrand: unique(specs.flatMap((s: any) => extractJsonArray(s.switchBrand))),
    switchModel: unique(specs.flatMap((s: any) => extractJsonArray(s.switchModel))),
    switchStemMaterial: unique(specs.map((s: any) => s.switchStemMaterial)).sort(),
    switchTopHousing: unique(specs.map((s: any) => s.switchTopHousing)).sort(),
    switchBottomHousing: unique(specs.map((s: any) => s.switchBottomHousing)).sort(),
    switchSpringType: unique(specs.map((s: any) => s.switchSpringType)).sort(),
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
