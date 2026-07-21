'use client';

import { useState, useRef } from 'react';
import { ProductEditor } from './product-editor';
import { MouseSpecForm } from './mouse-spec-form';
import { VendorCards, type VendorCardsHandle } from './vendor-cards';
import { upsertMouseSpec } from '@/lib/admin/spec-actions';
import { saveVendorEntries } from '@/lib/admin/vendor-batch-save';
import type { ExistingVendorProduct } from './vendor-types';
import type { Brand, Product, ProductImage } from '@/lib/admin/spec-types';

interface MouseSpecData {
  mouseConnection?: string[] | null;
  mouseSensor?: string | null;
  mouseDpi?: number | null;
  mousePollingRate?: string[] | null;
  mouseMaxIps?: number | null;
  mouseMaxAccel?: number | null;
  mouseLod?: string | null;
  mouseWeight?: number | null;
  mouseShape?: string | null;
  mouseHandOrientation?: string | null;
  mouseSize?: string | null;
  mouseDimensionsLength?: number | null;
  mouseDimensionsWidth?: number | null;
  mouseDimensionsHeight?: number | null;
  mouseSwitches?: string | null;
  mouseEncoder?: string | null;
  mouseButtons?: number | null;
  mouseSideButtons?: number | null;
  mouseScrollWheel?: string | null;
  mouseBattery?: number | null;
  mouseBatteryLife?: string | null;
  mouseChargingPort?: string | null;
  mouseFeet?: string | null;
  mouseRgb?: boolean;
  mouseSoftwareRequired?: boolean;
  mouseOnboardMemory?: boolean;
  mouseShellMaterial?: string | null;
  mouseGripType?: string[] | null;
  mouseColor?: string | null;
  mouseCompatibility?: string[] | null;
  mouseAccessories?: string[] | null;
  mouseAccessoriesOther?: string | null;
  mouseWarranty?: string | null;
}

interface Props {
  product?: Product;
  brands: Brand[];
  vendors: { id: string; name: string }[];
  existingVendorProducts: ExistingVendorProduct[];
  mouseSpec?: MouseSpecData | null;
  productImages?: ProductImage[];
}

export function MouseForm({ product, brands, vendors, existingVendorProducts, mouseSpec, productImages = [] }: Props) {
  const [images, setImages] = useState<ProductImage[]>(productImages);
  const [hasChanges, setHasChanges] = useState(false);
  const vendorCardsRef = useRef<VendorCardsHandle>(null);

  async function handleFormSubmit() {
    if (!product?.id) return;
    const form = document.getElementById('pe-editor-form') as HTMLFormElement;
    if (!form) return;
    const fd = new FormData(form);

    const specData: Record<string, unknown> = {};
    const jsonFields = ['mouseConnection', 'mousePollingRate', 'mouseGripType', 'mouseCompatibility', 'mouseAccessories'];
    const boolFields = ['mouseRgb', 'mouseSoftwareRequired', 'mouseOnboardMemory'];
    const intFields = ['mouseDpi', 'mouseMaxIps', 'mouseMaxAccel', 'mouseWeight', 'mouseButtons', 'mouseSideButtons', 'mouseBattery', 'mouseDimensionsLength', 'mouseDimensionsWidth', 'mouseDimensionsHeight'];

    for (const [key, val] of fd.entries()) {
      if (jsonFields.includes(key)) {
        try { specData[key] = JSON.parse(val as string); } catch { specData[key] = []; }
      } else if (boolFields.includes(key)) {
        specData[key] = val === 'true';
      } else if (intFields.includes(key)) {
        specData[key] = val ? parseInt(val as string) : null;
      } else if (key === 'mouseSensor' || key === 'mouseShape' || key === 'mouseHandOrientation' || key === 'mouseSize' || key === 'mouseSwitches' || key === 'mouseEncoder' || key === 'mouseScrollWheel' || key === 'mouseChargingPort' || key === 'mouseFeet' || key === 'mouseShellMaterial' || key === 'mouseColor' || key === 'mouseLod' || key === 'mouseBatteryLife' || key === 'mouseAccessoriesOther' || key === 'mouseWarranty') {
        specData[key] = val || null;
      }
    }

    await upsertMouseSpec(product.id, specData);
    await saveVendorEntries(product.id, vendorCardsRef.current?.getEntries() || [], existingVendorProducts);
  }

  return (
    <ProductEditor
      product={product}
      brands={brands}
      productType="mouse"
      productLabel="Mouse"
      productIcon="🖱"
      images={images}
      onImagesChange={setImages}
      onFormSubmit={handleFormSubmit}
      specContent={
        <MouseSpecForm spec={mouseSpec} onChange={() => setHasChanges(true)} />
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
