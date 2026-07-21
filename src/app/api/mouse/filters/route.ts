import { NextResponse } from 'next/server';
import { getFilterData, unique } from '@/lib/repositories/product-repository';

export async function GET() {
  const { specs, brandRows, vendorRows, priceRow } = await getFilterData('mouse', 'mouse', {
    mouseConnection: true, mouseSensor: true,
    mousePollingRate: true, mouseDpi: true, mouseMaxIps: true, mouseMaxAccel: true, mouseLod: true,
    mouseWeight: true, mouseShape: true, mouseHandOrientation: true, mouseSize: true,
    mouseSwitches: true, mouseEncoder: true, mouseScrollWheel: true,
    mouseBattery: true, mouseChargingPort: true,
    mouseFeet: true, mouseRgb: true, mouseSoftwareRequired: true, mouseOnboardMemory: true,
    mouseShellMaterial: true, mouseGripType: true, mouseColor: true,
    mouseCompatibility: true, mouseAccessories: true, mouseWarranty: true,
  });

  const extractJsonArray = (val: unknown): string[] =>
    Array.isArray(val) ? val.filter((v): v is string => typeof v === 'string') : [];

  const specFilters = {
    mouseConnection: unique(specs.flatMap((s: any) => extractJsonArray(s.mouseConnection))),
    mouseSensor: unique(specs.map((s: any) => s.mouseSensor)).sort(),
    mousePollingRate: unique(specs.flatMap((s: any) => extractJsonArray(s.mousePollingRate))),
    mouseWeight: unique(specs.map((s: any) => String(s.mouseWeight))).sort(),
    mouseShape: unique(specs.map((s: any) => s.mouseShape)).sort(),
    mouseHandOrientation: unique(specs.map((s: any) => s.mouseHandOrientation)).sort(),
    mouseSize: unique(specs.map((s: any) => s.mouseSize)).sort(),
    mouseSwitches: unique(specs.map((s: any) => s.mouseSwitches)).sort(),
    mouseEncoder: unique(specs.map((s: any) => s.mouseEncoder)).sort(),
    mouseScrollWheel: unique(specs.map((s: any) => s.mouseScrollWheel)).sort(),
    mouseChargingPort: unique(specs.map((s: any) => s.mouseChargingPort)).sort(),
    mouseFeet: unique(specs.map((s: any) => s.mouseFeet)).sort(),
    mouseRgb: [true, false],
    mouseSoftwareRequired: [true, false],
    mouseOnboardMemory: [true, false],
    mouseShellMaterial: unique(specs.map((s: any) => s.mouseShellMaterial)).sort(),
    mouseGripType: unique(specs.flatMap((s: any) => extractJsonArray(s.mouseGripType))),
    mouseColor: unique(specs.map((s: any) => s.mouseColor)).sort(),
    mouseCompatibility: unique(specs.flatMap((s: any) => extractJsonArray(s.mouseCompatibility))),
    mouseAccessories: unique(specs.flatMap((s: any) => extractJsonArray(s.mouseAccessories))),
    mouseWarranty: unique(specs.map((s: any) => s.mouseWarranty)).sort(),
    mouseLod: unique(specs.map((s: any) => s.mouseLod)).sort(),
  };

  const brands = unique(brandRows.map((r) => r.brand?.name)).sort();
  const vendors = unique(vendorRows.map((r) => r.vendor?.name)).sort();
  const priceMin = Number(priceRow._min.totalPrice ?? 0);
  const priceMax = Number(priceRow._max.totalPrice ?? 0);

  return NextResponse.json({ brands, vendors, specs: specFilters, priceMin, priceMax });
}
