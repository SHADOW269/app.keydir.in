/**
 * Custom scraper registry.
 * To add a new custom scraper:
 * 1. Create ./yourscraper.ts exporting: (config: VendorConfig) => VendorScraper
 * 2. Add it to the registry below
 * 3. Set vendor.customScraper = "yourscraper" in the admin panel
 */
import type { VendorConfig, VendorScraper } from '../types';

const registry: Record<string, (config: VendorConfig) => VendorScraper> = {};

export function getCustomScraper(name: string): ((config: VendorConfig) => VendorScraper) | null {
  return registry[name] ?? null;
}
