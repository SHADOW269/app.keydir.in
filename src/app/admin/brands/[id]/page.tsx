import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { BrandForm } from '@/components/admin/brand-form';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditBrandPage({ params }: Props) {
  const { id } = await params;
  const brand = await prisma.brand.findUnique({ where: { id } });
  if (!brand) notFound();
  return <BrandForm brand={brand} />;
}
