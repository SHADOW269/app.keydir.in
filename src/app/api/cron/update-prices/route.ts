import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getScraper } from '@/lib/scraper';
import { applyScrapeResult, applyScrapeFailure } from '@/lib/services/pricing-service';

const CRON_SECRET = process.env.CRON_SECRET;
const BATCH_SIZE = 100;
const MANUAL_OVERRIDE_HOURS = 24;
const SUSPICIOUS_CHANGE_THRESHOLD = 0.50;

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const results = { success: 0, failed: 0, needsReview: 0, skipped: 0, errors: [] as string[] };

  const vendorProducts = await prisma.vendorProduct.findMany({
    orderBy: { lastCheckedAt: 'asc' },
    take: BATCH_SIZE,
    include: {
      vendor: { select: { id: true, slug: true, name: true, enabled: true } },
      product: { select: { name: true } },
    },
  });

  for (const vp of vendorProducts) {
    if (!vp.vendor.enabled) {
      results.skipped++;
      continue;
    }

    if (vp.manualOverride && vp.manualUpdatedAt) {
      const hoursSinceManual = (Date.now() - vp.manualUpdatedAt.getTime()) / (1000 * 60 * 60);
      if (hoursSinceManual < MANUAL_OVERRIDE_HOURS) {
        results.skipped++;
        continue;
      }
    }

    const entry = await getScraper(vp.vendor.slug);
    if (!entry) {
      results.skipped++;
      continue;
    }

    try {
      const scrapeResult = await entry.scraper(vp.vendorUrl);

      await prisma.scrapeLog.create({
        data: {
          vendorId: vp.vendor.id,
          vendorProductId: vp.id,
          status: scrapeResult.success ? 'SUCCESS' : 'FAILED',
          httpStatus: scrapeResult.httpStatus ?? null,
          responseTimeMs: scrapeResult.responseTimeMs ?? null,
          error: scrapeResult.error ?? null,
          price: scrapeResult.price ?? null,
          availability: scrapeResult.availability ?? null,
          selectorVersion: entry.version,
        },
      });

      if (!scrapeResult.success || scrapeResult.price == null) {
        await applyScrapeFailure(vp.id, scrapeResult.error || 'Unknown error', scrapeResult.httpStatus, scrapeResult.responseTimeMs, entry.version);
        results.failed++;
        results.errors.push(`${vp.vendor.name} / ${vp.product.name}: ${scrapeResult.error}`);
        continue;
      }

      const currentPrice = vp.price;
      const scrapedPrice = scrapeResult.price;
      const isSuspicious = currentPrice > 0 && Math.abs(scrapedPrice - currentPrice) / currentPrice > SUSPICIOUS_CHANGE_THRESHOLD;

      if (isSuspicious) {
        await prisma.vendorProduct.update({
          where: { id: vp.id },
          data: {
            scrapeStatus: 'NEEDS_REVIEW',
            scrapeError: `Suspicious price change: ₹${currentPrice} → ₹${scrapedPrice} (${Math.round(Math.abs(scrapedPrice - currentPrice) / currentPrice * 100)}% change)`,
            lastCheckedAt: new Date(),
            lastScrapedPrice: scrapedPrice,
            lastScrapedAvailability: scrapeResult.availability || 'IN_STOCK',
            lastHttpStatus: scrapeResult.httpStatus ?? null,
            responseTimeMs: scrapeResult.responseTimeMs ?? null,
            scraperVersion: entry.version,
          },
        });
        results.needsReview++;
        continue;
      }

      await applyScrapeResult(
        vp.id,
        scrapedPrice,
        scrapeResult.availability || 'IN_STOCK',
        vp.shippingCost,
        vp.shippingIncluded,
        entry.version,
        scrapeResult.httpStatus,
        scrapeResult.responseTimeMs,
      );

      results.success++;
    } catch (e) {
      await prisma.scrapeLog.create({
        data: {
          vendorId: vp.vendor.id,
          vendorProductId: vp.id,
          status: 'FAILED',
          error: e instanceof Error ? e.message : 'Unknown error',
          selectorVersion: entry.version,
        },
      });

      await applyScrapeFailure(vp.id, e instanceof Error ? e.message : 'Unknown error', undefined, undefined, entry.version);
      results.failed++;
      results.errors.push(`${vp.vendor.name} / ${vp.product.name}: ${e instanceof Error ? e.message : 'Unknown'}`);
    }
  }

  return NextResponse.json({
    ok: true,
    processed: vendorProducts.length,
    ...results,
  });
}
