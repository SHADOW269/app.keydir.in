'use client';

import { useState } from 'react';
import { ProductEditor } from './product-editor';
import { VendorCards } from './vendor-cards';
import type { Brand, Product, ProductImage, VendorOption } from '@/lib/admin/spec-types';
import type { ExistingVendorProduct } from './vendor-types';

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
