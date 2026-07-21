import { LowestPricesClient } from './lowest-prices-client';
import { fetchLowestPrices } from '@/lib/services/product-service';

export async function LowestPrices() {
  const items = await fetchLowestPrices();
  if (items.length === 0) return null;
  return <LowestPricesClient items={items} />;
}
