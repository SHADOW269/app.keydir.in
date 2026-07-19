import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getScraper } from '@/lib/scraper';

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
        await prisma.vendorProduct.update({
          where: { id: vp.id },
          data: {
            scrapeStatus: 'FAILED',
            scrapeError: scrapeResult.error || 'Unknown error',
            lastCheckedAt: new Date(),
            lastHttpStatus: scrapeResult.httpStatus ?? null,
            responseTimeMs: scrapeResult.responseTimeMs ?? null,
          },
        });
        results.failed++;
        results.errors.push(`${vp.vendor.name} / ${vp.product.name}: ${scrapeResult.error}`);
        continue;
      }

      const currentPrice = vp.price;
      const scrapedPrice = scrapeResult.price;
      const isSuspicious = currentPrice > 0 && Math.abs(scrapedPrice - currentPrice) / currentPrice > SUSPICIOUS_CHANGE_THRESHOLD;

      const newAvailability = scrapeResult.availability || 'IN_STOCK';
      const newTotalPrice = vp.shippingIncluded ? scrapedPrice : scrapedPrice + vp.shippingCost;

      if (isSuspicious) {
        await prisma.vendorProduct.update({
          where: { id: vp.id },
          data: {
            scrapeStatus: 'NEEDS_REVIEW',
            scrapeError: `Suspicious price change: ₹${currentPrice} → ₹${scrapedPrice} (${Math.round(Math.abs(scrapedPrice - currentPrice) / currentPrice * 100)}% change)`,
            lastCheckedAt: new Date(),
            lastScrapedPrice: scrapedPrice,
            lastScrapedAvailability: newAvailability,
            lastHttpStatus: scrapeResult.httpStatus ?? null,
            responseTimeMs: scrapeResult.responseTimeMs ?? null,
            scraperVersion: entry.version,
          },
        });
        results.needsReview++;
        continue;
      }

      await prisma.vendorProduct.update({
        where: { id: vp.id },
        data: {
          price: scrapedPrice,
          availability: newAvailability,
          totalPrice: newTotalPrice,
          stockStatus: availabilityToLegacy(newAvailability),
          scrapeStatus: 'SUCCESS',
          scrapeError: null,
          lastCheckedAt: new Date(),
          lastSuccessfulAt: new Date(),
          lastScrapedPrice: scrapedPrice,
          lastScrapedAvailability: newAvailability,
          scraperVersion: entry.version,
          lastHttpStatus: scrapeResult.httpStatus ?? null,
          responseTimeMs: scrapeResult.responseTimeMs ?? null,
          source: 'scraper',
        },
      });

      await prisma.priceHistory.create({
        data: {
          vendorProductId: vp.id,
          price: scrapedPrice,
          availability: newAvailability,
          shippingCost: vp.shippingCost,
          totalPrice: newTotalPrice,
          source: 'SCRAPER',
          stockStatus: availabilityToLegacy(newAvailability),
        },
      });

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

      await prisma.vendorProduct.update({
        where: { id: vp.id },
        data: {
          scrapeStatus: 'FAILED',
          scrapeError: e instanceof Error ? e.message : 'Unknown error',
          lastCheckedAt: new Date(),
        },
      });
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
