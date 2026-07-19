import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getCategoryBySlug } from '@/lib/admin/product-categories';
import { ProductForm } from '@/components/admin/product-form';
import { KeyboardForm } from '@/components/admin/keyboard-form';
import { SwitchForm } from '@/components/admin/switch-form';
import { KeycapForm } from '@/components/admin/keycap-form';
import { MouseForm } from '@/components/admin/mouse-form';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ category: string }>;
}

export default async function NewCategoryProductPage({ params }: Props) {
  const { category: slug } = await params;
  const cat = getCategoryBySlug(slug);
  if (!cat) notFound();

  const [brands, vendors] = await Promise.all([
    prisma.brand.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    }),
    prisma.vendor.findMany({
      where: { enabled: true },
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    }),
  ]);

  if (slug === 'keyboards') {
    return (
      <KeyboardForm
        brands={brands}
        vendors={vendors}
        fixedProductType={cat.slug}
      />
    );
  }

  if (slug === 'switches') {
    return (
      <SwitchForm
        brands={brands}
        vendors={vendors}
        existingVendorProducts={[]}
      />
    );
  }

  if (slug === 'keycaps') {
    return (
      <KeycapForm
        brands={brands}
        vendors={vendors}
        existingVendorProducts={[]}
      />
    );
  }

  if (slug === 'mouse') {
    return (
      <MouseForm
        brands={brands}
        vendors={vendors}
        existingVendorProducts={[]}
      />
    );
  }

  return (
    <ProductForm
      brands={brands}
      vendors={vendors}
      fixedProductType={cat.slug}
    />
  );
}
