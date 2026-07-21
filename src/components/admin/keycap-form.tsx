'use client';

import { useState, useRef } from 'react';
import { ProductEditor } from './product-editor';
import { KeycapSpecForm } from './keycap-spec-form';
import { VendorCards, type VendorCardsHandle } from './vendor-cards';
import { upsertKeycapSpec } from '@/lib/admin/spec-actions';
import { saveVendorEntries } from '@/lib/admin/vendor-batch-save';
import type { ExistingVendorProduct } from './vendor-types';
import type { Brand, Product, ProductImage } from '@/lib/admin/spec-types';

interface KeycapSpecData {
  keycapProfile?: string[] | null;
  keycapLayoutSupport?: string[] | null;
  keycapMaterial?: string[] | null;
  keycapManufacturing?: string[] | null;
  keycapLegends?: string[] | null;
  keycapLegendPlacement?: string[] | null;
  keycapLanguage?: string[] | null;
  keycapKeyCount?: string[] | null;
  keycapStemCompat?: string[] | null;
  keycapThickness?: string | null;
  keycapColorway?: string | null;
  keycapManufacturer?: string[] | null;
  keycapDesigner?: string | null;
  keycapNovelties?: boolean;
  keycapSpacebars?: boolean;
  keycapAccentKeys?: boolean;
  keycapArtisan?: boolean;
  keycapNotes?: string | null;
}

interface Props {
  product?: Product;
  brands: Brand[];
  vendors: { id: string; name: string }[];
  existingVendorProducts: ExistingVendorProduct[];
  keycapSpec?: KeycapSpecData | null;
  productImages?: ProductImage[];
}

export function KeycapForm({ product, brands, vendors, existingVendorProducts, keycapSpec, productImages = [] }: Props) {
  const [images, setImages] = useState<ProductImage[]>(productImages);
  const [hasChanges, setHasChanges] = useState(false);
  const vendorCardsRef = useRef<VendorCardsHandle>(null);

  async function handleFormSubmit() {
    if (!product?.id) return;
    const form = document.getElementById('pe-editor-form') as HTMLFormElement;
    if (!form) return;
    const fd = new FormData(form);

    const specData: Record<string, unknown> = {};
    const jsonFields = [
      'keycapProfile', 'keycapLayoutSupport', 'keycapMaterial', 'keycapManufacturing',
      'keycapLegends', 'keycapLegendPlacement', 'keycapLanguage', 'keycapKeyCount', 'keycapStemCompat',
      'keycapManufacturer',
    ];
    const boolFields = ['keycapNovelties', 'keycapSpacebars', 'keycapAccentKeys', 'keycapArtisan'];

    for (const [key, val] of fd.entries()) {
      if (jsonFields.includes(key)) {
        try { specData[key] = JSON.parse(val as string); } catch { specData[key] = []; }
      } else if (boolFields.includes(key)) {
        specData[key] = val === 'true';
      } else if (key === 'keycapThickness' || key === 'keycapColorway' || key === 'keycapDesigner' || key === 'keycapNotes') {
        specData[key] = val || null;
      }
    }

    await upsertKeycapSpec(product.id, specData);
    await saveVendorEntries(product.id, vendorCardsRef.current?.getEntries() || [], existingVendorProducts);
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
        <KeycapSpecForm spec={keycapSpec} onChange={() => setHasChanges(true)} />
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
