import type { Page } from 'playwright';
import type { ScrapeResult, VendorConfig } from './types';
import { parsePrice, parsePriceValue, parseAvailability, parseCustomHeaders } from './parse';

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
