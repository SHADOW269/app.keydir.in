'use client';

import { ProductEditor } from './product-editor';
import { MouseSpecForm } from './mouse-spec-form';
import { VendorCards } from './vendor-cards';
import { upsertMouseSpec } from '@/lib/admin/spec-actions';
import { useSpecFormSubmit } from './hooks/use-spec-form-submit';
import { useProductImages } from './hooks/use-product-images';
import type { ExistingVendorProduct } from './vendor-types';
import type { Brand, Product, MouseSpecData } from '@/lib/admin/spec-types';

interface Props {
  product?: Product;
  brands: Brand[];
  vendors: { id: string; name: string }[];
  existingVendorProducts?: ExistingVendorProduct[];
  mouseSpec?: MouseSpecData | null;
  productImages?: { url: string; sortOrder: number; isPrimary: boolean; id?: string; alt?: string }[];
}

export function MouseForm({ product, brands, vendors, existingVendorProducts = [], mouseSpec, productImages = [] }: Props) {
  const { images, setImages } = useProductImages(productImages);
  const { vendorCardsRef, handleSubmit } = useSpecFormSubmit(
    upsertMouseSpec,
    {
      jsonFields: ['mouseConnection', 'mousePollingRate', 'mouseGripType', 'mouseCompatibility', 'mouseAccessories'],
      boolFields: ['mouseRgb', 'mouseSoftwareRequired', 'mouseOnboardMemory'],
      intFields: ['mouseDpi', 'mouseMaxIps', 'mouseMaxAccel', 'mouseWeight', 'mouseButtons', 'mouseSideButtons', 'mouseBattery', 'mouseDimensionsLength', 'mouseDimensionsWidth', 'mouseDimensionsHeight'],
      nullableStringFields: ['mouseSensor', 'mouseShape', 'mouseHandOrientation', 'mouseSize', 'mouseSwitches', 'mouseEncoder', 'mouseScrollWheel', 'mouseChargingPort', 'mouseFeet', 'mouseShellMaterial', 'mouseColor', 'mouseLod', 'mouseBatteryLife', 'mouseAccessoriesOther', 'mouseWarranty'],
    },
    existingVendorProducts,
  );

  async function handleFormSubmit(_formData: FormData, productId?: string) {
    const id = productId || product?.id;
    if (!id) return;
    await handleSubmit(id);
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
        <MouseSpecForm spec={mouseSpec} onChange={() => {}} />
      }
      vendorContent={product?.id ? (
        <VendorCards
          ref={vendorCardsRef}
          productId={product.id}
          vendors={vendors}
          existingVendorProducts={existingVendorProducts}
          onChange={() => {}}
        />
      ) : undefined}
    />
  );
}
