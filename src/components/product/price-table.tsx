'use client';

import { formatPrice, timeAgo } from '@/lib/utils';
import type { VendorProductWithVendor } from '@/types';
import { ExternalLink } from 'lucide-react';

function toNum(v: unknown): number {
  if (typeof v === 'number') return v;
  if (typeof v === 'string') return parseFloat(v);
  if (v && typeof v === 'object' && 'toNumber' in v) return (v as { toNumber(): number }).toNumber();
  return 0;
}

interface PriceTableProps {
  vendorProducts: VendorProductWithVendor[];
}

const AVAILABILITY_LABELS: Record<string, { label: string; class: string }> = {
  IN_STOCK: { label: 'In Stock', class: 'b-green' },
  PREORDER: { label: 'Preorder', class: 'b-yellow' },
  GROUP_BUY: { label: 'Group Buy', class: 'b-blue' },
  COMING_SOON: { label: 'Coming Soon', class: 'b-orange' },
  OUT_OF_STOCK: { label: 'Out of Stock', class: 'b-red' },
  in_stock: { label: 'In Stock', class: 'b-green' },
  preorder: { label: 'Preorder', class: 'b-yellow' },
  group_buy: { label: 'Group Buy', class: 'b-blue' },
  coming_soon: { label: 'Coming Soon', class: 'b-orange' },
  out_of_stock: { label: 'Out of Stock', class: 'b-red' },
};

export function PriceTable({ vendorProducts }: PriceTableProps) {
  const sorted = [...vendorProducts].sort(
    (a, b) => toNum(a.effectivePrice) - toNum(b.effectivePrice)
  );

  const lowestId = sorted[0]?.id;

  return (
    <div className="overflow-x-auto">
      <table className="price-table">
        <thead>
          <tr>
            <th>Vendor</th>
            <th>Price</th>
            <th>Shipping</th>
            <th>Total</th>
            <th>Status</th>
            <th>Updated</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {sorted.map((vp) => {
            const isLowest = vp.id === lowestId;
            const statusKey = vp.availability || vp.stockStatus;
            const stock = AVAILABILITY_LABELS[statusKey] ?? AVAILABILITY_LABELS.IN_STOCK;
            const link = vp.vendor.affiliateLink || vp.vendorUrl;

            return (
              <tr key={vp.id} className={isLowest ? 'lowest' : ''}>
                <td>
                  <span className="font-bold">{vp.vendor.name}</span>
                </td>
                <td>{formatPrice(toNum(vp.price))}</td>
                <td>
                  {vp.shippingIncluded
                    ? 'Included'
                    : toNum(vp.shippingCost) > 0
                      ? formatPrice(toNum(vp.shippingCost))
                      : 'Free'}
                </td>
                <td className="font-bold">
                  {toNum(vp.effectivePrice) < toNum(vp.totalPrice) && (
                    <span style={{ fontSize: '.7rem', color: 'var(--text-dim)', textDecoration: 'line-through', textDecorationColor: 'var(--red)', marginRight: '6px' }}>
                      {formatPrice(toNum(vp.totalPrice))}
                    </span>
                  )}
                  {formatPrice(toNum(vp.effectivePrice))}
                  {isLowest && (
                    <span className="badge b-green ml-2">LOWEST</span>
                  )}
                  {(vp.coupons ?? []).filter((c) => c.enabled).length > 0 && (
                    <span className="badge b-yellow ml-1" style={{ fontSize: '.55rem', padding: '1px 4px' }}>🏷 COUPON</span>
                  )}
                </td>
                <td>
                  <span className={`badge ${stock.class}`}>{stock.label}</span>
                </td>
                <td className="text-[var(--text-dim)]">
                  {timeAgo(new Date(vp.lastCheckedAt || vp.lastChecked || Date.now()))}
                </td>
                <td>
                  <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary btn-sm inline-flex items-center gap-1"
                  >
                    Buy <ExternalLink size={12} />
                  </a>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
