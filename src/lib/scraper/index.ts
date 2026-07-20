import { prisma } from '@/lib/prisma';
import type { ScrapeResult, VendorConfig, VendorScraper } from './types';
import { scrapeWithCheerio } from './cheerio';
import { getCustomScraper } from './custom';

/**
 * Load vendor scraper config from DB and return a scraper function.
 * Returns null if the vendor has no scraper enabled or config is incomplete.
 */
export async function getScraperForVendor(vendorId: string): Promise<{ scraper: VendorScraper; version: string } | null> {
  const vendor = await prisma.vendor.findUnique({
    where: { id: vendorId },
    select: {
      id: true,
      name: true,
      slug: true,
      website: true,
      scraperEnabled: true,
      scraperEngine: true,
      priceSelector: true,
      availabilitySelector: true,
      titleSelector: true,
      imageSelector: true,
      productExistsSelector: true,
      priceAttribute: true,
      availabilityAttribute: true,
      titleAttribute: true,
      imageAttribute: true,
      customHeaders: true,
      cloudflareProtected: true,
      useJavaScriptRendering: true,
      customScraper: true,
      scraperVersion: true,
    },
  });

  if (!vendor || !vendor.scraperEnabled) return null;

  const config: VendorConfig = {
    id: vendor.id,
    name: vendor.name,
    slug: vendor.slug,
    website: vendor.website,
    scraperEngine: vendor.scraperEngine,
    priceSelector: vendor.priceSelector,
    availabilitySelector: vendor.availabilitySelector,
    titleSelector: vendor.titleSelector,
    imageSelector: vendor.imageSelector,
    productExistsSelector: vendor.productExistsSelector,
    priceAttribute: vendor.priceAttribute,
    availabilityAttribute: vendor.availabilityAttribute,
    titleAttribute: vendor.titleAttribute,
    imageAttribute: vendor.imageAttribute,
    customHeaders: vendor.customHeaders,
    cloudflareProtected: vendor.cloudflareProtected,
    useJavaScriptRendering: vendor.useJavaScriptRendering,
    customScraper: vendor.customScraper,
    scraperVersion: vendor.scraperVersion,
  };

  const version = `${vendor.slug}-v${vendor.scraperVersion}`;

  // If custom scraper exists, try to load it
  if (config.customScraper) {
    const custom = getCustomScraper(config.customScraper);
    if (custom) return { scraper: custom(config), version };
  }

  // Route to the configured engine
  if (config.useJavaScriptRendering || config.scraperEngine === 'playwright') {
    const { scrapeWithPlaywright } = await import('./playwright');
    return { scraper: (url: string) => scrapeWithPlaywright(config, url), version };
  }

  return { scraper: (url: string) => scrapeWithCheerio(config, url), version };
}

/**
 * Legacy interface: get scraper by vendor slug (used by cron/actions).
 * Loads vendor from DB by slug.
 */
export async function getScraper(vendorSlug: string): Promise<{ scraper: VendorScraper; version: string } | null> {
  const vendor = await prisma.vendor.findUnique({
    where: { slug: vendorSlug },
    select: { id: true },
  });

  if (!vendor) return null;
  return getScraperForVendor(vendor.id);
}

/**
 * Check if a vendor has scraping enabled.
 */
export async function hasScraper(vendorSlug: string): Promise<boolean> {
  const vendor = await prisma.vendor.findUnique({
    where: { slug: vendorSlug },
    select: { scraperEnabled: true },
  });
  return vendor?.scraperEnabled ?? false;
}

/**
 * Get scraper version string for a vendor.
 */
export async function getScraperVersion(vendorSlug: string): Promise<string | null> {
  const vendor = await prisma.vendor.findUnique({
    where: { slug: vendorSlug },
    select: { scraperVersion: true },
  });
  return vendor ? `${vendorSlug}-v${vendor.scraperVersion}` : null;
}

/**
 * Test a vendor's scraper against a URL without saving anything.
 */
export async function testScraper(vendorId: string, testUrl: string): Promise<ScrapeResult> {
  const entry = await getScraperForVendor(vendorId);
  if (!entry) {
    return { success: false, error: 'Scraper not enabled. Go to the Scraper tab → enable scraper → save. Then configure at least a Price selector in the Selectors tab.' };
  }
  return entry.scraper(testUrl);
}
