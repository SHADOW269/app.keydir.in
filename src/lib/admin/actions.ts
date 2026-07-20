'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { slugify } from '@/lib/utils';
import { getScraper, testScraper } from '@/lib/scraper';

// ═══ PRODUCTS ═══

export async function createProduct(formData: FormData) {
  const name = formData.get('name') as string;
  const brandId = (formData.get('brandId') as string) || null;
  const productType = (formData.get('productType') as string) || 'keyboards';
  const image = (formData.get('image') as string) || null;
  const description = (formData.get('description') as string) || null;
  const longDescription = (formData.get('longDescription') as string) || null;
  const sku = (formData.get('sku') as string) || null;
  const releaseDate = (formData.get('releaseDate') as string) || null;
  const status = (formData.get('status') as string) || 'active';
  const metaTitle = (formData.get('metaTitle') as string) || null;
  const metaDescription = (formData.get('metaDescription') as string) || null;
  const ogImage = (formData.get('ogImage') as string) || null;

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
      name, slug, brandId, productType, image, description,
      longDescription, sku, status, metaTitle, metaDescription, ogImage,
      releaseDate: releaseDate ? new Date(releaseDate) : null,
    },
  });

  return { id: product.id };
}

export async function updateProduct(id: string, formData: FormData) {
  const name = formData.get('name') as string;
  const brandId = (formData.get('brandId') as string) || null;
  const productType = (formData.get('productType') as string) || 'keyboards';
  const image = (formData.get('image') as string) || null;
  const description = (formData.get('description') as string) || null;
  const longDescription = (formData.get('longDescription') as string) || null;
  const sku = (formData.get('sku') as string) || null;
  const releaseDate = (formData.get('releaseDate') as string) || null;
  const status = (formData.get('status') as string) || 'active';
  const metaTitle = (formData.get('metaTitle') as string) || null;
  const metaDescription = (formData.get('metaDescription') as string) || null;
  const ogImage = (formData.get('ogImage') as string) || null;

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
      name, slug, brandId, productType, image, description,
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

// ═══ VENDORS ═══

export async function createVendor(formData: FormData) {
  const name = formData.get('name') as string;
  const website = formData.get('website') as string;
  const affiliateLink = (formData.get('affiliateLink') as string) || null;
  const shippingPolicy = (formData.get('shippingPolicy') as string) || null;
  const chartColor = (formData.get('chartColor') as string) || null;
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
    data: { name, slug, website, affiliateLink, shippingPolicy, chartColor, enabled },
  });

  redirect('/admin/vendors');
}

export async function updateVendor(id: string, formData: FormData) {
  const name = formData.get('name') as string;
  const website = formData.get('website') as string;
  const affiliateLink = (formData.get('affiliateLink') as string) || null;
  const shippingPolicy = (formData.get('shippingPolicy') as string) || null;
  const chartColor = (formData.get('chartColor') as string) || null;
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
    data: { name, slug, website, affiliateLink, shippingPolicy, chartColor, enabled },
  });

  revalidatePath('/admin/vendors');
  redirect('/admin/vendors');
}

export async function updateVendorScraperConfig(id: string, formData: FormData) {
  // Build a partial update — only include fields actually present in FormData.
  // This prevents one tab from clobbering values set by another tab.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: Record<string, any> = {};

  // String fields: only update if key exists in FormData
  const stringFields = [
    'scraperEngine', 'priceSelector', 'availabilitySelector', 'titleSelector',
    'imageSelector', 'productExistsSelector', 'priceAttribute', 'availabilityAttribute',
    'titleAttribute', 'imageAttribute', 'customHeaders', 'customScraper', 'scraperNotes',
  ] as const;

  for (const field of stringFields) {
    if (formData.has(field)) {
      const raw = (formData.get(field) as string) || null;
      data[field] = raw;
    }
  }

  // Boolean fields: only update if key exists in FormData.
  // A checkbox not present in FormData means "unchanged", not "false".
  const booleanFields = ['scraperEnabled', 'cloudflareProtected', 'useJavaScriptRendering'] as const;

  for (const field of booleanFields) {
    if (formData.has(field)) {
      data[field] = formData.get(field) === 'on';
    }
  }

  // Validate customHeaders is valid JSON if provided
  if (data.customHeaders) {
    try {
      JSON.parse(data.customHeaders);
    } catch {
      return { error: 'Custom Headers must be valid JSON' };
    }
  }

  // Only proceed if there's something to update
  if (Object.keys(data).length === 0) {
    return { ok: true };
  }

  // Bump version when config changes
  const vendor = await prisma.vendor.findUnique({ where: { id }, select: { scraperVersion: true } });
  data.scraperVersion = (vendor?.scraperVersion || 0) + 1;

  await prisma.vendor.update({ where: { id }, data });

  revalidatePath('/admin/vendors');
  revalidatePath('/admin/scraper');
  return { ok: true };
}

export async function toggleVendor(id: string, enabled: boolean) {
  await prisma.vendor.update({ where: { id }, data: { enabled } });
  revalidatePath('/admin/vendors');
}

export async function deleteVendor(id: string, password: string) {
  if (password !== process.env.DELETE_PASSWORD) {
    return { error: 'Incorrect password' };
  }
  await prisma.vendorProduct.deleteMany({ where: { vendorId: id } });
  await prisma.vendor.delete({ where: { id } });
  revalidatePath('/admin/vendors');
  return { ok: true };
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

export async function deleteBrand(id: string, password: string) {
  if (password !== process.env.DELETE_PASSWORD) {
    return { error: 'Incorrect password' };
  }
  await prisma.product.updateMany({ where: { brandId: id }, data: { brandId: null } });
  await prisma.brand.delete({ where: { id } });
  revalidatePath('/admin/brands');
  return { ok: true };
}

// ═══ VENDOR PRODUCTS (price entries) ═══

export async function createVendorProduct(formData: FormData) {
  const vendorId = formData.get('vendorId') as string;
  const productId = formData.get('productId') as string;
  const vendorUrl = formData.get('vendorUrl') as string;
  const price = parseInt(formData.get('price') as string) || 0;
  const shippingCost = parseInt(formData.get('shippingCost') as string) || 0;
  const shippingIncluded = formData.get('shippingIncluded') === 'on';
  const stockStatus = formData.get('stockStatus') as string || 'in_stock';
  const affiliateLink = (formData.get('affiliateLink') as string) || null;

  if (!vendorId || !productId || !vendorUrl) {
    return { error: 'Vendor, product, and URL are required' };
  }

  const totalPrice = shippingIncluded ? price : price + shippingCost;
  const availability = legacyToAvailability(stockStatus);

  const vp = await prisma.vendorProduct.upsert({
    where: { vendorId_productId: { vendorId, productId } },
    create: {
      vendorId, productId, vendorUrl, price, shippingCost, shippingIncluded,
      totalPrice, stockStatus, affiliateLink, source: 'manual',
      availability, scrapeStatus: 'PENDING',
    },
    update: {
      vendorUrl, price, shippingCost, shippingIncluded, totalPrice,
      stockStatus, affiliateLink, lastCheckedAt: new Date(),
      availability, source: 'manual',
    },
  });

  await prisma.priceHistory.create({
    data: {
      vendorProductId: vp.id, price, shippingCost, totalPrice,
      stockStatus, availability, source: 'MANUAL',
    },
  });

  revalidatePath('/admin/products');
  return { ok: true, id: vp.id };
}

export async function updateVendorStatus(formData: FormData) {
  const vendorProductId = formData.get('vendorProductId') as string;
  const price = parseInt(formData.get('price') as string);
  const stockStatus = formData.get('stockStatus') as string || 'in_stock';
  const shippingCost = parseInt(formData.get('shippingCost') as string) || 0;
  const shippingIncluded = formData.get('shippingIncluded') === 'on';

  if (!vendorProductId || isNaN(price)) {
    return { error: 'Vendor product ID and price are required' };
  }

  const vp = await prisma.vendorProduct.findUnique({ where: { id: vendorProductId }, select: { productId: true } });
  if (!vp) return { error: 'Vendor product not found' };

  const totalPrice = shippingIncluded ? price : price + shippingCost;
  const availability = legacyToAvailability(stockStatus);

  let username = 'admin';
  try {
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const profile = await prisma.profile.findUnique({ where: { userId: user.id }, select: { username: true } });
      if (profile) username = profile.username;
    }
  } catch {}

  await prisma.vendorProduct.update({
    where: { id: vendorProductId },
    data: {
      price, stockStatus, shippingCost, shippingIncluded, totalPrice,
      availability,
      manualOverride: true,
      manualUpdatedAt: new Date(),
      lastCheckedAt: new Date(),
      updatedBy: username,
      manualUpdatedById: username,
      source: 'manual',
      scrapeStatus: 'MANUAL_OVERRIDE',
    },
  });

  await prisma.priceHistory.create({
    data: {
      vendorProductId, price, shippingCost, totalPrice,
      stockStatus, availability, source: 'MANUAL',
    },
  });

  revalidatePath('/admin/products');
  revalidatePath(`/products/${vp.productId}`);
  return { ok: true };
}

export async function checkVendorProduct(vendorProductId: string) {
  const vp = await prisma.vendorProduct.findUnique({
    where: { id: vendorProductId },
    select: {
      vendorUrl: true, price: true, stockStatus: true,
      lastCheckedAt: true, availability: true,
      vendor: { select: { id: true, slug: true, name: true, scraperEnabled: true } },
    },
  });
  if (!vp) return { error: 'Vendor product not found' };

  if (!vp.vendor.scraperEnabled) {
    return {
      ok: false,
      url: vp.vendorUrl,
      currentPrice: vp.price,
      currentStatus: vp.stockStatus,
      lastChecked: vp.lastCheckedAt?.toISOString() || null,
      scrapedPrice: null,
      scrapedStatus: 'unknown',
      message: `No scraper configured for ${vp.vendor.name}. Enable it in vendor settings.`,
    };
  }

  const entry = await getScraper(vp.vendor.slug);
  if (!entry) {
    return {
      ok: false,
      url: vp.vendorUrl,
      currentPrice: vp.price,
      currentStatus: vp.stockStatus,
      lastChecked: vp.lastCheckedAt?.toISOString() || null,
      scrapedPrice: null,
      scrapedStatus: 'unknown',
      message: `No scraper configured for ${vp.vendor.slug}. Manual entry required.`,
    };
  }

  try {
    const result = await entry.scraper(vp.vendorUrl);

    if (!result.success || result.price == null) {
      return {
        ok: false,
        url: vp.vendorUrl,
        currentPrice: vp.price,
        currentStatus: vp.stockStatus,
        lastChecked: vp.lastCheckedAt?.toISOString() || null,
        scrapedPrice: null,
        scrapedStatus: 'unknown',
        message: `Scrape failed: ${result.error}`,
      };
    }

    return {
      ok: true,
      url: vp.vendorUrl,
      currentPrice: vp.price,
      currentStatus: vp.stockStatus,
      lastChecked: vp.lastCheckedAt?.toISOString() || null,
      scrapedPrice: result.price,
      scrapedAvailability: result.availability,
      scraperVersion: entry.version,
      message: `Found ₹${result.price.toLocaleString('en-IN')} (${result.availability})`,
    };
  } catch (e) {
    return {
      ok: false,
      message: `Network error: ${e instanceof Error ? e.message : 'Unknown error'}`,
      currentPrice: vp.price,
      currentStatus: vp.stockStatus,
    };
  }
}

export async function deleteVendorProduct(id: string) {
  const vp = await prisma.vendorProduct.findUnique({ where: { id }, select: { productId: true } });
  await prisma.vendorProduct.delete({ where: { id } });
  if (vp) revalidatePath(`/admin/products/${vp.productId}`);
}

// ═══ VENDOR VARIANTS ═══

export async function upsertVendorVariants(vendorProductId: string, variants: Array<{
  id?: string; name: string; color: string[]; switches: string[]; keycaps: string[];
  price: number; stockStatus: string; variantUrl: string; sku: string; isDefault: boolean;
}>) {
  const vp = await prisma.vendorProduct.findUnique({ where: { id: vendorProductId }, select: { productId: true } });
  if (!vp) return { error: 'Vendor product not found' };

  const existing = await prisma.vendorVariant.findMany({ where: { vendorProductId }, select: { id: true } });
  const existingIds = new Set(existing.map((v) => v.id));
  const incomingIds = new Set(variants.filter((v) => v.id).map((v) => v.id!));

  for (const v of variants) {
    const availability = legacyToAvailability(v.stockStatus);
    const data = {
      name: v.name,
      color: v.color.length ? v.color : undefined,
      switches: v.switches.length ? v.switches : undefined,
      keycaps: v.keycaps.length ? v.keycaps : undefined,
      price: v.price,
      availability,
      stockStatus: v.stockStatus,
      variantUrl: v.variantUrl || null,
      sku: v.sku || null,
      isDefault: v.isDefault,
    };

    if (v.id && existingIds.has(v.id)) {
      await prisma.vendorVariant.update({ where: { id: v.id }, data });
    } else {
      await prisma.vendorVariant.create({ data: { vendorProductId, ...data } });
    }
  }

  for (const id of existingIds) {
    if (!incomingIds.has(id)) {
      await prisma.vendorVariant.delete({ where: { id } });
    }
  }

  revalidatePath(`/admin/products/${vp.productId}`);
  return { ok: true };
}

export async function deleteVendorVariant(id: string) {
  const v = await prisma.vendorVariant.findUnique({ where: { id }, select: { vendorProduct: { select: { productId: true } } } });
  await prisma.vendorVariant.delete({ where: { id } });
  if (v) revalidatePath(`/admin/products/${v.vendorProduct.productId}`);
}

// ═══ KEYBOARD SPECS ═══

function parseJsonArray(val: unknown): string[] | undefined {
  if (!val) return undefined;
  const raw = typeof val === 'string' ? val : JSON.stringify(val);
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : undefined;
  } catch { return undefined; }
}

export async function upsertKeyboardSpec(productId: string, data: Record<string, unknown>) {
  const jsonFields = [
    'keyboardStyle', 'mountingStyle', 'plateMaterial', 'stabilizerCompat', 'stabilizerLayout',
    'foamMaterial', 'foamPlacement', 'pcbType', 'connectivity', 'firmware',
    'switchCompat', 'switchType', 'switchBrand', 'switchModel', 'keycapMaterial', 'keycapLegendType', 'keycapLegendPlacement',
    'includedAccessories', 'colors', 'surfaceFinish',
  ];

  const specData: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(data)) {
    if (jsonFields.includes(key)) {
      specData[key] = parseJsonArray(val) ?? undefined;
    } else if (val === '' || val === null || val === undefined) {
      specData[key] = null;
    } else {
      specData[key] = val;
    }
  }

  await prisma.keyboardSpec.upsert({
    where: { productId },
    create: { productId, ...specData },
    update: specData,
  });

  revalidatePath('/admin/products');
}

export async function deleteKeyboardSpec(productId: string) {
  await prisma.keyboardSpec.deleteMany({ where: { productId } });
}

// ═══ SWITCH SPEC ACTIONS ═══

export async function upsertSwitchSpec(productId: string, data: Record<string, unknown>) {
  const jsonFields = [
    'switchCompat', 'switchType', 'switchBrand', 'switchModel',
  ];

  const specData: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(data)) {
    if (jsonFields.includes(key)) {
      specData[key] = parseJsonArray(val) ?? undefined;
    } else if (val === '' || val === null || val === undefined) {
      specData[key] = null;
    } else {
      specData[key] = val;
    }
  }

  await prisma.switchSpec.upsert({
    where: { productId },
    create: { productId, ...specData },
    update: specData,
  });

  revalidatePath('/admin/products');
}

export async function deleteSwitchSpec(productId: string) {
  await prisma.switchSpec.deleteMany({ where: { productId } });
}

export async function upsertKeycapSpec(productId: string, data: Record<string, unknown>) {
  const jsonFields = [
    'keycapProfile', 'keycapLayoutSupport', 'keycapMaterial', 'keycapManufacturing',
    'keycapLegends', 'keycapLegendPlacement', 'keycapLanguage', 'keycapKeyCount', 'keycapStemCompat',
    'keycapManufacturer',
  ];

  const specData: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(data)) {
    if (jsonFields.includes(key)) {
      specData[key] = parseJsonArray(val) ?? undefined;
    } else if (val === '' || val === null || val === undefined) {
      specData[key] = null;
    } else {
      specData[key] = val;
    }
  }

  await prisma.keycapSpec.upsert({
    where: { productId },
    create: { productId, ...specData },
    update: specData,
  });

  revalidatePath('/admin/products');
}

export async function deleteKeycapSpec(productId: string) {
  await prisma.keycapSpec.deleteMany({ where: { productId } });
}

export async function upsertMouseSpec(productId: string, data: Record<string, unknown>) {
  const jsonFields = [
    'mouseConnection', 'mousePollingRate', 'mouseGripType',
    'mouseCompatibility', 'mouseAccessories',
  ];

  const specData: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(data)) {
    if (jsonFields.includes(key)) {
      specData[key] = parseJsonArray(val) ?? undefined;
    } else if (val === '' || val === null || val === undefined) {
      specData[key] = null;
    } else {
      specData[key] = val;
    }
  }

  await prisma.mouseSpec.upsert({
    where: { productId },
    create: { productId, ...specData },
    update: specData,
  });

  revalidatePath('/admin/products');
}

export async function deleteMouseSpec(productId: string) {
  await prisma.mouseSpec.deleteMany({ where: { productId } });
}

// ═══ PRODUCT IMAGE ACTIONS ═══

export async function upsertProductImages(productId: string, images: Array<{ id?: string; url: string; alt?: string; sortOrder: number; isPrimary: boolean }>) {
  // Delete existing images not in the new list
  const existingIds = images.filter((img) => img.id).map((img) => img.id!);
  await prisma.productImage.deleteMany({
    where: { productId, id: { notIn: existingIds } },
  });

  // Upsert each image
  for (const img of images) {
    if (img.id) {
      await prisma.productImage.update({
        where: { id: img.id },
        data: { url: img.url, alt: img.alt, sortOrder: img.sortOrder, isPrimary: img.isPrimary },
      });
    } else {
      await prisma.productImage.create({
        data: { productId, url: img.url, alt: img.alt, sortOrder: img.sortOrder, isPrimary: img.isPrimary },
      });
    }
  }

  // Sync primary image to Product.image
  const primary = images.find((img) => img.isPrimary);
  if (primary) {
    await prisma.product.update({ where: { id: productId }, data: { image: primary.url } });
  }

  revalidatePath('/admin/products');
  revalidatePath(`/products`);
}

// ═══ SCRAPER ACTIONS ═══

export async function scrapeVendorProduct(vendorProductId: string) {
  const vp = await prisma.vendorProduct.findUnique({
    where: { id: vendorProductId },
    select: {
      vendorUrl: true, price: true, availability: true,
      shippingCost: true, shippingIncluded: true,
      vendor: { select: { id: true, slug: true, scraperEnabled: true } },
    },
  });
  if (!vp) return { error: 'Vendor product not found' };
  if (!vp.vendor.scraperEnabled) return { error: `Scraper not enabled for ${vp.vendor.slug}` };

  const entry = await getScraper(vp.vendor.slug);
  if (!entry) return { error: `No scraper configured for ${vp.vendor.slug}` };

  try {
    const result = await entry.scraper(vp.vendorUrl);

    await prisma.scrapeLog.create({
      data: {
        vendorId: vp.vendor.id,
        vendorProductId,
        status: result.success ? 'SUCCESS' : 'FAILED',
        httpStatus: result.httpStatus ?? null,
        responseTimeMs: result.responseTimeMs ?? null,
        error: result.error ?? null,
        price: result.price ?? null,
        availability: result.availability ?? null,
        selectorVersion: entry.version,
      },
    });

    if (!result.success || result.price == null) {
      await prisma.vendorProduct.update({
        where: { id: vendorProductId },
        data: {
          scrapeStatus: 'FAILED',
          scrapeError: result.error || 'Unknown error',
          lastCheckedAt: new Date(),
          lastHttpStatus: result.httpStatus ?? null,
          responseTimeMs: result.responseTimeMs ?? null,
        },
      });
      return { ok: false, message: result.error || 'Scrape failed' };
    }

    const newAvailability = result.availability || 'IN_STOCK';
    const newTotalPrice = vp.shippingIncluded ? result.price : result.price + vp.shippingCost;

    await prisma.vendorProduct.update({
      where: { id: vendorProductId },
      data: {
        price: result.price,
        availability: newAvailability,
        totalPrice: newTotalPrice,
        stockStatus: availabilityToLegacy(newAvailability),
        scrapeStatus: 'SUCCESS',
        scrapeError: null,
        lastCheckedAt: new Date(),
        lastSuccessfulAt: new Date(),
        lastScrapedPrice: result.price,
        lastScrapedAvailability: newAvailability,
        scraperVersion: entry.version,
        lastHttpStatus: result.httpStatus ?? null,
        responseTimeMs: result.responseTimeMs ?? null,
        source: 'scraper',
      },
    });

    await prisma.priceHistory.create({
      data: {
        vendorProductId,
        price: result.price,
        availability: newAvailability,
        shippingCost: vp.shippingCost,
        totalPrice: newTotalPrice,
        source: 'SCRAPER',
        stockStatus: availabilityToLegacy(newAvailability),
      },
    });

    return { ok: true, price: result.price, availability: newAvailability };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : 'Unknown error' };
  }
}

export async function approveScrapeReview(vendorProductId: string) {
  const vp = await prisma.vendorProduct.findUnique({
    where: { id: vendorProductId },
    select: { lastScrapedPrice: true, lastScrapedAvailability: true, shippingCost: true, shippingIncluded: true },
  });
  if (!vp) return { error: 'Vendor product not found' };
  if (vp.lastScrapedPrice == null) return { error: 'No scraped price to approve' };

  const newTotalPrice = vp.shippingIncluded ? vp.lastScrapedPrice : vp.lastScrapedPrice + vp.shippingCost;
  const newAvailability = vp.lastScrapedAvailability || 'IN_STOCK';

  await prisma.vendorProduct.update({
    where: { id: vendorProductId },
    data: {
      price: vp.lastScrapedPrice,
      availability: newAvailability,
      totalPrice: newTotalPrice,
      stockStatus: availabilityToLegacy(newAvailability),
      scrapeStatus: 'SUCCESS',
      scrapeError: null,
      lastSuccessfulAt: new Date(),
      source: 'scraper',
    },
  });

  await prisma.priceHistory.create({
    data: {
      vendorProductId,
      price: vp.lastScrapedPrice,
      availability: newAvailability,
      shippingCost: vp.shippingCost,
      totalPrice: newTotalPrice,
      source: 'SCRAPER',
      stockStatus: availabilityToLegacy(newAvailability),
    },
  });

  revalidatePath('/admin/products');
  revalidatePath('/admin/scraper');
  return { ok: true };
}

export async function clearManualOverride(vendorProductId: string) {
  await prisma.vendorProduct.update({
    where: { id: vendorProductId },
    data: {
      manualOverride: false,
      manualUpdatedAt: null,
      manualUpdatedById: null,
      scrapeStatus: 'PENDING',
    },
  });
  revalidatePath('/admin/products');
  return { ok: true };
}

export async function testVendorScraper(vendorId: string, testUrl: string) {
  try {
    const result = await testScraper(vendorId, testUrl);
    return result;
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}

function legacyToAvailability(status: string): 'IN_STOCK' | 'PREORDER' | 'GROUP_BUY' | 'COMING_SOON' | 'OUT_OF_STOCK' {
  const map: Record<string, 'IN_STOCK' | 'PREORDER' | 'GROUP_BUY' | 'COMING_SOON' | 'OUT_OF_STOCK'> = {
    in_stock: 'IN_STOCK',
    preorder: 'PREORDER',
    group_buy: 'GROUP_BUY',
    coming_soon: 'COMING_SOON',
    out_of_stock: 'OUT_OF_STOCK',
  };
  return map[status] || 'IN_STOCK';
}

function availabilityToLegacy(a: string): string {
  const map: Record<string, string> = {
    IN_STOCK: 'in_stock',
    PREORDER: 'preorder',
    GROUP_BUY: 'group_buy',
    COMING_SOON: 'coming_soon',
    OUT_OF_STOCK: 'out_of_stock',
  };
  return map[a] || 'in_stock';
}
