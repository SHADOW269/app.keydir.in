import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { ProductForm } from '@/components/admin/product-form';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;

  const [product, brands, categories, specFields, existingSpecs] = await Promise.all([
    prisma.product.findUnique({ where: { id } }),
    prisma.brand.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } }),
    prisma.category.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } }),
    prisma.specField.findMany({
      orderBy: [{ group: 'asc' }, { order: 'asc' }],
      select: { id: true, name: true, slug: true, group: true, type: true, options: true, order: true },
    }),
    prisma.specification.findMany({
      where: { productId: id },
      select: { specFieldId: true, value: true },
    }),
  ]);

  if (!product) notFound();

  return (
    <ProductForm
      product={product}
      brands={brands}
      categories={categories}
      specFields={specFields}
      existingSpecs={existingSpecs}
    />
  );
}
