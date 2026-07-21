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
    prisma.mouseSpec.findMany({
      where: { product: { productType: 'mouse' } },
      select: {
        mouseConnection: true, mouseSensor: true,
        mousePollingRate: true, mouseDpi: true, mouseMaxIps: true, mouseMaxAccel: true, mouseLod: true,
        mouseWeight: true, mouseShape: true, mouseHandOrientation: true, mouseSize: true,
        mouseSwitches: true, mouseEncoder: true, mouseScrollWheel: true,
        mouseBattery: true, mouseChargingPort: true,
        mouseFeet: true, mouseRgb: true, mouseSoftwareRequired: true, mouseOnboardMemory: true,
        mouseShellMaterial: true, mouseGripType: true, mouseColor: true,
        mouseCompatibility: true, mouseAccessories: true, mouseWarranty: true,
      },
    }),
    prisma.product.findMany({
      where: { productType: 'mouse', brandId: { not: null } },
      select: { brand: { select: { name: true } } },
      distinct: ['brandId'],
    }),
    prisma.vendorProduct.findMany({
      where: { product: { productType: 'mouse' } },
      select: { vendor: { select: { name: true } } },
      distinct: ['vendorId'],
    }),
    prisma.vendorProduct.aggregate({
      where: { product: { productType: 'mouse' } },
      _min: { totalPrice: true },
      _max: { totalPrice: true },
    }),
  ]);

  const specFilters: Record<string, string[] | boolean[]> = {
    mouseConnection: unique(specs.flatMap((s) => extractJsonArray(s.mouseConnection))),
    mouseSensor: unique(specs.map((s) => s.mouseSensor)).sort(),
    mousePollingRate: unique(specs.flatMap((s) => extractJsonArray(s.mousePollingRate))),
    mouseWeight: unique(specs.map((s) => String(s.mouseWeight))).sort(),
    mouseShape: unique(specs.map((s) => s.mouseShape)).sort(),
    mouseHandOrientation: unique(specs.map((s) => s.mouseHandOrientation)).sort(),
    mouseSize: unique(specs.map((s) => s.mouseSize)).sort(),
    mouseSwitches: unique(specs.map((s) => s.mouseSwitches)).sort(),
    mouseEncoder: unique(specs.map((s) => s.mouseEncoder)).sort(),
    mouseScrollWheel: unique(specs.map((s) => s.mouseScrollWheel)).sort(),
    mouseChargingPort: unique(specs.map((s) => s.mouseChargingPort)).sort(),
    mouseFeet: unique(specs.map((s) => s.mouseFeet)).sort(),
    mouseRgb: [true, false],
    mouseSoftwareRequired: [true, false],
    mouseOnboardMemory: [true, false],
    mouseShellMaterial: unique(specs.map((s) => s.mouseShellMaterial)).sort(),
    mouseGripType: unique(specs.flatMap((s) => extractJsonArray(s.mouseGripType))),
    mouseColor: unique(specs.map((s) => s.mouseColor)).sort(),
    mouseCompatibility: unique(specs.flatMap((s) => extractJsonArray(s.mouseCompatibility))),
    mouseAccessories: unique(specs.flatMap((s) => extractJsonArray(s.mouseAccessories))),
    mouseWarranty: unique(specs.map((s) => s.mouseWarranty)).sort(),
    mouseLod: unique(specs.map((s) => s.mouseLod)).sort(),
  };

  const brands = unique(brandRows.map((r) => r.brand?.name)).sort();
  const vendors = unique(vendorRows.map((r) => r.vendor?.name)).sort();
  const priceMin = Number(priceRow._min.totalPrice ?? 0);
  const priceMax = Number(priceRow._max.totalPrice ?? 0);

  return NextResponse.json({ brands, vendors, specs: specFilters, priceMin, priceMax });
}
