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

export async function upsertKeyboardSpec(productId: string, data: Record<string, unknown>) {
  const jsonFields = [
    'keyboardStyle', 'mountingStyle', 'plateMaterial', 'stabilizerCompat', 'stabilizerLayout',
    'foamMaterial', 'foamPlacement', 'pcbType', 'connectivity', 'firmware',
    'switchCompat', 'switchType', 'switchBrand', 'switchModel', 'keycapMaterial', 'keycapLegendType', 'keycapLegendPlacement',
    'includedAccessories', 'colors', 'surfaceFinish',
  ];

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

  await prisma.keyboardSpec.upsert({
    where: { productId },
    create: { productId, ...specData },
    update: specData,
  });

  revalidatePath('/admin/products');
}

export async function deleteKeyboardSpec(productId: string) {
  await prisma.keyboardSpec.deleteMany({ where: { productId } });
}

export async function upsertSwitchSpec(productId: string, data: Record<string, unknown>) {
  const jsonFields = [
    'switchCompat', 'switchType', 'switchBrand', 'switchModel',
  ];

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

  await prisma.switchSpec.upsert({
    where: { productId },
    create: { productId, ...specData },
    update: specData,
  });

  revalidatePath('/admin/products');
}

export async function deleteSwitchSpec(productId: string) {
  await prisma.switchSpec.deleteMany({ where: { productId } });
}

export async function upsertKeycapSpec(productId: string, data: Record<string, unknown>) {
  const jsonFields = [
    'keycapProfile', 'keycapLayoutSupport', 'keycapMaterial', 'keycapManufacturing',
    'keycapLegends', 'keycapLegendPlacement', 'keycapLanguage', 'keycapKeyCount', 'keycapStemCompat',
    'keycapManufacturer',
  ];

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

  await prisma.keycapSpec.upsert({
    where: { productId },
    create: { productId, ...specData },
    update: specData,
  });

  revalidatePath('/admin/products');
}

export async function deleteKeycapSpec(productId: string) {
  await prisma.keycapSpec.deleteMany({ where: { productId } });
}

export async function upsertMouseSpec(productId: string, data: Record<string, unknown>) {
  const jsonFields = [
    'mouseConnection', 'mousePollingRate', 'mouseGripType',
    'mouseCompatibility', 'mouseAccessories',
  ];

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

  await prisma.mouseSpec.upsert({
    where: { productId },
    create: { productId, ...specData },
    update: specData,
  });

  revalidatePath('/admin/products');
}

export async function deleteMouseSpec(productId: string) {
  await prisma.mouseSpec.deleteMany({ where: { productId } });
}
