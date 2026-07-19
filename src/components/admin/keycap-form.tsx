'use client';

import { useState, useRef } from 'react';
import { ProductEditor } from './product-editor';
import { KeycapSpecForm } from './keycap-spec-form';
import { VendorCards, type VendorCardsHandle } from './vendor-cards';
import { upsertKeycapSpec, deleteVendorProduct, createVendorProduct, upsertVendorVariants } from '@/lib/admin/actions';

interface Brand { id: string; name: string; }
interface VendorOption { id: string; name: string; }
interface Product {
  id: string;
  name: string;
  slug: string;
  brandId: string | null;
  productType: string;
  image: string | null;
  description: string | null;
  longDescription?: string | null;
  sku?: string | null;
  releaseDate?: string | null;
  status?: string;
  featured?: boolean;
  metaTitle?: string | null;
  metaDescription?: string | null;
  ogImage?: string | null;
  createdAt?: Date;
}
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
interface ProductImage {
  id?: string;
  url: string;
  alt?: string;
  sortOrder: number;
  isPrimary: boolean;
}

interface ExistingVendorProduct {
  id: string; vendorId: string; vendorUrl: string; shippingCost: number;
  affiliateLink: string | null; price: number; stockStatus: string;
  lastCheckedAt: Date | null; manualUpdatedAt: Date | null;
  source: string; availability: string; scrapeStatus: string;
  scrapeError: string | null; lastSuccessfulAt: Date | null;
  scraperVersion: string | null; lastHttpStatus: number | null;
  responseTimeMs: number | null; manualOverride: boolean;
  updatedBy: string | null;
}

interface Props {
  product?: Product;
  brands: Brand[];
  vendors: VendorOption[];
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

    // Batch-save vendor entries
    const vendorEntries = vendorCardsRef.current?.getEntries() || [];
    const validEntries = vendorEntries.filter((ve) => ve.vendorId && ve.vendorUrl);

    // Delete removed vendors
    for (const vp of existingVendorProducts) {
      if (!validEntries.some((ve) => ve.id === vp.id)) {
        await deleteVendorProduct(vp.id);
      }
    }

    // Upsert remaining vendors
    for (const entry of validEntries) {
      const vfd = new FormData();
      vfd.set('vendorId', entry.vendorId);
      vfd.set('productId', product.id);
      vfd.set('vendorUrl', entry.vendorUrl);
      vfd.set('price', String(entry.price || 0));
      vfd.set('shippingCost', String(entry.shippingCost || 0));
      vfd.set('shippingIncluded', entry.shippingCost === 0 ? 'on' : '');
      vfd.set('stockStatus', entry.stockStatus || 'in_stock');
      vfd.set('affiliateLink', entry.affiliateLink);
      const result = await createVendorProduct(vfd);
      if (result && 'id' in result && entry.variants.length > 0) {
        await upsertVendorVariants(result.id as string, entry.variants);
      }
    }
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
