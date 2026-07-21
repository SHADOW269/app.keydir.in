export interface Brand {
  id: string;
  name: string;
}

export interface VendorOption {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  brandId: string | null;
  productType: string;
  image: string | null;
  description: string | null;
  longDescription?: string | null;
  sku?: string | null;
  tags?: string[] | null;
  releaseDate?: string | null;
  status?: string;
  featured?: boolean;
  metaTitle?: string | null;
  metaDescription?: string | null;
  ogImage?: string | null;
  createdAt?: string | Date;
}

export interface ProductImage {
  id?: string;
  url: string;
  alt?: string;
  sortOrder: number;
  isPrimary: boolean;
}

export function serializeProduct(product: { releaseDate: Date | null; createdAt: Date; [key: string]: unknown }): Product {
  return {
    ...product,
    releaseDate: product.releaseDate ? product.releaseDate.toISOString().split('T')[0] : null,
    createdAt: product.createdAt,
  } as Product;
}

export function castJsonField<T>(val: unknown): T | null {
  if (val === null || val === undefined) return null;
  return val as T;
}

export function castJsonArray(val: unknown): string[] | null {
  if (val === null || val === undefined) return null;
  return val as string[];
}
