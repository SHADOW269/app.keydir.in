'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';

function parseJsonArray(val: unknown): string[] | undefined {
  if (!val) return undefined;
  const raw = typeof val === 'string' ? val : JSON.stringify(val);
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : undefined;
  } catch { return undefined; }
}

function buildSpecData(data: Record<string, unknown>, jsonFields: string[]): Record<string, unknown> {
  const specData: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(data)) {
    if (jsonFields.includes(key)) {
      specData[key] = parseJsonArray(val) ?? undefined;
    } else if (val === '' || val === null || val === undefined) {
      specData[key] = null;
    } else {
      specData[key] = val;
    }
  }
  return specData;
}

const SPECS = {
  keyboardSpec: {
    model: prisma.keyboardSpec,
    jsonFields: [
      'keyboardStyle', 'mountingStyle', 'plateMaterial', 'stabilizerCompat', 'stabilizerLayout',
      'foamMaterial', 'foamPlacement', 'pcbType', 'connectivity', 'firmware',
      'switchCompat', 'switchType', 'switchBrand', 'switchModel', 'keycapMaterial', 'keycapLegendType', 'keycapLegendPlacement',
      'includedAccessories', 'colors', 'surfaceFinish',
    ],
  },
  switchSpec: {
    model: prisma.switchSpec,
    jsonFields: ['switchCompat', 'switchType', 'switchBrand', 'switchModel'],
  },
  keycapSpec: {
    model: prisma.keycapSpec,
    jsonFields: [
      'keycapProfile', 'keycapLayoutSupport', 'keycapMaterial', 'keycapManufacturing',
      'keycapLegends', 'keycapLegendPlacement', 'keycapLanguage', 'keycapKeyCount', 'keycapStemCompat',
      'keycapManufacturer',
    ],
  },
  mouseSpec: {
    model: prisma.mouseSpec,
    jsonFields: ['mouseConnection', 'mousePollingRate', 'mouseGripType', 'mouseCompatibility', 'mouseAccessories'],
  },
};

type SpecKey = keyof typeof SPECS;

async function upsertSpec(specKey: SpecKey, productId: string, data: Record<string, unknown>) {
  const { model, jsonFields } = SPECS[specKey];
  const specData = buildSpecData(data, jsonFields);
  await (model as any).upsert({
    where: { productId },
    create: { productId, ...specData },
    update: specData,
  });
  revalidatePath('/admin/products');
}

async function deleteSpec(specKey: SpecKey, productId: string) {
  const { model } = SPECS[specKey];
  await (model as any).deleteMany({ where: { productId } });
}

export async function upsertKeyboardSpec(productId: string, data: Record<string, unknown>) {
  return upsertSpec('keyboardSpec', productId, data);
}
export async function deleteKeyboardSpec(productId: string) {
  return deleteSpec('keyboardSpec', productId);
}
export async function upsertSwitchSpec(productId: string, data: Record<string, unknown>) {
  return upsertSpec('switchSpec', productId, data);
}
export async function deleteSwitchSpec(productId: string) {
  return deleteSpec('switchSpec', productId);
}
export async function upsertKeycapSpec(productId: string, data: Record<string, unknown>) {
  return upsertSpec('keycapSpec', productId, data);
}
export async function deleteKeycapSpec(productId: string) {
  return deleteSpec('keycapSpec', productId);
}
export async function upsertMouseSpec(productId: string, data: Record<string, unknown>) {
  return upsertSpec('mouseSpec', productId, data);
}
export async function deleteMouseSpec(productId: string) {
  return deleteSpec('mouseSpec', productId);
}
