'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { getScraper, testScraper } from '@/lib/scraper';
import { applyScrapeResult, applyScrapeFailure } from '@/lib/services/pricing-service';
import { availabilityToLegacy } from '@/lib/utils';

async function scrapeOneProduct(vpId: string): Promise<{ ok: boolean; error?: string }> {
  const vp = await prisma.vendorProduct.findUnique({
    where: { id: vpId },
    select: {
      vendorUrl: true, price: true, availability: true,
      shippingCost: true, shippingIncluded: true,
      vendor: { select: { id: true, slug: true, name: true, scraperEnabled: true } },
    },
  });
  if (!vp) return { ok: false, error: 'Not found' };
  if (!vp.vendor.scraperEnabled) return { ok: false, error: 'Scraper disabled' };

  const entry = await getScraper(vp.vendor.slug);
  if (!entry) return { ok: false, error: 'No scraper config' };

  try {
    const result = await entry.scraper(vp.vendorUrl);

    await prisma.scrapeLog.create({
      data: {
        vendorId: vp.vendor.id,
        vendorProductId: vpId,
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
      await applyScrapeFailure(vpId, result.error || 'Unknown error', result.httpStatus, result.responseTimeMs, entry.version);
      return { ok: false, error: result.error || 'Scrape failed' };
    }

    await applyScrapeResult(vpId, result.price, result.availability || 'IN_STOCK', vp.shippingCost, vp.shippingIncluded, entry.version, result.httpStatus, result.responseTimeMs);

    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}

async function scrapeInBatches(ids: string[], batchSize = 5) {
  let success = 0, failed = 0;
  for (let i = 0; i < ids.length; i += batchSize) {
    const batch = ids.slice(i, i + batchSize);
    const results = await Promise.allSettled(batch.map(scrapeOneProduct));
    for (const r of results) {
      if (r.status === 'fulfilled' && r.value.ok) success++;
      else failed++;
    }
  }
  return { success, failed };
}

// ═══ SCRAPER CONTROLS ═══

export async function runAllScrapers() {
  const vendorProducts = await prisma.vendorProduct.findMany({
    where: {
      manualOverride: false,
      vendor: { scraperEnabled: true, enabled: true },
    },
    select: { id: true },
  });

  if (vendorProducts.length === 0) return { error: 'No products to scrape' };

  const ids = vendorProducts.map((vp) => vp.id);
  const { success, failed } = await scrapeInBatches(ids);

  revalidatePath('/admin/scraper');
  if (failed === 0) return { message: `Scraped ${success} products successfully` };
  return { message: `Done — ${success} succeeded, ${failed} failed out of ${ids.length}` };
}

export async function runFailedScrapers() {
  const vendorProducts = await prisma.vendorProduct.findMany({
    where: { scrapeStatus: 'FAILED', manualOverride: false },
    select: { id: true },
  });

  if (vendorProducts.length === 0) return { message: 'No failed products to retry' };

  const ids = vendorProducts.map((vp) => vp.id);
  const { success, failed } = await scrapeInBatches(ids);

  revalidatePath('/admin/scraper');
  if (failed === 0) return { message: `Retried ${success} products successfully` };
  return { message: `Done — ${success} succeeded, ${failed} still failed out of ${ids.length}` };
}

export async function retryFailedScrape(vendorProductId: string) {
  const { ok, error } = await scrapeOneProduct(vendorProductId);
  if (!ok) return { error: error || 'Scrape failed' };

  const vp = await prisma.vendorProduct.findUnique({
    where: { id: vendorProductId },
    select: { price: true },
  });

  revalidatePath('/admin/scraper');
  return { message: `Scraped ₹${vp?.price?.toLocaleString('en-IN') || '0'}` };
}

export async function runVendorScrapers(vendorId: string) {
  const vendorProducts = await prisma.vendorProduct.findMany({
    where: { vendorId, manualOverride: false, vendor: { scraperEnabled: true } },
    select: { id: true },
  });

  if (vendorProducts.length === 0) return { error: 'No products to scrape for this vendor' };

  const ids = vendorProducts.map((vp) => vp.id);
  const { success, failed } = await scrapeInBatches(ids);

  revalidatePath('/admin/scraper');
  if (failed === 0) return { message: `Scraped ${success} products successfully` };
  return { message: `Done — ${success} succeeded, ${failed} failed out of ${ids.length}` };
}

// ═══ OVERVIEW STATS ═══

export type OverviewStats = {
  productsUpdated: number;
  productsFailed: number;
  priceChanges: number;
  vendorsProcessed: number;
  avgRuntimeMs: number | null;
  lastRun: Date | null;
};

export async function getOverviewStats(): Promise<OverviewStats> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [productsUpdated, productsFailed, priceChanges, vendorsProcessed, avgResult, lastRun] = await Promise.all([
    prisma.vendorProduct.count({ where: { scrapeStatus: 'SUCCESS', lastCheckedAt: { gte: today } } }),
    prisma.vendorProduct.count({ where: { scrapeStatus: 'FAILED', lastCheckedAt: { gte: today } } }),
    prisma.priceHistory.count({ where: { source: 'SCRAPER', recordedAt: { gte: today } } }),
    prisma.vendorProduct.findMany({
      where: { scrapeStatus: 'SUCCESS', lastCheckedAt: { gte: today } },
      select: { vendorId: true },
      distinct: ['vendorId'],
    }).then((r) => r.length),
    prisma.vendorProduct.aggregate({
      where: { responseTimeMs: { not: null }, lastCheckedAt: { gte: today } },
      _avg: { responseTimeMs: true },
    }),
    prisma.vendorProduct.findFirst({
      where: { lastCheckedAt: { not: null } },
      orderBy: { lastCheckedAt: 'desc' },
      select: { lastCheckedAt: true },
    }),
  ]);

  return {
    productsUpdated,
    productsFailed,
    priceChanges,
    vendorsProcessed,
    avgRuntimeMs: avgResult._avg.responseTimeMs ? Math.round(avgResult._avg.responseTimeMs) : null,
    lastRun: lastRun?.lastCheckedAt ?? null,
  };
}

// ═══ DATA FETCHERS ═══

export type FailedLogEntry = {
  id: string;
  vendorName: string;
  vendorSlug: string;
  productName: string;
  vendorUrl: string;
  error: string;
  httpStatus: number | null;
  retryCount: number;
  createdAt: Date;
  vendorProductId: string | null;
};

export type PriceChangeEntry = {
  id: string;
  productName: string;
  vendorName: string;
  oldPrice: number;
  newPrice: number;
  availability: string;
  recordedAt: Date;
};

export type ActivityEntry = {
  id: string;
  icon: string;
  text: string;
  time: string;
  color: string;
};

export async function getFailedLogs(filters: {
  vendor?: string;
  today?: boolean;
  lastHour?: boolean;
}) {
  const where: Record<string, unknown> = { status: 'FAILED' };

  if (filters.vendor) where.vendorId = filters.vendor;
  if (filters.today) {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    where.createdAt = { gte: start };
  } else if (filters.lastHour) {
    where.createdAt = { gte: new Date(Date.now() - 3600_000) };
  }

  const logs = await prisma.scrapeLog.findMany({
    where,
    include: { vendor: { select: { name: true, slug: true } } },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  return Promise.all(
    logs.map(async (log) => {
      let productName = '—';
      let vendorUrl = '—';
      if (log.vendorProductId) {
        const vp = await prisma.vendorProduct.findUnique({
          where: { id: log.vendorProductId },
          select: { vendorUrl: true, product: { select: { name: true } } },
        });
        if (vp) { productName = vp.product.name; vendorUrl = vp.vendorUrl; }
      }
      return {
        id: log.id,
        vendorName: log.vendor?.name || '—',
        vendorSlug: log.vendor?.slug || '',
        productName,
        vendorUrl,
        error: log.error || 'Unknown error',
        httpStatus: log.httpStatus,
        retryCount: log.retryCount,
        createdAt: log.createdAt,
        vendorProductId: log.vendorProductId,
      };
    })
  );
}

export async function getLatestPriceChanges(): Promise<PriceChangeEntry[]> {
  const changes = await prisma.priceHistory.findMany({
    where: { source: 'SCRAPER' },
    include: {
      vendorProduct: {
        select: {
          product: { select: { name: true } },
          vendor: { select: { name: true } },
          availability: true,
        },
      },
    },
    orderBy: { recordedAt: 'desc' },
    take: 25,
  });

  const result: PriceChangeEntry[] = [];
  for (const ch of changes) {
    const prev = await prisma.priceHistory.findFirst({
      where: {
        vendorProductId: ch.vendorProductId,
        recordedAt: { lt: ch.recordedAt },
        source: 'SCRAPER',
      },
      orderBy: { recordedAt: 'desc' },
      select: { price: true },
    });

    result.push({
      id: ch.id,
      productName: ch.vendorProduct?.product?.name || '—',
      vendorName: ch.vendorProduct?.vendor?.name || '—',
      oldPrice: prev?.price ?? 0,
      newPrice: ch.price,
      availability: ch.vendorProduct?.availability || 'IN_STOCK',
      recordedAt: ch.recordedAt,
    });
  }

  return result;
}

export async function getActivityFeed(): Promise<ActivityEntry[]> {
  const logs = await prisma.scrapeLog.findMany({
    include: { vendor: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  const now = Date.now();

  return logs.map((log) => {
    let icon = '●';
    let color = 'var(--text-muted)';
    let text = '';

    switch (log.status) {
      case 'SUCCESS':
        icon = '✓';
        color = 'var(--green)';
        text = `Price updated — ${log.vendor?.name || 'Vendor'}`;
        if (log.price) text += ` — ₹${log.price.toLocaleString('en-IN')}`;
        break;
      case 'FAILED':
        icon = '✕';
        color = 'var(--red)';
        text = `Scrape failed — ${log.vendor?.name || 'Vendor'} — ${log.error || 'Unknown'}`;
        break;
      case 'PENDING':
        icon = '○';
        color = 'var(--yellow)';
        text = `Scrape queued — ${log.vendor?.name || 'Vendor'}`;
        break;
      case 'NEEDS_REVIEW':
        icon = '!';
        color = 'var(--orange)';
        text = `Needs review — ${log.vendor?.name || 'Vendor'}`;
        break;
      default:
        text = `${log.status} — ${log.vendor?.name || 'Vendor'}`;
    }

    const diff = now - log.createdAt.getTime();
    let time = '';
    if (diff < 60_000) time = 'Just now';
    else if (diff < 3600_000) time = `${Math.floor(diff / 60_000)}m ago`;
    else if (diff < 86400_000) time = `${Math.floor(diff / 3600_000)}h ago`;
    else time = `${Math.floor(diff / 86400_000)}d ago`;

    return { id: log.id, icon, text, time, color };
  });
}

// ═══ PER-PRODUCT SCRAPER ACTIONS ═══

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
      await applyScrapeFailure(vendorProductId, result.error || 'Unknown error', result.httpStatus, result.responseTimeMs, entry.version);
      return { ok: false, message: result.error || 'Scrape failed' };
    }

    const priceResult = await applyScrapeResult(vendorProductId, result.price, result.availability || 'IN_STOCK', vp.shippingCost, vp.shippingIncluded, entry.version, result.httpStatus, result.responseTimeMs);

    return { ok: true, price: priceResult.price, availability: priceResult.availability };
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

  await applyScrapeResult(
    vendorProductId,
    vp.lastScrapedPrice,
    vp.lastScrapedAvailability || 'IN_STOCK',
    vp.shippingCost,
    vp.shippingIncluded,
  );

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
