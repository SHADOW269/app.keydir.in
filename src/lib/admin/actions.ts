'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { slugify } from '@/lib/utils';

// ═══ PRODUCTS ═══

export async function createProduct(formData: FormData) {
  const name = formData.get('name') as string;
  const brandId = (formData.get('brandId') as string) || null;
  const categoryId = formData.get('categoryId') as string;
  const image = (formData.get('image') as string) || null;
  const description = (formData.get('description') as string) || null;

  if (!name || !categoryId) {
    return { error: 'Name and category are required' };
  }

  const slug = slugify(name);
  const existing = await prisma.product.findUnique({ where: { slug } });
  if (existing) {
    return { error: 'A product with this name already exists' };
  }

  await prisma.product.create({
    data: { name, slug, brandId, categoryId, image, description },
  });

  redirect('/admin/products');
}

export async function updateProduct(id: string, formData: FormData) {
  const name = formData.get('name') as string;
  const brandId = (formData.get('brandId') as string) || null;
  const categoryId = formData.get('categoryId') as string;
  const image = (formData.get('image') as string) || null;
  const description = (formData.get('description') as string) || null;

  if (!name || !categoryId) {
    return { error: 'Name and category are required' };
  }

  const slug = slugify(name);
  const existing = await prisma.product.findFirst({ where: { slug, NOT: { id } } });
  if (existing) {
    return { error: 'A product with this name already exists' };
  }

  await prisma.product.update({
    where: { id },
    data: { name, slug, brandId, categoryId, image, description },
  });

  revalidatePath('/admin/products');
  redirect('/admin/products');
}

export async function deleteProduct(id: string) {
  await prisma.product.delete({ where: { id } });
  revalidatePath('/admin/products');
}

// ═══ VENDORS ═══

export async function createVendor(formData: FormData) {
  const name = formData.get('name') as string;
  const website = formData.get('website') as string;
  const affiliateLink = (formData.get('affiliateLink') as string) || null;
  const shippingPolicy = (formData.get('shippingPolicy') as string) || null;
  const enabled = formData.get('enabled') === 'on';

  if (!name || !website) {
    return { error: 'Name and website are required' };
  }

  const slug = slugify(name);
  const existing = await prisma.vendor.findUnique({ where: { slug } });
  if (existing) {
    return { error: 'A vendor with this name already exists' };
  }

  await prisma.vendor.create({
    data: { name, slug, website, affiliateLink, shippingPolicy, enabled },
  });

  redirect('/admin/vendors');
}

export async function updateVendor(id: string, formData: FormData) {
  const name = formData.get('name') as string;
  const website = formData.get('website') as string;
  const affiliateLink = (formData.get('affiliateLink') as string) || null;
  const shippingPolicy = (formData.get('shippingPolicy') as string) || null;
  const enabled = formData.get('enabled') === 'on';

  if (!name || !website) {
    return { error: 'Name and website are required' };
  }

  const slug = slugify(name);
  const existing = await prisma.vendor.findFirst({ where: { slug, NOT: { id } } });
  if (existing) {
    return { error: 'A vendor with this name already exists' };
  }

  await prisma.vendor.update({
    where: { id },
    data: { name, slug, website, affiliateLink, shippingPolicy, enabled },
  });

  revalidatePath('/admin/vendors');
  redirect('/admin/vendors');
}

export async function toggleVendor(id: string, enabled: boolean) {
  await prisma.vendor.update({ where: { id }, data: { enabled } });
  revalidatePath('/admin/vendors');
}

export async function deleteVendor(id: string) {
  await prisma.vendor.delete({ where: { id } });
  revalidatePath('/admin/vendors');
}

// ═══ BRANDS ═══

export async function createBrand(formData: FormData) {
  const name = formData.get('name') as string;
  const website = (formData.get('website') as string) || null;
  const country = (formData.get('country') as string) || 'IN';

  if (!name) {
    return { error: 'Name is required' };
  }

  const slug = slugify(name);
  const existing = await prisma.brand.findUnique({ where: { slug } });
  if (existing) {
    return { error: 'A brand with this name already exists' };
  }

  await prisma.brand.create({ data: { name, slug, website, country } });
  redirect('/admin/brands');
}

export async function updateBrand(id: string, formData: FormData) {
  const name = formData.get('name') as string;
  const website = (formData.get('website') as string) || null;
  const country = (formData.get('country') as string) || 'IN';

  if (!name) {
    return { error: 'Name is required' };
  }

  const slug = slugify(name);
  const existing = await prisma.brand.findFirst({ where: { slug, NOT: { id } } });
  if (existing) {
    return { error: 'A brand with this name already exists' };
  }

  await prisma.brand.update({ where: { id }, data: { name, slug, website, country } });
  revalidatePath('/admin/brands');
  redirect('/admin/brands');
}

export async function deleteBrand(id: string) {
  await prisma.brand.delete({ where: { id } });
  revalidatePath('/admin/brands');
}

// ═══ CATEGORIES ═══

export async function createCategory(formData: FormData) {
  const name = formData.get('name') as string;
  const icon = (formData.get('icon') as string) || null;

  if (!name) {
    return { error: 'Name is required' };
  }

  const slug = slugify(name);
  const existing = await prisma.category.findUnique({ where: { slug } });
  if (existing) {
    return { error: 'A category with this name already exists' };
  }

  await prisma.category.create({ data: { name, slug, icon } });
  redirect('/admin/categories');
}

export async function updateCategory(id: string, formData: FormData) {
  const name = formData.get('name') as string;
  const icon = (formData.get('icon') as string) || null;

  if (!name) {
    return { error: 'Name is required' };
  }

  const slug = slugify(name);
  const existing = await prisma.category.findFirst({ where: { slug, NOT: { id } } });
  if (existing) {
    return { error: 'A category with this name already exists' };
  }

  await prisma.category.update({ where: { id }, data: { name, slug, icon } });
  revalidatePath('/admin/categories');
  redirect('/admin/categories');
}

export async function deleteCategory(id: string) {
  await prisma.category.delete({ where: { id } });
  revalidatePath('/admin/categories');
}

// ═══ VENDOR PRODUCTS (price entries) ═══

export async function createVendorProduct(formData: FormData) {
  const vendorId = formData.get('vendorId') as string;
  const productId = formData.get('productId') as string;
  const vendorUrl = formData.get('vendorUrl') as string;
  const price = parseFloat(formData.get('price') as string);
  const shippingCost = parseFloat(formData.get('shippingCost') as string) || 0;
  const shippingIncluded = formData.get('shippingIncluded') === 'on';
  const stockStatus = formData.get('stockStatus') as string || 'in_stock';

  if (!vendorId || !productId || !vendorUrl || isNaN(price)) {
    return { error: 'Vendor, product, URL, and price are required' };
  }

  const totalPrice = shippingIncluded ? price : price + shippingCost;

  await prisma.vendorProduct.upsert({
    where: { vendorId_productId: { vendorId, productId } },
    create: { vendorId, productId, vendorUrl, price, shippingCost, shippingIncluded, totalPrice, stockStatus },
    update: { vendorUrl, price, shippingCost, shippingIncluded, totalPrice, stockStatus, lastChecked: new Date() },
  });

  revalidatePath('/admin/products');
  redirect(`/admin/products/${productId}`);
}

export async function deleteVendorProduct(id: string) {
  const vp = await prisma.vendorProduct.findUnique({ where: { id }, select: { productId: true } });
  await prisma.vendorProduct.delete({ where: { id } });
  if (vp) revalidatePath(`/admin/products/${vp.productId}`);
}

// ═══ SPECIFICATIONS ═══

export async function upsertSpecifications(productId: string, specs: { specFieldId: string; value: string }[]) {
  for (const spec of specs) {
    const value = spec.value.trim();
    if (!value) {
      await prisma.specification.deleteMany({
        where: { productId, specFieldId: spec.specFieldId },
      });
    } else {
      await prisma.specification.upsert({
        where: { productId_specFieldId: { productId, specFieldId: spec.specFieldId } },
        create: { productId, specFieldId: spec.specFieldId, value },
        update: { value },
      });
    }
  }

  revalidatePath('/admin/products');
}
