import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function extractJsonArray(val: unknown): string[] {
  if (Array.isArray(val)) return val.filter((v): v is string => typeof v === 'string');
  return [];
}

export async function GET() {
  const [specs, brandRows, vendorRows, priceRow] = await Promise.all([
    prisma.keyboardSpec.findMany({
      where: { product: { productType: 'keyboards' } },
      select: {
        layout: true, keyboardStyle: true, caseMaterial: true,
        mountingStyle: true, plateMaterial: true, stabilizerCompat: true,
        foamMaterial: true, foamPlacement: true, flexCuts: true,
        pcbType: true, nkro: true,
        connectivity: true, detachableCable: true, firmware: true,
        lighting: true, ledOrientation: true, perKeyRgb: true,
        switchesIncluded: true, switchCompat: true, switchType: true,
        switchBrand: true, switchModel: true,
        factoryLubed: true, handLubed: true, factoryFilmed: true, breakInProgress: true,
        switchLongPole: true, switchDustproofStem: true, switchLedDiffuser: true, switchLightPipe: true,
        switchStemMaterial: true, switchSpringType: true,
        keycapMaterial: true, keycapProfile: true, keycapLegendType: true, keycapLegendPlacement: true,
        includedAccessories: true,
      },
    }),
    prisma.product.findMany({
      where: { productType: 'keyboards', brandId: { not: null } },
      select: { brand: { select: { name: true } } },
      distinct: ['brandId'],
    }),
    prisma.vendorProduct.findMany({
      where: { product: { productType: 'keyboards' } },
      select: { vendor: { select: { name: true } } },
      distinct: ['vendorId'],
    }),
    prisma.vendorProduct.aggregate({
      where: { product: { productType: 'keyboards' } },
      _min: { totalPrice: true },
      _max: { totalPrice: true },
    }),
  ]);

  const unique = <T>(arr: (T | null | undefined)[]): T[] => [...new Set(arr.filter((v): v is T => v != null && v !== ''))];

  const jsonValues = (field: keyof typeof specs[0]) => {
    const set = new Set<string>();
    for (const s of specs) {
      for (const v of extractJsonArray(s[field])) set.add(v);
    }
    return [...set].sort();
  };

  const specFilters = {
    layout: unique(specs.map((s) => s.layout)).sort(),
    keyboardStyle: jsonValues('keyboardStyle'),
    caseMaterial: unique(specs.map((s) => s.caseMaterial)).sort(),
    mountingStyle: jsonValues('mountingStyle'),
    plateMaterial: jsonValues('plateMaterial'),
    stabilizerCompat: jsonValues('stabilizerCompat'),
    foamMaterial: jsonValues('foamMaterial'),
    foamPlacement: jsonValues('foamPlacement'),
    flexCuts: [true, false],
    pcbType: jsonValues('pcbType'),
    nkro: [true, false],
    connectivity: jsonValues('connectivity'),
    detachableCable: [true, false],
    firmware: jsonValues('firmware'),
    lighting: unique(specs.map((s) => s.lighting)).sort(),
    ledOrientation: unique(specs.map((s) => s.ledOrientation)).sort(),
    perKeyRgb: [true, false],
    switchesIncluded: [true, false],
    switchCompat: jsonValues('switchCompat'),
    switchType: jsonValues('switchType'),
    switchBrand: jsonValues('switchBrand'),
    switchModel: jsonValues('switchModel'),
    factoryLubed: [true, false],
    handLubed: [true, false],
    switchStemMaterial: unique(specs.map((s) => s.switchStemMaterial)).sort(),
    switchSpringType: unique(specs.map((s) => s.switchSpringType)).sort(),
    switchLongPole: [true, false],
    keycapMaterial: unique(specs.map((s) => s.keycapMaterial)).sort(),
    keycapProfile: unique(specs.map((s) => s.keycapProfile)).sort(),
    keycapLegendType: jsonValues('keycapLegendType'),
    keycapLegendPlacement: jsonValues('keycapLegendPlacement'),
    includedAccessories: jsonValues('includedAccessories'),
  };

  const brands = unique(brandRows.map((r) => r.brand?.name)).sort();
  const vendors = unique(vendorRows.map((r) => r.vendor?.name)).sort();
  const priceMin = Number(priceRow._min.totalPrice ?? 0);
  const priceMax = Number(priceRow._max.totalPrice ?? 0);

  return NextResponse.json({ brands, vendors, specs: specFilters, priceMin, priceMax });
}
