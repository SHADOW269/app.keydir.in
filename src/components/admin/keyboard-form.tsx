'use client';

import { useState, useRef } from 'react';
import { ProductEditor } from './product-editor';
import { KeyboardSpecForm } from './keyboard-spec-form';
import { VendorCards, type VendorCardsHandle } from './vendor-cards';
import { upsertKeyboardSpec } from '@/lib/admin/spec-actions';
import { saveVendorEntries } from '@/lib/admin/vendor-batch-save';
import type { ExistingVendorProduct } from './vendor-types';
import type { Brand, Product, ProductImage } from '@/lib/admin/spec-types';

interface KeyboardSpecData {
  layout?: string | null; keyboardStyle?: string[] | null; caseMaterial?: string | null;
  surfaceFinish?: string[] | null; colors?: string[] | null; weight?: number | null; lengthMm?: number | null;
  widthMm?: number | null; heightMm?: number | null; typingAngle?: number | null;
  mountingStyle?: string[] | null; plateMaterial?: string[] | null; stabilizerCompat?: string[] | null;
  stabilizerLayout?: string[] | null; foamMaterial?: string[] | null; foamPlacement?: string[] | null; flexCuts?: boolean;
  pcbType?: string[] | null; pcbThickness?: number | null; pollingRate?: number | null;
  nkro?: boolean; batteryCapacity?: number | null;
  connectivity?: string[] | null; detachableCable?: boolean; firmware?: string[] | null;
  lighting?: string | null; ledOrientation?: string | null; perKeyRgb?: boolean;
  switchesIncluded?: boolean; switchCompat?: string[] | null; switchType?: string[] | null;
  factoryLubed?: boolean; handLubed?: boolean; factoryFilmed?: boolean; breakInProgress?: boolean;
  switchBrand?: string[] | null; switchModel?: string[] | null;
  switchOpForce?: number | null; switchBottomOut?: number | null; switchPreTravel?: number | null;
  switchTotalTravel?: number | null; switchSpringWeight?: number | null; switchSpringLength?: number | null;
  switchRatedLifetime?: number | null;
  switchStemMaterial?: string | null; switchTopHousing?: string | null; switchBottomHousing?: string | null;
  switchSpringType?: string | null;
  switchLongPole?: boolean; switchLedDiffuser?: boolean; switchDustproofStem?: boolean; switchLightPipe?: boolean;
  keycapMaterial?: string[] | null; keycapProfile?: string | null;
  keycapLegendType?: string[] | null; keycapLegendPlacement?: string[] | null;
  keycapsIncluded?: boolean;
  includedAccessories?: string[] | null; additionalAccessories?: string | null;
  specialFeatures?: string | null;
}

interface Props {
  product?: Product; keyboardSpec?: KeyboardSpecData | null;
  brands: Brand[]; vendors: { id: string; name: string }[];
  existingVendorProducts?: ExistingVendorProduct[]; fixedProductType?: string;
}

export function KeyboardForm({
  product, keyboardSpec, brands, vendors,
  existingVendorProducts = [], fixedProductType,
}: Props) {
  const vendorCardsRef = useRef<VendorCardsHandle>(null);
  const [images, setImages] = useState<ProductImage[]>(
    product?.image ? [{ url: product.image, sortOrder: 0, isPrimary: true }] : []
  );

  const productType = fixedProductType || product?.productType || 'keyboards';

  async function handleFormSubmit(_formData: FormData, productId?: string) {
    const id = productId || product?.id;
    if (!id) return;

    const form = document.getElementById('pe-editor-form') as HTMLFormElement;
    if (!form) return;
    const fd = new FormData(form);

    const specData: Record<string, unknown> = {};
    const jsonFields = ['keyboardStyle', 'surfaceFinish', 'mountingStyle', 'plateMaterial', 'stabilizerCompat', 'stabilizerLayout', 'foamMaterial', 'foamPlacement', 'pcbType', 'connectivity', 'firmware', 'switchCompat', 'switchType', 'switchBrand', 'switchModel', 'keycapMaterial', 'keycapLegendType', 'keycapLegendPlacement', 'includedAccessories'];
    const boolFields = ['flexCuts', 'nkro', 'detachableCable', 'perKeyRgb', 'switchesIncluded', 'factoryLubed', 'handLubed', 'factoryFilmed', 'breakInProgress', 'keycapsIncluded', 'switchLongPole', 'switchLedDiffuser', 'switchDustproofStem', 'switchLightPipe'];
    const intFields = ['weight', 'lengthMm', 'widthMm', 'heightMm', 'typingAngle', 'pollingRate', 'batteryCapacity', 'switchRatedLifetime'];
    const floatFields = ['pcbThickness', 'switchOpForce', 'switchBottomOut', 'switchPreTravel', 'switchTotalTravel', 'switchSpringWeight', 'switchSpringLength'];
    const nullableStringFields = ['layout', 'caseMaterial', 'lighting', 'ledOrientation', 'switchStemMaterial', 'switchTopHousing', 'switchBottomHousing', 'switchSpringType', 'keycapProfile', 'additionalAccessories', 'specialFeatures'];

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

    await upsertKeyboardSpec(id, specData);
    await saveVendorEntries(id, vendorCardsRef.current?.getEntries() || [], existingVendorProducts);
  }

  function handleImageUpload(file: File) {
    const fd = new FormData(); fd.append('file', file); fd.append('dir', 'products');
    fetch('/api/upload', { method: 'POST', body: fd })
      .then((r) => r.json())
      .then((data) => {
        if (data.url) {
          setImages([{ url: data.url, sortOrder: 0, isPrimary: true }]);
        }
      })
      .catch(() => {});
  }

  return (
    <ProductEditor
      product={product}
      brands={brands}
      productType={productType}
      productLabel="Keyboard"
      productIcon="⌨"
      images={images}
      onImagesChange={setImages}
      onFormSubmit={handleFormSubmit}
      vendorContent={
        product?.id ? (
          <VendorCards
            ref={vendorCardsRef}
            productId={product.id}
            vendors={vendors}
            existingVendorProducts={existingVendorProducts}
            onChange={() => {}}
          />
        ) : undefined
      }
      renderForm={() => (
        <KeyboardSpecForm spec={keyboardSpec} onChange={() => {}} onImageUpload={handleImageUpload} />
      )}
    />
  );
}
