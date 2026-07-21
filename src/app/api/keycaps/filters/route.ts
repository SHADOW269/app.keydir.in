import { NextResponse } from 'next/server';
import { getFilterData, unique } from '@/lib/repositories/product-repository';

export async function GET() {
  const { specs, brandRows, vendorRows, priceRow } = await getFilterData('keycaps', 'keycaps', {
    keycapProfile: true, keycapLayoutSupport: true,
    keycapMaterial: true, keycapManufacturing: true,
    keycapLegends: true, keycapLegendPlacement: true,
    keycapLanguage: true, keycapKeyCount: true, keycapStemCompat: true,
    keycapThickness: true, keycapColorway: true, keycapManufacturer: true, keycapDesigner: true,
    keycapNovelties: true, keycapSpacebars: true, keycapAccentKeys: true, keycapArtisan: true,
  });

  const extractJsonArray = (val: unknown): string[] =>
    Array.isArray(val) ? val.filter((v): v is string => typeof v === 'string') : [];

  const specFilters = {
    keycapProfile: unique(specs.flatMap((s: any) => extractJsonArray(s.keycapProfile))),
    keycapLayoutSupport: unique(specs.flatMap((s: any) => extractJsonArray(s.keycapLayoutSupport))),
    keycapMaterial: unique(specs.flatMap((s: any) => extractJsonArray(s.keycapMaterial))),
    keycapManufacturing: unique(specs.flatMap((s: any) => extractJsonArray(s.keycapManufacturing))),
    keycapLegends: unique(specs.flatMap((s: any) => extractJsonArray(s.keycapLegends))),
    keycapLegendPlacement: unique(specs.flatMap((s: any) => extractJsonArray(s.keycapLegendPlacement))),
    keycapLanguage: unique(specs.flatMap((s: any) => extractJsonArray(s.keycapLanguage))),
    keycapKeyCount: unique(specs.flatMap((s: any) => extractJsonArray(s.keycapKeyCount))),
    keycapStemCompat: unique(specs.flatMap((s: any) => extractJsonArray(s.keycapStemCompat))),
    keycapThickness: unique(specs.map((s: any) => s.keycapThickness)).sort(),
    keycapColorway: unique(specs.map((s: any) => s.keycapColorway)).sort(),
    keycapManufacturer: unique(specs.flatMap((s: any) => extractJsonArray(s.keycapManufacturer))),
    keycapDesigner: unique(specs.map((s: any) => s.keycapDesigner)).sort(),
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
