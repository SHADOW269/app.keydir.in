'use client';

import { ProductEditor } from './product-editor';
import { KeycapSpecForm } from './keycap-spec-form';
import { VendorCards } from './vendor-cards';
import { upsertKeycapSpec } from '@/lib/admin/spec-actions';
import { useSpecFormSubmit } from './hooks/use-spec-form-submit';
import { useProductImages } from './hooks/use-product-images';
import type { ExistingVendorProduct } from './vendor-types';
import type { Brand, Product, KeycapSpecData } from '@/lib/admin/spec-types';

interface Props {
  product?: Product;
  brands: Brand[];
  vendors: { id: string; name: string }[];
  existingVendorProducts?: ExistingVendorProduct[];
  keycapSpec?: KeycapSpecData | null;
  productImages?: { url: string; sortOrder: number; isPrimary: boolean; id?: string; alt?: string }[];
}

export function KeycapForm({ product, brands, vendors, existingVendorProducts = [], keycapSpec, productImages = [] }: Props) {
  const { images, setImages } = useProductImages(productImages);
  const { vendorCardsRef, handleSubmit } = useSpecFormSubmit(
    upsertKeycapSpec,
    {
      jsonFields: ['keycapProfile', 'keycapLayoutSupport', 'keycapMaterial', 'keycapManufacturing', 'keycapLegends', 'keycapLegendPlacement', 'keycapLanguage', 'keycapKeyCount', 'keycapStemCompat', 'keycapManufacturer'],
      boolFields: ['keycapNovelties', 'keycapSpacebars', 'keycapAccentKeys', 'keycapArtisan'],
      nullableStringFields: ['keycapThickness', 'keycapColorway', 'keycapDesigner', 'keycapNotes'],
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
      productType="keycaps"
      productLabel="Keycap"
      productIcon="🎨"
      images={images}
      onImagesChange={setImages}
      onFormSubmit={handleFormSubmit}
      specContent={
        <KeycapSpecForm spec={keycapSpec} onChange={() => {}} />
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
