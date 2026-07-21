'use client';

import { useState, useCallback } from 'react';
import { checkVendorProduct, updateVendorStatus } from '@/lib/admin/vendor-actions';
import { scrapeVendorProduct, clearManualOverride } from '@/lib/admin/scraper-actions';
import type { VendorEntry } from '../vendor-types';

type CheckResult = { ok: boolean; message: string; scrapedPrice?: number; scrapedAvailability?: string; scraperVersion?: string } | null;

export function useVendorCardActions(entries: VendorEntry[]) {
  const [checking, setChecking] = useState<Record<number, boolean>>({});
  const [scraping, setScraping] = useState<Record<number, boolean>>({});
  const [updating, setUpdating] = useState<Record<number, boolean>>({});
  const [clearing, setClearing] = useState<Record<number, boolean>>({});
  const [checkResult, setCheckResult] = useState<Record<number, CheckResult>>({});

  const handleCheck = useCallback(async (idx: number) => {
    const entry = entries[idx];
    if (!entry.id) return;
    setChecking((p) => ({ ...p, [idx]: true }));
    setCheckResult((p) => ({ ...p, [idx]: null }));
    try {
      const result = await checkVendorProduct(entry.id);
      if ('error' in result) {
        setCheckResult((p) => ({ ...p, [idx]: { ok: false, message: String(result.error || 'Check failed') } }));
      } else {
        setCheckResult((p) => ({ ...p, [idx]: {
          ok: true,
          message: String(result.message || 'OK'),
          scrapedPrice: result.scrapedPrice ?? undefined,
          scrapedAvailability: result.scrapedAvailability,
          scraperVersion: result.scraperVersion,
        } }));
      }
    } catch {
      setCheckResult((p) => ({ ...p, [idx]: { ok: false, message: 'Network error' } }));
    }
    setChecking((p) => ({ ...p, [idx]: false }));
  }, [entries]);

  const handleScrape = useCallback(async (idx: number) => {
    const entry = entries[idx];
    if (!entry.id) return;
    setScraping((p) => ({ ...p, [idx]: true }));
    setCheckResult((p) => ({ ...p, [idx]: null }));
    try {
      const result = await scrapeVendorProduct(entry.id);
      if (result?.error) {
        setCheckResult((p) => ({ ...p, [idx]: { ok: false, message: String(result.error) } }));
      } else {
        setCheckResult((p) => ({ ...p, [idx]: {
          ok: true,
          message: `Scraped: ₹${result.price?.toLocaleString()} (${result.availability})`,
          scrapedPrice: result.price,
          scrapedAvailability: result.availability,
        } }));
        window.location.reload();
      }
    } catch {
      setCheckResult((p) => ({ ...p, [idx]: { ok: false, message: 'Network error' } }));
    }
    setScraping((p) => ({ ...p, [idx]: false }));
  }, [entries]);

  const handleUpdate = useCallback(async (idx: number) => {
    const entry = entries[idx];
    if (!entry.id) return;
    setUpdating((p) => ({ ...p, [idx]: true }));
    const fd = new FormData();
    fd.set('vendorProductId', entry.id);
    fd.set('price', String(entry.price || 0));
    fd.set('stockStatus', entry.stockStatus || 'in_stock');
    fd.set('shippingCost', String(entry.shippingCost || 0));
    fd.set('shippingIncluded', entry.shippingIncluded ? 'on' : '');
    fd.set('coupons', JSON.stringify(entry.coupons.map(({ collapsed, ...c }) => c)));
    await updateVendorStatus(fd);
    window.location.reload();
    setUpdating((p) => ({ ...p, [idx]: false }));
  }, [entries]);

  const handleClearOverride = useCallback(async (idx: number) => {
    const entry = entries[idx];
    if (!entry.id) return;
    setClearing((p) => ({ ...p, [idx]: true }));
    await clearManualOverride(entry.id);
    window.location.reload();
    setClearing((p) => ({ ...p, [idx]: false }));
  }, [entries]);

  return { checking, scraping, updating, clearing, checkResult, handleCheck, handleScrape, handleUpdate, handleClearOverride };
}
