'use client';

import { ProductEditor } from './product-editor';
import { KeyboardSpecForm } from './keyboard-spec-form';
import { VendorCards } from './vendor-cards';
import { upsertKeyboardSpec } from '@/lib/admin/spec-actions';
import { useSpecFormSubmit } from './hooks/use-spec-form-submit';
import { useProductImages } from './hooks/use-product-images';
import type { ExistingVendorProduct } from './vendor-types';
import type { Brand, Product, KeyboardSpecData } from '@/lib/admin/spec-types';

interface Props {
  product?: Product; keyboardSpec?: KeyboardSpecData | null;
  brands: Brand[]; vendors: { id: string; name: string }[];
  existingVendorProducts?: ExistingVendorProduct[]; fixedProductType?: string;
}

export function KeyboardForm({
  product, keyboardSpec, brands, vendors,
  existingVendorProducts = [], fixedProductType,
}: Props) {
  const { images, setImages, uploadImage } = useProductImages(
    product?.image ? [{ url: product.image, sortOrder: 0, isPrimary: true }] : []
  );
  const { vendorCardsRef, handleSubmit } = useSpecFormSubmit(
    upsertKeyboardSpec,
    {
      jsonFields: ['keyboardStyle', 'surfaceFinish', 'mountingStyle', 'plateMaterial', 'stabilizerCompat', 'stabilizerLayout', 'foamMaterial', 'foamPlacement', 'pcbType', 'connectivity', 'firmware', 'switchCompat', 'switchType', 'switchBrand', 'switchModel', 'keycapMaterial', 'keycapLegendType', 'keycapLegendPlacement', 'includedAccessories'],
      boolFields: ['flexCuts', 'nkro', 'detachableCable', 'perKeyRgb', 'switchesIncluded', 'factoryLubed', 'handLubed', 'factoryFilmed', 'breakInProgress', 'keycapsIncluded', 'switchLongPole', 'switchLedDiffuser', 'switchDustproofStem', 'switchLightPipe'],
      intFields: ['weight', 'lengthMm', 'widthMm', 'heightMm', 'typingAngle', 'pollingRate', 'batteryCapacity', 'switchRatedLifetime'],
      floatFields: ['pcbThickness', 'switchOpForce', 'switchBottomOut', 'switchPreTravel', 'switchTotalTravel', 'switchSpringWeight', 'switchSpringLength'],
      nullableStringFields: ['layout', 'caseMaterial', 'lighting', 'ledOrientation', 'switchStemMaterial', 'switchTopHousing', 'switchBottomHousing', 'switchSpringType', 'keycapProfile', 'additionalAccessories', 'specialFeatures'],
    },
    existingVendorProducts,
  );

  const productType = fixedProductType || product?.productType || 'keyboards';

  async function handleFormSubmit(_formData: FormData, productId?: string) {
    const id = productId || product?.id;
    if (!id) return;
    await handleSubmit(id);
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
        <KeyboardSpecForm spec={keyboardSpec} onChange={() => {}} onImageUpload={uploadImage} />
      )}
    />
  );
}
