'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { slugify } from '@/lib/utils';

// ═══ FORM PARSERS ═══

function parseProductForm(formData: FormData) {
  const name = formData.get('name') as string;
  const brandId = (formData.get('brandId') as string) || null;
  const productType = (formData.get('productType') as string) || 'keyboards';
  const image = (formData.get('image') as string) || null;
  const imagePublicId = (formData.get('imagePublicId') as string) || null;
  const description = (formData.get('description') as string) || null;
  const longDescription = (formData.get('longDescription') as string) || null;
  const sku = (formData.get('sku') as string) || null;
  const releaseDate = (formData.get('releaseDate') as string) || null;
  const status = (formData.get('status') as string) || 'active';
  const metaTitle = (formData.get('metaTitle') as string) || null;
  const metaDescription = (formData.get('metaDescription') as string) || null;
  const ogImage = (formData.get('ogImage') as string) || null;
  return { name, brandId, productType, image, imagePublicId, description, longDescription, sku, releaseDate, status, metaTitle, metaDescription, ogImage };
}

function parseBrandForm(formData: FormData) {
  const name = formData.get('name') as string;
  const website = (formData.get('website') as string) || null;
  const country = (formData.get('country') as string) || 'IN';
  const description = (formData.get('description') as string) || null;
  const status = (formData.get('status') as string) || 'active';
  const color = (formData.get('color') as string) || null;
  const logo = (formData.get('logo') as string) || null;
  return { name, website, country, description, status, color, logo };
}

// ═══ PRODUCTS ═══

export async function createProduct(formData: FormData) {
  const { name, brandId, productType, image, imagePublicId, description, longDescription, sku, releaseDate, status, metaTitle, metaDescription, ogImage } = parseProductForm(formData);

  if (!name) {
    return { error: 'Name is required' };
  }

  const slug = slugify(name);
  const existing = await prisma.product.findUnique({ where: { slug } });
  if (existing) {
    return { error: 'A product with this name already exists' };
  }

  const product = await prisma.product.create({
    data: {
      name, slug, brandId, productType, image, imagePublicId, description,
      longDescription, sku, status, metaTitle, metaDescription, ogImage,
      releaseDate: releaseDate ? new Date(releaseDate) : null,
    },
  });

  return { id: product.id };
}

export async function updateProduct(id: string, formData: FormData) {
  const { name, brandId, productType, image, imagePublicId, description, longDescription, sku, releaseDate, status, metaTitle, metaDescription, ogImage } = parseProductForm(formData);

  if (!name) {
    return { error: 'Name is required' };
  }

  const slug = slugify(name);
  const existing = await prisma.product.findFirst({ where: { slug, NOT: { id } } });
  if (existing) {
    return { error: 'A product with this name already exists' };
  }

  const updated = await prisma.product.update({
    where: { id },
    data: {
      name, slug, brandId, productType, image, imagePublicId, description,
      longDescription, sku, status, metaTitle, metaDescription, ogImage,
      releaseDate: releaseDate ? new Date(releaseDate) : null,
    },
    select: { slug: true },
  });

  revalidatePath('/admin/products');
  revalidatePath(`/admin/products/${id}`);
  revalidatePath(`/products/${updated.slug}`);
  return { ok: true };
}

export async function deleteProduct(id: string, password: string) {
  if (password !== process.env.DELETE_PASSWORD) {
    return { error: 'Incorrect password' };
  }
  await prisma.product.delete({ where: { id } });
  revalidatePath('/admin/products');
  return { ok: true };
}

// ═══ BRANDS ═══

export async function createBrand(formData: FormData) {
  const { name, website, country, description, status, color, logo } = parseBrandForm(formData);

  if (!name) {
    return { error: 'Name is required' };
  }

  const slug = slugify(name);
  const existing = await prisma.brand.findUnique({ where: { slug } });
  if (existing) {
    return { error: 'A brand with this name already exists' };
  }

  await prisma.brand.create({ data: { name, slug, website, country, description, status, color, logo } });
  revalidatePath('/admin/brands');
}

export async function updateBrand(id: string, formData: FormData) {
  const { name, website, country, description, status, color, logo } = parseBrandForm(formData);

  if (!name) {
    return { error: 'Name is required' };
  }

  const slug = slugify(name);
  const existing = await prisma.brand.findFirst({ where: { slug, NOT: { id } } });
  if (existing) {
    return { error: 'A brand with this name already exists' };
  }

  await prisma.brand.update({ where: { id }, data: { name, slug, website, country, description, status, color, logo } });
  revalidatePath('/admin/brands');
}

export async function deleteBrand(id: string, password: string) {
  if (password !== process.env.DELETE_PASSWORD) {
    return { error: 'Incorrect password' };
  }
  await prisma.product.updateMany({ where: { brandId: id }, data: { brandId: null } });
  await prisma.brand.delete({ where: { id } });
  revalidatePath('/admin/brands');
  return { ok: true };
}

// ═══ PRODUCT IMAGES ═══

export async function upsertProductImages(productId: string, images: Array<{ id?: string; url: string; publicId?: string; alt?: string; sortOrder: number; isPrimary: boolean }>) {
  const existingIds = images.filter((img) => img.id).map((img) => img.id!);
  await prisma.productImage.deleteMany({
    where: { productId, id: { notIn: existingIds } },
  });

  for (const img of images) {
    if (img.id) {
      await prisma.productImage.update({
        where: { id: img.id },
        data: { url: img.url, publicId: img.publicId ?? null, alt: img.alt, sortOrder: img.sortOrder, isPrimary: img.isPrimary },
      });
    } else {
      await prisma.productImage.create({
        data: { productId, url: img.url, publicId: img.publicId ?? null, alt: img.alt, sortOrder: img.sortOrder, isPrimary: img.isPrimary },
      });
    }
  }

  const primary = images.find((img) => img.isPrimary);
  if (primary) {
    await prisma.product.update({ where: { id: productId }, data: { image: primary.url, imagePublicId: primary.publicId ?? null } });
  }

  revalidatePath('/admin/products');
  revalidatePath(`/products`);
}
