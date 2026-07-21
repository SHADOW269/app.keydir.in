'use client';

import { useState, useRef } from 'react';
import { ProductEditor } from './product-editor';
import { SwitchSpecForm } from './switch-spec-form';
import { VendorCards, type VendorCardsHandle } from './vendor-cards';
import { upsertSwitchSpec } from '@/lib/admin/spec-actions';
import { saveVendorEntries } from '@/lib/admin/vendor-batch-save';
import type { ExistingVendorProduct } from './vendor-types';
import type { Brand, Product, ProductImage } from '@/lib/admin/spec-types';

interface SwitchSpecData {
  factoryLubed?: boolean; handLubed?: boolean; factoryFilmed?: boolean; breakInProgress?: boolean;
  switchCompat?: string[] | null; switchType?: string[] | null;
  switchBrand?: string[] | null; switchModel?: string[] | null;
  switchOpForce?: number | null; switchBottomOut?: number | null;
  switchPreTravel?: number | null; switchTotalTravel?: number | null;
  switchSpringWeight?: number | null; switchSpringLength?: number | null;
  switchRatedLifetime?: number | null;
  switchStemMaterial?: string | null; switchTopHousing?: string | null; switchBottomHousing?: string | null;
  switchSpringType?: string | null;
  switchLongPole?: boolean; switchLedDiffuser?: boolean; switchDustproofStem?: boolean; switchLightPipe?: boolean;
  quantityPerPack?: number | null; packagingType?: string | null;
}

interface Props {
  product?: Product;
  brands: Brand[];
  vendors: { id: string; name: string }[];
  existingVendorProducts: ExistingVendorProduct[];
  switchSpec?: SwitchSpecData | null;
  productImages?: ProductImage[];
}

export function SwitchForm({ product, brands, vendors, existingVendorProducts, switchSpec, productImages = [] }: Props) {
  const [images, setImages] = useState<ProductImage[]>(productImages);
  const [hasChanges, setHasChanges] = useState(false);
  const vendorCardsRef = useRef<VendorCardsHandle>(null);

  async function handleFormSubmit() {
    if (!product?.id) return;
    const form = document.getElementById('pe-editor-form') as HTMLFormElement;
    if (!form) return;
    const fd = new FormData(form);

    const specData: Record<string, unknown> = {};
    const jsonFields = ['switchCompat', 'switchType', 'switchBrand', 'switchModel'];
    const boolFields = ['factoryLubed', 'handLubed', 'factoryFilmed', 'breakInProgress', 'switchLongPole', 'switchLedDiffuser', 'switchDustproofStem', 'switchLightPipe'];
    const floatFields = ['switchOpForce', 'switchBottomOut', 'switchPreTravel', 'switchTotalTravel', 'switchSpringWeight', 'switchSpringLength'];
    const intFields = ['switchRatedLifetime', 'quantityPerPack'];

    for (const [key, val] of fd.entries()) {
      if (jsonFields.includes(key)) {
        try { specData[key] = JSON.parse(val as string); } catch { specData[key] = []; }
      } else if (boolFields.includes(key)) {
        specData[key] = val === 'true';
      } else if (floatFields.includes(key)) {
        specData[key] = val ? parseFloat(val as string) : null;
      } else if (intFields.includes(key)) {
        specData[key] = val ? parseInt(val as string) : null;
      } else if (key === 'switchStemMaterial' || key === 'switchTopHousing' || key === 'switchBottomHousing' || key === 'switchSpringType' || key === 'packagingType') {
        specData[key] = val || null;
      }
    }

    await upsertSwitchSpec(product.id, specData);
    await saveVendorEntries(product.id, vendorCardsRef.current?.getEntries() || [], existingVendorProducts);
  }

  return (
    <ProductEditor
      product={product}
      brands={brands}
      productType="switches"
      productLabel="Switch"
      productIcon="🔘"
      images={images}
      onImagesChange={setImages}
      onFormSubmit={handleFormSubmit}
      specContent={
        <SwitchSpecForm spec={switchSpec} onChange={() => setHasChanges(true)} />
      }
      vendorContent={product?.id ? (
        <VendorCards
          ref={vendorCardsRef}
          productId={product.id}
          vendors={vendors}
          existingVendorProducts={existingVendorProducts}
          onChange={() => setHasChanges(true)}
        />
      ) : undefined}
    />
  );
}
