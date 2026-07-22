import * as cheerio from 'cheerio';
import type { ScrapeResult, VendorConfig } from './types';
import { safeFetch } from './types';
import { parsePrice, parsePriceValue, parseAvailability, parseCustomHeaders } from './parse';

const DEBUG = process.env.SCRAPER_DEBUG === 'true';

function log(vendor: string, ...args: unknown[]) {
  if (DEBUG) console.log(`[scraper:${vendor}:cheerio]`, ...args);
}

export async function scrapeWithCheerio(config: VendorConfig, url: string): Promise<ScrapeResult> {
  try {
    const customHeaders = parseCustomHeaders(config.customHeaders);
    const { html, httpStatus, responseTimeMs } = await safeFetch(url, customHeaders);

    if (!html) {
      return { success: false, error: `HTTP ${httpStatus}`, httpStatus, responseTimeMs };
    }

    const $ = cheerio.load(html);

    const price = extractPrice($, config, url) ?? parsePrice(html, config.slug);
    if (price === null) {
      log(config.slug, 'No price found via selectors or HTML fallback');
      return { success: false, error: 'Price selector missing or no match', httpStatus, responseTimeMs };
    }

    const availabilityText = extractText($, config.availabilitySelector, config.availabilityAttribute);
    const title = extractText($, config.titleSelector, config.titleAttribute);
    const image = extractAttribute($, config.imageSelector, config.imageAttribute);
    const productExists = config.productExistsSelector
      ? $(config.productExistsSelector).length > 0
      : undefined;

    log(config.slug, 'Results:', { price, availability: availabilityText, title, image: image?.substring(0, 60) });

    return {
      success: true,
      price,
      availability: availabilityText ? parseAvailability(availabilityText) : undefined,
      title: title || undefined,
      image: image || undefined,
      productExists,
      httpStatus,
      responseTimeMs,
    };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}

function extractPrice($: cheerio.CheerioAPI, config: VendorConfig, _url: string): number | null {
  if (!config.priceSelector) return null;

  const selectors = config.priceSelector.split(',').map((s) => s.trim()).filter(Boolean);

  for (const sel of selectors) {
    const el = $(sel).first();
    if (el.length === 0) continue;

    let raw: string;
    const attr = config.priceAttribute || 'text';
    if (attr === 'text') {
      raw = el.text().trim();
    } else if (attr === 'html') {
      raw = el.html()?.trim() || '';
    } else {
      raw = el.attr(attr)?.trim() || '';
    }

    if (!raw) continue;

    log(config.slug, `Selector "${sel}" matched:`, raw.substring(0, 80));

    const parsed = parsePriceValue(raw);
    if (parsed !== null) return parsed;
  }

  return null;
}

function extractText($: cheerio.CheerioAPI, selector: string | null, attribute: string): string | null {
  if (!selector) return null;

  const selectors = selector.split(',').map((s) => s.trim()).filter(Boolean);

  for (const sel of selectors) {
    const el = $(sel).first();
    if (el.length === 0) continue;

    let value: string;
    if (attribute === 'text') {
      value = el.text().trim();
    } else {
      value = el.attr(attribute)?.trim() || '';
    }

    if (value) return value;
  }

  return null;
}

function extractAttribute($: cheerio.CheerioAPI, selector: string | null, attribute: string): string | null {
  if (!selector) return null;

  const selectors = selector.split(',').map((s) => s.trim()).filter(Boolean);

  for (const sel of selectors) {
    const el = $(sel).first();
    if (el.length === 0) continue;

    const value = attribute === 'text'
      ? el.text().trim()
      : el.attr(attribute)?.trim() || '';

    if (value) return value;
  }

  return null;
}
