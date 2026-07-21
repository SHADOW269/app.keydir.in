import { prisma } from '@/lib/prisma';
import { computeEffectivePrice } from '@/lib/utils';

export async function recomputeEffectivePrice(vendorProductId: string) {
  const vp = await prisma.vendorProduct.findUnique({ where: { id: vendorProductId }, select: { totalPrice: true } });
  if (!vp) return;
  const coupons = await prisma.vendorProductCoupon.findMany({ where: { vendorProductId }, select: { discountType: true, discountValue: true, enabled: true } });
  const effectivePrice = computeEffectivePrice(Number(vp.totalPrice), coupons);
  await prisma.vendorProduct.update({ where: { id: vendorProductId }, data: { effectivePrice, bestFinalPrice: effectivePrice } });
}
