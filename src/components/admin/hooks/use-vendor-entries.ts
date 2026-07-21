'use client';

import { useState, useCallback } from 'react';
import { deleteVendorProduct } from '@/lib/admin/vendor-actions';
import type { ExistingVendorProduct, VendorEntry, CouponEntry, VariantEntry } from '../vendor-types';

const EMPTY_COUPON: CouponEntry = {
  code: '', discountType: 'percentage', discountValue: 0, minimumOrderAmount: 0,
  expiryDate: '', couponUrl: '', description: '', enabled: true, collapsed: false,
};

const EMPTY_VARIANT: VariantEntry = {
  name: '', color: [], switches: [], keycaps: [], price: 0,
  stockStatus: 'in_stock', variantUrl: '', sku: '', isDefault: false,
};

function mapExistingToEntries(products: ExistingVendorProduct[]): VendorEntry[] {
  return products.map((vp) => ({
    id: vp.id,
    vendorId: vp.vendorId,
    vendorUrl: vp.vendorUrl,
    shippingCost: vp.shippingCost,
    affiliateLink: vp.affiliateLink || '',
    price: vp.price,
    stockStatus: vp.stockStatus,
    shippingIncluded: vp.shippingCost === 0,
    coupons: (vp.coupons ?? []).map((c) => ({
      id: c.id, code: c.code, discountType: c.discountType as CouponEntry['discountType'],
      discountValue: c.discountValue ?? 0, minimumOrderAmount: c.minimumOrderAmount ?? 0,
      expiryDate: c.expiryDate ? new Date(c.expiryDate).toISOString().slice(0, 10) : '',
      couponUrl: c.couponUrl || '', description: c.description || '', enabled: c.enabled, collapsed: true,
    })),
    variants: (vp.variants ?? []).map((v) => ({
      id: v.id, name: v.name, color: v.color ?? [], switches: v.switches ?? [], keycaps: v.keycaps ?? [],
      price: v.price, stockStatus: v.stockStatus, variantUrl: v.variantUrl ?? '', sku: v.sku ?? '', isDefault: v.isDefault,
    })),
  }));
}

export function useVendorEntries(existingVendorProducts: ExistingVendorProduct[], onChange?: () => void) {
  const [entries, setEntries] = useState<VendorEntry[]>(() => mapExistingToEntries(existingVendorProducts));

  const markChange = useCallback(() => onChange?.(), [onChange]);

  const addEntry = useCallback(() => {
    setEntries((p) => [...p, { vendorId: '', vendorUrl: '', shippingCost: 0, affiliateLink: '', price: 0, stockStatus: 'in_stock', shippingIncluded: true, coupons: [], variants: [] }]);
    markChange();
  }, [markChange]);

  const removeEntry = useCallback((idx: number) => {
    setEntries((p) => {
      const entry = p[idx];
      if (entry.id) deleteVendorProduct(entry.id);
      return p.filter((_, i) => i !== idx);
    });
    markChange();
  }, [markChange]);

  const updateEntry = useCallback((idx: number, field: keyof VendorEntry, value: string | number | boolean) => {
    setEntries((p) => p.map((e, i) => i === idx ? { ...e, [field]: value } : e));
    markChange();
  }, [markChange]);

  const addVariant = useCallback((vendorIdx: number) => {
    setEntries((p) => p.map((e, i) => i === vendorIdx ? {
      ...e, variants: [...e.variants, { ...EMPTY_VARIANT, isDefault: e.variants.length === 0 }],
    } : e));
    markChange();
  }, [markChange]);

  const removeVariant = useCallback((vendorIdx: number, variantIdx: number) => {
    setEntries((p) => p.map((e, i) => i === vendorIdx ? {
      ...e, variants: e.variants.filter((_, vi) => vi !== variantIdx),
    } : e));
    markChange();
  }, [markChange]);

  const updateVariant = useCallback((vendorIdx: number, variantIdx: number, field: keyof VariantEntry, value: unknown) => {
    setEntries((p) => p.map((e, i) => i === vendorIdx ? {
      ...e, variants: e.variants.map((v, vi) => vi === variantIdx ? { ...v, [field]: value } : v),
    } : e));
    markChange();
  }, [markChange]);

  const addCoupon = useCallback((vendorIdx: number) => {
    setEntries((p) => p.map((e, i) => i === vendorIdx ? {
      ...e, coupons: [...e.coupons, { ...EMPTY_COUPON }],
    } : e));
    markChange();
  }, [markChange]);

  const removeCoupon = useCallback((vendorIdx: number, couponIdx: number) => {
    setEntries((p) => p.map((e, i) => i === vendorIdx ? {
      ...e, coupons: e.coupons.filter((_, ci) => ci !== couponIdx),
    } : e));
    markChange();
  }, [markChange]);

  const updateCoupon = useCallback((vendorIdx: number, couponIdx: number, field: keyof CouponEntry, value: unknown) => {
    setEntries((p) => p.map((e, i) => i === vendorIdx ? {
      ...e, coupons: e.coupons.map((c, ci) => ci === couponIdx ? { ...c, [field]: value } : c),
    } : e));
    markChange();
  }, [markChange]);

  const toggleCouponCollapsed = useCallback((vendorIdx: number, couponIdx: number) => {
    setEntries((p) => p.map((e, i) => i === vendorIdx ? {
      ...e, coupons: e.coupons.map((c, ci) => ci === couponIdx ? { ...c, collapsed: !c.collapsed } : c),
    } : e));
  }, []);

  const getEntries = useCallback(() => entries, [entries]);

  return {
    entries,
    addEntry, removeEntry, updateEntry,
    addVariant, removeVariant, updateVariant,
    addCoupon, removeCoupon, updateCoupon, toggleCouponCollapsed,
    getEntries,
  };
}
