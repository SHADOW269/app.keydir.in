export interface ExistingCoupon {
  id: string; code: string; discountType: string; discountValue: number | null;
  minimumOrderAmount: number | null; expiryDate: Date | null; couponUrl: string | null;
  description: string | null; enabled: boolean;
}

export interface ExistingVariant {
  id: string; name: string; color: string[] | null; switches: string[] | null; keycaps: string[] | null;
  price: number; stockStatus: string; variantUrl: string | null; sku: string | null; isDefault: boolean;
}

export interface ExistingVendorProduct {
  id: string; vendorId: string; vendorUrl: string; shippingCost: number;
  affiliateLink: string | null; price: number; stockStatus: string;
  source: string;
  lastCheckedAt: Date | null; lastChecked?: Date | null;
  manualUpdatedAt: Date | null; lastManualUpdate?: Date | null;
  updatedBy: string | null;
  availability: string; scrapeStatus: string;
  scrapeError: string | null; lastSuccessfulAt: Date | null;
  scraperVersion: string | null; lastHttpStatus: number | null;
  responseTimeMs: number | null; manualOverride: boolean;
  shippingIncluded?: boolean;
  coupons?: ExistingCoupon[];
  variants?: ExistingVariant[];
}

export interface CouponEntry {
  id?: string;
  code: string;
  discountType: 'percentage' | 'flat' | 'free_shipping';
  discountValue: number;
  minimumOrderAmount: number;
  expiryDate: string;
  couponUrl: string;
  description: string;
  enabled: boolean;
  collapsed: boolean;
}

export interface VendorEntry {
  id?: string; vendorId: string; vendorUrl: string; shippingCost: number;
  affiliateLink: string; price: number; stockStatus: string;
  shippingIncluded: boolean;
  coupons: CouponEntry[];
  variants: VariantEntry[];
}

export interface VariantEntry {
  id?: string; name: string; color: string[]; switches: string[]; keycaps: string[];
  price: number; stockStatus: string; variantUrl: string; sku: string; isDefault: boolean;
}
