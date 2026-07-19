export type Availability = 'IN_STOCK' | 'PREORDER' | 'GROUP_BUY' | 'COMING_SOON' | 'OUT_OF_STOCK';

export interface ScrapeResult {
  success: boolean;
  price?: number;
  availability?: Availability;
  title?: string;
  image?: string;
  productExists?: boolean;
  error?: string;
  httpStatus?: number;
  responseTimeMs?: number;
}

/** Scraper configuration stored on the Vendor model in DB. */
export interface VendorConfig {
  id: string;
  name: string;
  slug: string;
  website: string;
  scraperEngine: string;
  priceSelector: string | null;
  availabilitySelector: string | null;
  titleSelector: string | null;
  imageSelector: string | null;
  productExistsSelector: string | null;
  priceAttribute: string;
  availabilityAttribute: string;
  titleAttribute: string;
  imageAttribute: string;
  customHeaders: string | null;
  cloudflareProtected: boolean;
  useJavaScriptRendering: boolean;
  customScraper: string | null;
  scraperVersion: number;
}

export type VendorScraper = (url: string) => Promise<ScrapeResult>;

const TIMEOUT_MS = 10_000;
const RETRY_DELAY_MS = 2_000;
const MAX_RETRIES = 1;

export async function safeFetch(url: string, headers?: Record<string, string>): Promise<{ html: string; httpStatus: number; responseTimeMs: number }> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    if (attempt > 0) {
      await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
    }

    const start = Date.now();
    try {
      const res = await fetch(url, {
        redirect: 'follow',
        signal: AbortSignal.timeout(TIMEOUT_MS),
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; KeyDirBot/1.0)',
          'Accept': 'text/html',
          ...headers,
        },
      });

      const responseTimeMs = Date.now() - start;

      if (!res.ok) {
        return { html: '', httpStatus: res.status, responseTimeMs };
      }

      const html = await res.text();
      return { html, httpStatus: res.status, responseTimeMs };
    } catch (e) {
      lastError = e instanceof Error ? e : new Error('Unknown error');
      if (attempt === MAX_RETRIES) break;
    }
  }

  throw lastError || new Error('Fetch failed after retries');
}
