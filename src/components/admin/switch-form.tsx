'use client';

import { ProductEditor } from './product-editor';
import { SwitchSpecForm } from './switch-spec-form';
import { VendorCards } from './vendor-cards';
import { upsertSwitchSpec } from '@/lib/admin/spec-actions';
import { useSpecFormSubmit } from './hooks/use-spec-form-submit';
import { useProductImages } from './hooks/use-product-images';
import type { ExistingVendorProduct } from './vendor-types';
import type { Brand, Product, SwitchSpecData } from '@/lib/admin/spec-types';

interface Props {
  product?: Product;
  brands: Brand[];
  vendors: { id: string; name: string }[];
  existingVendorProducts?: ExistingVendorProduct[];
  switchSpec?: SwitchSpecData | null;
  productImages?: { url: string; sortOrder: number; isPrimary: boolean; id?: string; alt?: string }[];
}

export function SwitchForm({ product, brands, vendors, existingVendorProducts = [], switchSpec, productImages = [] }: Props) {
  const { images, setImages } = useProductImages(productImages);
  const { vendorCardsRef, handleSubmit } = useSpecFormSubmit(
    upsertSwitchSpec,
    {
      jsonFields: ['switchCompat', 'switchType', 'switchBrand', 'switchModel'],
      boolFields: ['factoryLubed', 'handLubed', 'factoryFilmed', 'breakInProgress', 'switchLongPole', 'switchLedDiffuser', 'switchDustproofStem', 'switchLightPipe'],
      floatFields: ['switchOpForce', 'switchBottomOut', 'switchPreTravel', 'switchTotalTravel', 'switchSpringWeight', 'switchSpringLength'],
      intFields: ['switchRatedLifetime', 'quantityPerPack'],
      nullableStringFields: ['switchStemMaterial', 'switchTopHousing', 'switchBottomHousing', 'switchSpringType', 'packagingType'],
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
      productType="switches"
      productLabel="Switch"
      productIcon="🔘"
      images={images}
      onImagesChange={setImages}
      onFormSubmit={handleFormSubmit}
      specContent={
        <SwitchSpecForm spec={switchSpec} onChange={() => {}} />
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
