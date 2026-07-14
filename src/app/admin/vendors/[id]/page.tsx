import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { VendorForm } from '@/components/admin/vendor-form';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditVendorPage({ params }: Props) {
  const { id } = await params;
  const vendor = await prisma.vendor.findUnique({ where: { id } });
  if (!vendor) notFound();
  return <VendorForm vendor={vendor} />;
}
