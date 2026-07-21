import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function computeEffectivePrice(totalPrice: number, coupons: { discountType: string; discountValue: number; enabled: boolean }[]): number {
  let best = totalPrice;
  for (const c of coupons) {
    if (!c.enabled) continue;
    let after: number;
    if (c.discountType === 'percentage') {
      after = Math.round(totalPrice * (1 - c.discountValue / 100));
    } else if (c.discountType === 'flat') {
      after = totalPrice - c.discountValue;
    } else {
      continue; // free_shipping doesn't reduce price
    }
    if (after < best) best = after;
  }
  return Math.max(0, best);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}
