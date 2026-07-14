import { formatPrice, timeAgo } from '@/lib/utils';
import { ExternalLink } from 'lucide-react';
import type { VendorProductWithVendor } from '@/types';

function toNum(v: unknown): number {
  if (typeof v === 'number') return v;
  if (typeof v === 'string') return parseFloat(v);
  if (v && typeof v === 'object' && 'toNumber' in v) return (v as { toNumber(): number }).toNumber();
  return 0;
}

const STOCK_MAP: Record<string, { label: string; cls: string; icon: string }> = {
  in_stock: { label: 'In Stock', cls: 'b-green', icon: '✓' },
  preorder: { label: 'Pre-order', cls: 'b-yellow', icon: '◷' },
  group_buy: { label: 'Group Buy', cls: 'b-blue', icon: '◎' },
  coming_soon: { label: 'Coming Soon', cls: 'b-orange', icon: '⏳' },
  out_of_stock: { label: 'Out of Stock', cls: 'b-red', icon: '✕' },
};

interface VendorCardProps {
  vendorProduct: VendorProductWithVendor;
  isLowest?: boolean;
}

export function VendorCard({ vendorProduct: vp, isLowest = false }: VendorCardProps) {
  const stock = STOCK_MAP[vp.stockStatus] ?? STOCK_MAP.in_stock;
  const link = vp.vendor.affiliateLink || vp.vendorUrl;
  const shipping = vp.shippingIncluded
    ? 'Shipping Included'
    : toNum(vp.shippingCost) > 0
      ? `Shipping ${formatPrice(toNum(vp.shippingCost))}`
      : 'Free Shipping';

  return (
    <div className={`vendor-card ${isLowest ? 'vendor-card-lowest' : ''}`}>
      <div className="vendor-card-row">
        <span className="vendor-card-name">{vp.vendor.name}</span>
        <span className="vendor-card-price">{formatPrice(toNum(vp.totalPrice))}</span>
      </div>
      <div className="vendor-card-row">
        <span className="vendor-card-shipping">{shipping}</span>
        <span className={`badge ${stock.cls}`}>
          {stock.icon} {stock.label}
        </span>
      </div>
      <div className="vendor-card-row vendor-card-footer">
        <span className="vendor-card-updated">
          Last Updated: {timeAgo(new Date(vp.lastChecked))}
        </span>
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary btn-sm vendor-card-buy"
        >
          BUY NOW <ExternalLink size={12} />
        </a>
      </div>
    </div>
  );
}
