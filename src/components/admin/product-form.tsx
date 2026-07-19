'use client';

import { useState } from 'react';
import { ProductEditor } from './product-editor';
import { VendorCards } from './vendor-cards';

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
  vendors?: VendorOption[];
  existingVendorProducts?: ExistingVendorProduct[];
  fixedProductType?: string;
}

export function ProductForm({ product, brands, vendors = [], existingVendorProducts = [], fixedProductType }: Props) {
  const [images, setImages] = useState<ProductImage[]>([]);

  const productLabel = fixedProductType
    ? fixedProductType.charAt(0).toUpperCase() + fixedProductType.slice(1).replace(/s$/, '')
    : 'Product';

  return (
    <ProductEditor
      product={product}
      brands={brands}
      productType={fixedProductType || product?.productType || 'product'}
      productLabel={productLabel}
      productIcon="📦"
      images={images}
      onImagesChange={setImages}
      vendorContent={product?.id && vendors.length > 0 ? (
        <VendorCards
          productId={product.id}
          vendors={vendors}
          existingVendorProducts={existingVendorProducts}
        />
      ) : undefined}
    />
  );
}
