'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { slugify, legacyToAvailability } from '@/lib/utils';
import { recomputeEffectivePrice } from '@/lib/recompute-price';
import { getScraper } from '@/lib/scraper';

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
  const data: Record<string, unknown> = {};

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

  const booleanFields = ['scraperEnabled', 'cloudflareProtected', 'useJavaScriptRendering'] as const;

  for (const field of booleanFields) {
    if (formData.has(field)) {
      data[field] = formData.get(field) === 'on';
    }
  }

  if (data.customHeaders) {
    try {
      JSON.parse(data.customHeaders as string);
    } catch {
      return { error: 'Custom Headers must be valid JSON' };
    }
  }

  if (Object.keys(data).length === 0) {
    return { ok: true };
  }

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

// ═══ VENDOR PRODUCTS ═══

interface CouponInput {
  id?: string; code: string; discountType: string; discountValue: number;
  minimumOrderAmount: number; expiryDate: string; couponUrl: string;
  description: string; enabled: boolean;
}

async function syncVendorProductCoupons(vendorProductId: string, couponsRaw: string | null) {
  if (!couponsRaw) return;
  let coupons: CouponInput[];
  try { coupons = JSON.parse(couponsRaw); } catch { return; }
  if (!Array.isArray(coupons)) return;

  const existing = await prisma.vendorProductCoupon.findMany({ where: { vendorProductId }, select: { id: true } });
  const existingIds = new Set(existing.map((c) => c.id));
  const incomingIds = new Set(coupons.filter((c) => c.id).map((c) => c.id!));

  for (const id of existingIds) {
    if (!incomingIds.has(id)) {
      await prisma.vendorProductCoupon.delete({ where: { id } });
    }
  }

  for (const c of coupons) {
    const data = {
      code: c.code,
      discountType: c.discountType,
      discountValue: c.discountValue || 0,
      minimumOrderAmount: c.minimumOrderAmount || 0,
      expiryDate: c.expiryDate ? new Date(c.expiryDate) : null,
      couponUrl: c.couponUrl || null,
      description: c.description || null,
      enabled: c.enabled,
    };
    if (c.id && existingIds.has(c.id)) {
      await prisma.vendorProductCoupon.update({ where: { id: c.id }, data });
    } else {
      await prisma.vendorProductCoupon.create({ data: { ...data, vendorProductId } });
    }
  }

  await recomputeEffectivePrice(vendorProductId);
}

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
      totalPrice, effectivePrice: totalPrice, bestFinalPrice: totalPrice, stockStatus, affiliateLink, source: 'manual',
      availability, scrapeStatus: 'PENDING',
    },
    update: {
      vendorUrl, price, shippingCost, shippingIncluded, totalPrice, effectivePrice: totalPrice, bestFinalPrice: totalPrice,
      stockStatus, affiliateLink, lastCheckedAt: new Date(),
      availability, source: 'manual',
    },
  });

  await syncVendorProductCoupons(vp.id, formData.get('coupons') as string | null);

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
      price, stockStatus, shippingCost, shippingIncluded, totalPrice, effectivePrice: totalPrice, bestFinalPrice: totalPrice,
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

  await syncVendorProductCoupons(vendorProductId, formData.get('coupons') as string | null);

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
