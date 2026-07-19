import * as cheerio from 'cheerio';
import type { ScrapeResult, VendorConfig } from './types';
import { safeFetch } from './types';
import { parsePrice } from './parse';

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
