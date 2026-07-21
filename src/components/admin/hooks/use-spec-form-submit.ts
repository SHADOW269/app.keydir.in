'use client';

import { useRef } from 'react';
import { saveVendorEntries } from '@/lib/admin/vendor-batch-save';
import type { ExistingVendorProduct } from '../vendor-types';
import type { VendorCardsHandle } from '../vendor-cards';

interface SpecFieldConfig {
  jsonFields?: string[];
  boolFields?: string[];
  intFields?: string[];
  floatFields?: string[];
  nullableStringFields?: string[];
}

function parseSpecFormData(fd: FormData, config: SpecFieldConfig): Record<string, unknown> {
  const specData: Record<string, unknown> = {};
  const { jsonFields = [], boolFields = [], intFields = [], floatFields = [], nullableStringFields = [] } = config;

  for (const [key, val] of fd.entries()) {
    if (key === 'colors') {
      specData[key] = (val as string).split('\n').map((l) => l.trim()).filter(Boolean);
    } else if (jsonFields.includes(key)) {
      try { specData[key] = JSON.parse(val as string); } catch { specData[key] = []; }
    } else if (boolFields.includes(key)) {
      specData[key] = val === 'true';
    } else if (intFields.includes(key)) {
      specData[key] = val ? parseInt(val as string) : null;
    } else if (floatFields.includes(key)) {
      specData[key] = val ? parseFloat(val as string) : null;
    } else if (nullableStringFields.includes(key)) {
      specData[key] = val || null;
    }
  }

  return specData;
}

export function useSpecFormSubmit(
  upsertFn: (productId: string, specData: Record<string, unknown>) => Promise<unknown>,
  fieldConfig: SpecFieldConfig,
  existingVendorProducts: ExistingVendorProduct[],
) {
  const vendorCardsRef = useRef<VendorCardsHandle>(null);

  async function handleSubmit(productId: string) {
    const form = document.getElementById('pe-editor-form') as HTMLFormElement;
    if (!form) return;
    const fd = new FormData(form);
    const specData = parseSpecFormData(fd, fieldConfig);
    await upsertFn(productId, specData);
    await saveVendorEntries(productId, vendorCardsRef.current?.getEntries() || [], existingVendorProducts);
  }

  return { vendorCardsRef, handleSubmit, parseSpecFormData };
}
