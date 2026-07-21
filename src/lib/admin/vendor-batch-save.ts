import { deleteVendorProduct, createVendorProduct, upsertVendorVariants } from '@/lib/admin/vendor-actions';
import type { VendorEntry, ExistingVendorProduct } from '@/components/admin/vendor-types';

export async function saveVendorEntries(
  productId: string,
  vendorEntries: VendorEntry[],
  existingVendorProducts: ExistingVendorProduct[],
) {
  const validEntries = vendorEntries.filter((ve) => ve.vendorId && ve.vendorUrl);

  for (const vp of existingVendorProducts) {
    if (!validEntries.some((ve) => ve.id === vp.id)) {
      await deleteVendorProduct(vp.id);
    }
  }

  for (const entry of validEntries) {
    const fd = new FormData();
    fd.set('vendorId', entry.vendorId);
    fd.set('productId', productId);
    fd.set('vendorUrl', entry.vendorUrl);
    fd.set('price', String(entry.price || 0));
    fd.set('shippingCost', String(entry.shippingCost || 0));
    fd.set('shippingIncluded', entry.shippingIncluded ? 'on' : '');
    fd.set('stockStatus', entry.stockStatus || 'in_stock');
    fd.set('affiliateLink', entry.affiliateLink);
    fd.set('coupons', JSON.stringify(entry.coupons.map(({ collapsed, ...c }) => c)));
    const result = await createVendorProduct(fd);
    if (result && 'id' in result && entry.variants.length > 0) {
      await upsertVendorVariants(result.id as string, entry.variants);
    }
  }
}
