import type { Page } from 'playwright';
import type { ScrapeResult, VendorConfig } from './types';
import { parsePrice } from './parse';

const DEBUG = process.env.SCRAPER_DEBUG === 'true';

function log(vendor: string, ...args: unknown[]) {
  if (DEBUG) console.log(`[scraper:${vendor}:playwright]`, ...args);
}

/**
 * Playwright-based scraper for JS-rendered sites.
 * Requires: npm install playwright
 */
export async function scrapeWithPlaywright(config: VendorConfig, url: string): Promise<ScrapeResult> {
  let browser;
  try {
    const { chromium } = await import('playwright');
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    const customHeaders = parseCustomHeaders(config.customHeaders);
    if (customHeaders) {
      await page.setExtraHTTPHeaders(customHeaders);
    }

    const start = Date.now();
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15_000 });
    const responseTimeMs = Date.now() - start;

    await page.waitForTimeout(1_000);

    const price = await extractPrice(page, config)
      ?? parsePrice(await page.content(), config.slug);
    if (price === null) {
      log(config.slug, 'No price found via selectors or HTML fallback');
      return { success: false, error: 'Price selector missing or no match', responseTimeMs };
    }

    const availabilityText = await extractText(page, config.availabilitySelector, config.availabilityAttribute);
    const title = await extractText(page, config.titleSelector, config.titleAttribute);
    const image = await extractText(page, config.imageSelector, config.imageAttribute);
    const productExists = config.productExistsSelector
      ? (await page.locator(config.productExistsSelector).count()) > 0
      : undefined;

    log(config.slug, 'Results:', { price, availability: availabilityText, title, image: image?.substring(0, 60) });

    return {
      success: true,
      price,
      availability: availabilityText ? parseAvailability(availabilityText) : undefined,
      title: title || undefined,
      image: image || undefined,
      productExists,
      responseTimeMs,
    };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
  } finally {
    await browser?.close();
  }
}

async function extractPrice(page: Page, config: VendorConfig): Promise<number | null> {
  if (!config.priceSelector) return null;

  const selectors = config.priceSelector.split(',').map((s) => s.trim()).filter(Boolean);

  for (const sel of selectors) {
    try {
      const locator = page.locator(sel).first();
      const count = await locator.count();
      if (count === 0) continue;

      const attr = config.priceAttribute || 'text';
      const raw = attr === 'text'
        ? await locator.textContent()
        : await locator.getAttribute(attr);

      if (!raw?.trim()) continue;

      log(config.slug, `Selector "${sel}" matched:`, raw.substring(0, 80));

      const parsed = parsePriceValue(raw);
      if (parsed !== null) return parsed;
    } catch {
      continue;
    }
  }

  return null;
}

async function extractText(page: Page, selector: string | null, attribute: string): Promise<string | null> {
  if (!selector) return null;

  const selectors = selector.split(',').map((s) => s.trim()).filter(Boolean);

  for (const sel of selectors) {
    try {
      const locator = page.locator(sel).first();
      const count = await locator.count();
      if (count === 0) continue;

      const raw = attribute === 'text'
        ? await locator.textContent()
        : await locator.getAttribute(attribute);

      if (raw?.trim()) return raw.trim();
    } catch {
      continue;
    }
  }

  return null;
}

function parsePriceValue(raw: string): number | null {
  const cleaned = raw
    .replace(/[₹$€£]/g, '')
    .replace(/\bRs\.?\s*/gi, '')
    .replace(/\bINR\s*/gi, '')
    .replace(/,/g, '')
    .trim();

  const numMatch = cleaned.match(/^(\d+(?:\.\d{1,2})?)$/);
  if (!numMatch) return null;

  const num = parseFloat(numMatch[1]);
  if (isNaN(num) || num <= 0 || num > 99_99_999) return null;

  return Math.round(num);
}

function parseAvailability(raw: string): 'IN_STOCK' | 'PREORDER' | 'GROUP_BUY' | 'COMING_SOON' | 'OUT_OF_STOCK' {
  const lower = raw.toLowerCase();
  if (/out\s*of\s*stock|sold\s*out|unavailable|currently\s*unavailable/i.test(lower)) return 'OUT_OF_STOCK';
  if (/pre[\s-]*order/i.test(lower)) return 'PREORDER';
  if (/group\s*buy/i.test(lower)) return 'GROUP_BUY';
  if (/coming\s*soon/i.test(lower)) return 'COMING_SOON';
  return 'IN_STOCK';
}

function parseCustomHeaders(raw: string | null): Record<string, string> | undefined {
  if (!raw) return undefined;
  try {
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
}
