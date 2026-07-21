import { prisma } from '@/lib/prisma';
import { Availability, PriceSource } from '@prisma/client';
import { availabilityToLegacy, computeEffectivePrice } from '@/lib/utils';

export { computeEffectivePrice } from '@/lib/utils';

// ═══ PURE FUNCTIONS ═══

export function calculateTotalPrice(price: number, shippingCost: number, shippingIncluded: boolean): number {
  return shippingIncluded ? price : price + shippingCost;
}

// ═══ DATABASE OPERATIONS ═══

export async function recomputeEffectivePrice(vendorProductId: string): Promise<void> {
  const vp = await prisma.vendorProduct.findUnique({
    where: { id: vendorProductId },
    select: { totalPrice: true },
  });
  if (!vp) return;

  const coupons = await prisma.vendorProductCoupon.findMany({
    where: { vendorProductId },
    select: { discountType: true, discountValue: true, enabled: true },
  });

  const effectivePrice = computeEffectivePrice(Number(vp.totalPrice), coupons);
  await prisma.vendorProduct.update({
    where: { id: vendorProductId },
    data: { effectivePrice, bestFinalPrice: effectivePrice },
  });
}

export interface PriceUpdateInput {
  vendorProductId: string;
  price: number;
  shippingCost: number;
  shippingIncluded: boolean;
  availability?: string;
  stockStatus?: string;
  source?: string;
  manualOverride?: boolean;
  scrapeStatus?: string;
  updatedBy?: string;
}

export interface PriceUpdateResult {
  vendorProductId: string;
  price: number;
  totalPrice: number;
  effectivePrice: number;
  availability: string;
  stockStatus: string;
}

export async function applyPriceUpdate(input: PriceUpdateInput): Promise<PriceUpdateResult> {
  const { vendorProductId, price, shippingCost, shippingIncluded } = input;
  const availability = input.availability || 'IN_STOCK';
  const stockStatus = input.stockStatus || availabilityToLegacy(availability);
  const source = input.source || 'manual';

  const totalPrice = calculateTotalPrice(price, shippingCost, shippingIncluded);

  const coupons = await prisma.vendorProductCoupon.findMany({
    where: { vendorProductId },
    select: { discountType: true, discountValue: true, enabled: true },
  });
  const effectivePrice = computeEffectivePrice(totalPrice, coupons);

  const updateData: Record<string, unknown> = {
    price,
    shippingCost,
    shippingIncluded,
    totalPrice,
    effectivePrice,
    bestFinalPrice: effectivePrice,
    availability,
    stockStatus,
    source,
    lastCheckedAt: new Date(),
  };

  if (input.manualOverride !== undefined) {
    updateData.manualOverride = input.manualOverride;
    updateData.manualUpdatedAt = new Date();
    updateData.scrapeStatus = input.scrapeStatus || 'MANUAL_OVERRIDE';
  }
  if (input.updatedBy) {
    updateData.updatedBy = input.updatedBy;
    updateData.manualUpdatedById = input.updatedBy;
  }

  await prisma.vendorProduct.update({
    where: { id: vendorProductId },
    data: updateData,
  });

  await prisma.priceHistory.create({
    data: {
      vendorProductId,
      price,
      shippingCost,
      totalPrice,
      stockStatus,
      availability: availability as Availability,
      source: source.toUpperCase() as PriceSource,
    },
  });

  return { vendorProductId, price, totalPrice, effectivePrice, availability, stockStatus };
}

export async function applyScrapeResult(
  vendorProductId: string,
  scrapedPrice: number,
  scrapedAvailability: string,
  shippingCost: number,
  shippingIncluded: boolean,
  scraperVersion?: string | null,
  httpStatus?: number | null,
  responseTimeMs?: number | null,
): Promise<PriceUpdateResult> {
  const availability = scrapedAvailability || 'IN_STOCK';
  const stockStatus = availabilityToLegacy(availability);
  const totalPrice = calculateTotalPrice(scrapedPrice, shippingCost, shippingIncluded);

  const coupons = await prisma.vendorProductCoupon.findMany({
    where: { vendorProductId },
    select: { discountType: true, discountValue: true, enabled: true },
  });
  const effectivePrice = computeEffectivePrice(totalPrice, coupons);

  const updateData: Record<string, unknown> = {
    price: scrapedPrice,
    availability,
    stockStatus,
    totalPrice,
    effectivePrice,
    bestFinalPrice: effectivePrice,
    scrapeStatus: 'SUCCESS',
    scrapeError: null,
    lastCheckedAt: new Date(),
    lastSuccessfulAt: new Date(),
    lastScrapedPrice: scrapedPrice,
    lastScrapedAvailability: availability,
    source: 'scraper',
  };

  if (scraperVersion !== undefined) updateData.scraperVersion = scraperVersion;
  if (httpStatus !== undefined) updateData.lastHttpStatus = httpStatus;
  if (responseTimeMs !== undefined) updateData.responseTimeMs = responseTimeMs;

  await prisma.vendorProduct.update({
    where: { id: vendorProductId },
    data: updateData,
  });

  await prisma.priceHistory.create({
    data: {
      vendorProductId,
      price: scrapedPrice,
      availability: availability as Availability,
      shippingCost,
      totalPrice,
      stockStatus,
      source: 'SCRAPER' as PriceSource,
    },
  });

  return { vendorProductId, price: scrapedPrice, totalPrice, effectivePrice, availability, stockStatus };
}

export async function applyScrapeFailure(
  vendorProductId: string,
  error: string,
  httpStatus?: number | null,
  responseTimeMs?: number | null,
  scraperVersion?: string | null,
): Promise<void> {
  const updateData: Record<string, unknown> = {
    scrapeStatus: 'FAILED',
    scrapeError: error,
    lastCheckedAt: new Date(),
  };

  if (httpStatus !== undefined) updateData.lastHttpStatus = httpStatus;
  if (responseTimeMs !== undefined) updateData.responseTimeMs = responseTimeMs;
  if (scraperVersion !== undefined) updateData.scraperVersion = scraperVersion;

  await prisma.vendorProduct.update({
    where: { id: vendorProductId },
    data: updateData,
  });
}
