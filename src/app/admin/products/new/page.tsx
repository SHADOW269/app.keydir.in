import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { ProductForm } from '@/components/admin/product-form';

export const dynamic = 'force-dynamic';

export default async function NewProductPage() {
  const [brands, categories] = await Promise.all([
    prisma.brand.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } }),
    prisma.category.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } }),
  ]);

  return <ProductForm brands={brands} categories={categories} />;
}
