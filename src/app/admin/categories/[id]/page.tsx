import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { CategoryForm } from '@/components/admin/category-form';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditCategoryPage({ params }: Props) {
  const { id } = await params;
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) notFound();
  return <CategoryForm category={category} />;
}
