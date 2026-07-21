import { NextResponse } from 'next/server';
import { getFilterData } from '@/lib/repositories/product-repository';
import { unique, extractJsonArray } from '@/lib/utils';

export async function GET() {
  const { specs, brandRows, vendorRows, priceRow } = await getFilterData('keyboards', {
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
  });

  const specFilters = {
    layout: unique(specs.map((s: any) => s.layout)).sort(),
    keyboardStyle: unique(specs.flatMap((s: any) => extractJsonArray(s.keyboardStyle))),
    caseMaterial: unique(specs.map((s: any) => s.caseMaterial)).sort(),
    mountingStyle: unique(specs.flatMap((s: any) => extractJsonArray(s.mountingStyle))),
    plateMaterial: unique(specs.flatMap((s: any) => extractJsonArray(s.plateMaterial))),
    stabilizerCompat: unique(specs.flatMap((s: any) => extractJsonArray(s.stabilizerCompat))),
    foamMaterial: unique(specs.flatMap((s: any) => extractJsonArray(s.foamMaterial))),
    foamPlacement: unique(specs.flatMap((s: any) => extractJsonArray(s.foamPlacement))),
    flexCuts: [true, false],
    pcbType: unique(specs.flatMap((s: any) => extractJsonArray(s.pcbType))),
    nkro: [true, false],
    connectivity: unique(specs.flatMap((s: any) => extractJsonArray(s.connectivity))),
    detachableCable: [true, false],
    firmware: unique(specs.flatMap((s: any) => extractJsonArray(s.firmware))),
    lighting: unique(specs.map((s: any) => s.lighting)).sort(),
    ledOrientation: unique(specs.map((s: any) => s.ledOrientation)).sort(),
    perKeyRgb: [true, false],
    switchesIncluded: [true, false],
    switchCompat: unique(specs.flatMap((s: any) => extractJsonArray(s.switchCompat))),
    switchType: unique(specs.flatMap((s: any) => extractJsonArray(s.switchType))),
    switchBrand: unique(specs.flatMap((s: any) => extractJsonArray(s.switchBrand))),
    switchModel: unique(specs.flatMap((s: any) => extractJsonArray(s.switchModel))),
    factoryLubed: [true, false],
    handLubed: [true, false],
    factoryFilmed: [true, false],
    breakInProgress: [true, false],
    switchLongPole: [true, false],
    switchDustproofStem: [true, false],
    switchLedDiffuser: [true, false],
    switchLightPipe: [true, false],
    switchStemMaterial: unique(specs.map((s: any) => s.switchStemMaterial)).sort(),
    switchSpringType: unique(specs.map((s: any) => s.switchSpringType)).sort(),
    keycapMaterial: unique(specs.map((s: any) => s.keycapMaterial)).sort(),
    keycapProfile: unique(specs.map((s: any) => s.keycapProfile)).sort(),
    keycapLegendType: unique(specs.flatMap((s: any) => extractJsonArray(s.keycapLegendType))),
    keycapLegendPlacement: unique(specs.flatMap((s: any) => extractJsonArray(s.keycapLegendPlacement))),
    includedAccessories: unique(specs.flatMap((s: any) => extractJsonArray(s.includedAccessories))),
  };

  const brands = unique(brandRows.map((r) => r.brand?.name)).sort();
  const vendors = unique(vendorRows.map((r) => r.vendor?.name)).sort();
  const priceMin = Number(priceRow._min.totalPrice ?? 0);
  const priceMax = Number(priceRow._max.totalPrice ?? 0);

  return NextResponse.json({ brands, vendors, specs: specFilters, priceMin, priceMax });
}
