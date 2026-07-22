const DEBUG = process.env.SCRAPER_DEBUG === 'true';

function log(vendor: string, ...args: unknown[]) {
  if (DEBUG) console.log(`[scraper:${vendor}]`, ...args);
}

export function parsePrice(html: string, vendor: string): number | null {
  // ── Strategy 1: JSON-LD structured data (most reliable) ──
  const jsonLdBlocks = html.match(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi);
  if (jsonLdBlocks) {
    for (const block of jsonLdBlocks) {
      const raw = block.replace(/<script[^>]*>/i, '').replace(/<\/script>/i, '');
      try {
        const data = JSON.parse(raw);
        const product = data['@type'] === 'Product'
          ? data
          : data['@graph']?.find((g: Record<string, unknown>) => g['@type'] === 'Product');
        if (!product) continue;

        const offers = product.offers;
        if (!offers) continue;

        // Single offer object
        if (offers.price != null && !Array.isArray(offers)) {
          const price = parsePriceValue(String(offers.price));
          if (price != null) {
            log(vendor, 'JSON-LD offer.price:', offers.price, '->', price, '(selector: offers.price)');
            return price;
          }
        }

        // Array of offers — prefer the one with lowest price (selling price, not MRP)
        if (Array.isArray(offers)) {
          const prices = offers
            .map((o: Record<string, unknown>) => ({
              price: parsePriceValue(String(o.price)),
              name: String(o.name || ''),
              type: String(o.priceCurrency || ''),
            }))
            .filter((o) => o.price != null) as { price: number; name: string }[];

          if (prices.length > 0) {
            // Prefer lowest non-zero price (selling price over MRP)
            const best = prices.reduce((a, b) => (a.price < b.price ? a : b));
            log(vendor, 'JSON-LD offers array:', prices.map((p) => `${p.name}=${p.price}`), '-> selected:', best.price, '(selector: offers[])');
            return best.price;
          }
        }
      } catch { /* skip invalid JSON-LD */ }
    }
  }

  // ── Strategy 2: Meta tag product:price:amount ──
  const metaPatterns = [
    /<meta\s+property="product:price:amount"\s+content="([^"]+)"/i,
    /<meta\s+content="([^"]+)"\s+property="product:price:amount"/i,
    /<meta\s+name="twitter:data1"\s+content="([^"]+)"/i,
  ];

  for (const p of metaPatterns) {
    const m = html.match(p);
    if (m) {
      const price = parsePriceValue(m[1]);
      if (price != null) {
        log(vendor, 'Meta tag:', m[0].substring(0, 80), '->', price, '(selector: meta product:price)');
        return price;
      }
    }
  }

  // ── Strategy 3: data-price attribute ──
  const dataPriceMatch = html.match(/data-price="([^"]+)"/i);
  if (dataPriceMatch) {
    const price = parsePriceValue(dataPriceMatch[1]);
    if (price != null) {
      log(vendor, 'data-price:', dataPriceMatch[1], '->', price, '(selector: [data-price])');
      return price;
    }
  }

  // ── Strategy 4: HTML element patterns (selling price, skip MRP/crossed-out) ──
  // Strip out MRP / strikethrough / was-price sections first
  const cleaned = html
    .replace(/<del[^>]*>[\s\S]*?<\/del>/gi, '')
    .replace(/<s[^>]*>[\s\S]*?<\/s>/gi, '')
    .replace(/class="[^"]*(?:mrp|was-price|original-price|crossed|line-through)[^"]*"[^>]*>[\s\S]*?<\/[^>]+>/gi, '')
    .replace(/class="[^"]*(?:compare|old|regular)[^"]*-price[^"]*"[^>]*>[\s\S]*?<\/[^>]+>/gi, '');

  const elementPatterns = [
    // class contains "price" or "amount" with ₹ or Rs
    { re: /class="[^"]*(?:current|selling|sale|special|final)[^"]*-?price[^"]*"[^>]*>\s*(?:₹|Rs\.?|INR)\s*([\d,]+)/gi, name: 'current/selling price class' },
    { re: /class="[^"]*price[^"]*"[^>]*>\s*(?:₹|Rs\.?|INR)\s*([\d,]+)/gi, name: 'price class' },
    { re: /class="[^"]*amount[^"]*"[^>]*>\s*(?:₹|Rs\.?|INR)\s*([\d,]+)/gi, name: 'amount class' },
    // itemprop="price"
    { re: /itemprop="price"\s+content="([^"]+)"/gi, name: 'itemprop price' },
    // Any ₹ amount (last resort)
    { re: /(?:₹|Rs\.?|INR)\s*([\d,]+(?:\.\d{1,2})?)/gi, name: 'generic ₹/Rs' },
  ];

  for (const { re, name } of elementPatterns) {
    re.lastIndex = 0;
    let match;
    while ((match = re.exec(cleaned)) !== null) {
      const price = parsePriceValue(match[1]);
      if (price != null && price > 0) {
        log(vendor, `Pattern "${name}":`, match[0].substring(0, 80), '->', price, `(selector: ${name})`);
        return price;
      }
    }
  }

  log(vendor, 'No price found in HTML');
  return null;
}

export function parsePriceValue(raw: string): number | null {
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

export function parseAvailability(raw: string): 'IN_STOCK' | 'PREORDER' | 'GROUP_BUY' | 'COMING_SOON' | 'OUT_OF_STOCK' {
  const lower = raw.toLowerCase();
  if (/out\s*of\s*stock|sold\s*out|unavailable|currently\s*unavailable/i.test(lower)) return 'OUT_OF_STOCK';
  if (/pre[\s-]*order/i.test(lower)) return 'PREORDER';
  if (/group\s*buy/i.test(lower)) return 'GROUP_BUY';
  if (/coming\s*soon/i.test(lower)) return 'COMING_SOON';
  return 'IN_STOCK';
}

export function parseCustomHeaders(raw: string | null): Record<string, string> | undefined {
  if (!raw) return undefined;
  try {
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
}
