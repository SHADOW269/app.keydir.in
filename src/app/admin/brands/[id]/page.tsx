import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { BrandForm } from '@/components/admin/brand-form';

export const dynamic = 'force-dynamic';

export default async function EditBrandPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const brand = await prisma.brand.findUnique({ where: { id } });
  if (!brand) notFound();

  const [productCount, priceAgg, lastProduct] = await Promise.all([
    prisma.product.count({ where: { brandId: id } }),
    prisma.vendorProduct.aggregate({
      where: { product: { brandId: id } },
      _min: { price: true },
      _max: { price: true },
    }),
    prisma.product.findFirst({ where: { brandId: id }, orderBy: { createdAt: 'desc' }, select: { createdAt: true } }),
  ]);

  return (
    <BrandForm
      brand={brand}
      stats={{
        productCount,
        lowestPrice: priceAgg._min.price,
        highestPrice: priceAgg._max.price,
        lastProductDate: lastProduct?.createdAt?.toISOString() ?? null,
      }}
    />
  );
}
