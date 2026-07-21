'use client';

import { useState, useRef } from 'react';
import { ProductEditor } from './product-editor';
import { MouseSpecForm } from './mouse-spec-form';
import { VendorCards, type VendorCardsHandle } from './vendor-cards';
import { upsertMouseSpec, deleteVendorProduct, createVendorProduct, upsertVendorVariants } from '@/lib/admin/actions';

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
      vfd.set('shippingIncluded', entry.shippingIncluded ? 'on' : '');
      vfd.set('stockStatus', entry.stockStatus || 'in_stock');
      vfd.set('affiliateLink', entry.affiliateLink);
      vfd.set('coupons', JSON.stringify(entry.coupons.map(({ collapsed, ...c }) => c)));
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
