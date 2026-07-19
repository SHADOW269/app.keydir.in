import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getCategoryBySlug } from '@/lib/admin/product-categories';
import { AdminProductTable } from '@/components/admin/product-table';
import { ProductForm } from '@/components/admin/product-form';
import { KeyboardForm } from '@/components/admin/keyboard-form';
import { SwitchForm } from '@/components/admin/switch-form';
import { KeycapForm } from '@/components/admin/keycap-form';
import { MouseForm } from '@/components/admin/mouse-form';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const cat = getCategoryBySlug(slug);
  if (cat) return { title: `${cat.label} — Admin` };
  return { title: 'Edit Product — Admin' };
}

export default async function ProductSlugPage({ params }: Props) {
  const { slug } = await params;

  const cat = getCategoryBySlug(slug);

  if (cat) {
    const products = await prisma.product.findMany({
      where: { productType: cat.slug },
      include: {
        brand: { select: { name: true } },
        vendorProducts: { orderBy: { totalPrice: 'asc' }, take: 1, select: { totalPrice: true } },
        _count: { select: { vendorProducts: true, votes: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return (
      <div className="page-body">
        <div className="sec-head">
          <h2>
            <span className="mr-2">{cat.icon}</span>
            {cat.label.toUpperCase()} <em className="text-[var(--yellow)]">PRODUCTS</em>
          </h2>
          <div className="flex items-center gap-3">
            <div className="sec-tag text-[var(--yellow)]">{products.length} PRODUCTS</div>
            <Link href={`/admin/products/new/${cat.slug}`} className="btn-primary btn-sm">
              + ADD {cat.singular.toUpperCase()}
            </Link>
          </div>
        </div>
        <AdminProductTable products={products} />
      </div>
    );
  }

  const product = await prisma.product.findUnique({ where: { id: slug } });
  if (!product) notFound();

  const [brands, vendors, existingVendorProducts] = await Promise.all([
    prisma.brand.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } }),
    prisma.vendor.findMany({
      where: { enabled: true },
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    }),
    prisma.vendorProduct.findMany({
      where: { productId: slug },
      select: {
        id: true, vendorId: true, vendorUrl: true, shippingCost: true,
        affiliateLink: true, price: true, stockStatus: true, lastCheckedAt: true,
        manualUpdatedAt: true, updatedBy: true, source: true,
        availability: true, scrapeStatus: true, scrapeError: true,
        lastSuccessfulAt: true, scraperVersion: true,
        lastHttpStatus: true, responseTimeMs: true, manualOverride: true,
        variants: {
          orderBy: { createdAt: 'asc' },
          select: {
            id: true, name: true, color: true, switches: true, keycaps: true,
            price: true, stockStatus: true, variantUrl: true, sku: true, isDefault: true,
          },
        },
      },
    }).then((vps) => vps.map((vp) => ({
      ...vp,
      shippingCost: Number(vp.shippingCost),
      price: Number(vp.price),
      lastChecked: vp.lastCheckedAt,
      lastManualUpdate: vp.manualUpdatedAt,
      variants: vp.variants.map((v) => ({
        ...v,
        color: v.color as string[] | null,
        switches: v.switches as string[] | null,
        keycaps: v.keycaps as string[] | null,
        price: Number(v.price),
      })),
    }))),
  ]);

  const isKeyboard = product.productType === 'keyboards';

  if (isKeyboard) {
    const keyboardSpec = await prisma.keyboardSpec.findUnique({
      where: { productId: slug },
    });
    const serializedSpec = keyboardSpec ? {
      ...keyboardSpec,
      keyboardStyle: keyboardSpec.keyboardStyle as string[] | null,
      colors: keyboardSpec.colors as string[] | null,
      surfaceFinish: keyboardSpec.surfaceFinish as string[] | null,
      mountingStyle: keyboardSpec.mountingStyle as string[] | null,
      plateMaterial: keyboardSpec.plateMaterial as string[] | null,
      stabilizerCompat: keyboardSpec.stabilizerCompat as string[] | null,
      stabilizerLayout: keyboardSpec.stabilizerLayout as string[] | null,
      foamMaterial: keyboardSpec.foamMaterial as string[] | null,
      foamPlacement: keyboardSpec.foamPlacement as string[] | null,
      pcbType: keyboardSpec.pcbType as string[] | null,
      connectivity: keyboardSpec.connectivity as string[] | null,
      firmware: keyboardSpec.firmware as string[] | null,
      switchCompat: keyboardSpec.switchCompat as string[] | null,
      switchType: keyboardSpec.switchType as string[] | null,
      switchBrand: keyboardSpec.switchBrand as string[] | null,
      switchModel: keyboardSpec.switchModel as string[] | null,
      keycapMaterial: keyboardSpec.keycapMaterial as string[] | null,
      keycapLegendType: keyboardSpec.keycapLegendType as string[] | null,
      keycapLegendPlacement: keyboardSpec.keycapLegendPlacement as string[] | null,
      includedAccessories: keyboardSpec.includedAccessories as string[] | null,
    } : null;

    return (
      <KeyboardForm
        product={product}
        keyboardSpec={serializedSpec}
        brands={brands}
        vendors={vendors}
        existingVendorProducts={existingVendorProducts}
      />
    );
  }

  if (product.productType === 'switches') {
    const [switchSpec, productImages] = await Promise.all([
      prisma.switchSpec.findUnique({ where: { productId: slug } }),
      prisma.productImage.findMany({ where: { productId: slug }, orderBy: { sortOrder: 'asc' } }),
    ]);
    const serializedProduct = {
      ...product,
      releaseDate: product.releaseDate ? product.releaseDate.toISOString().split('T')[0] : null,
      createdAt: product.createdAt,
    };
    const serializedSpec = switchSpec ? {
      ...switchSpec,
      switchCompat: switchSpec.switchCompat as string[] | null,
      switchType: switchSpec.switchType as string[] | null,
      switchBrand: switchSpec.switchBrand as string[] | null,
      switchModel: switchSpec.switchModel as string[] | null,
    } : null;
    return (
      <SwitchForm
        product={serializedProduct}
        brands={brands}
        vendors={vendors}
        existingVendorProducts={existingVendorProducts}
        switchSpec={serializedSpec}
        productImages={productImages.map((img) => ({
          id: img.id,
          url: img.url,
          alt: img.alt ?? undefined,
          sortOrder: img.sortOrder,
          isPrimary: img.isPrimary,
        }))}
      />
    );
  }

  if (product.productType === 'keycaps') {
    const [keycapSpec, productImages] = await Promise.all([
      prisma.keycapSpec.findUnique({ where: { productId: slug } }),
      prisma.productImage.findMany({ where: { productId: slug }, orderBy: { sortOrder: 'asc' } }),
    ]);
    const serializedProduct = {
      ...product,
      releaseDate: product.releaseDate ? product.releaseDate.toISOString().split('T')[0] : null,
      createdAt: product.createdAt,
    };
    const serializedSpec = keycapSpec ? {
      ...keycapSpec,
      keycapProfile: keycapSpec.keycapProfile as string[] | null,
      keycapLayoutSupport: keycapSpec.keycapLayoutSupport as string[] | null,
      keycapMaterial: keycapSpec.keycapMaterial as string[] | null,
      keycapManufacturing: keycapSpec.keycapManufacturing as string[] | null,
      keycapLegends: keycapSpec.keycapLegends as string[] | null,
      keycapLegendPlacement: keycapSpec.keycapLegendPlacement as string[] | null,
      keycapLanguage: keycapSpec.keycapLanguage as string[] | null,
      keycapKeyCount: keycapSpec.keycapKeyCount as string[] | null,
      keycapStemCompat: keycapSpec.keycapStemCompat as string[] | null,
      keycapManufacturer: keycapSpec.keycapManufacturer as string[] | null,
    } : null;
    return (
      <KeycapForm
        product={serializedProduct}
        brands={brands}
        vendors={vendors}
        existingVendorProducts={existingVendorProducts}
        keycapSpec={serializedSpec}
        productImages={productImages.map((img) => ({
          id: img.id,
          url: img.url,
          alt: img.alt ?? undefined,
          sortOrder: img.sortOrder,
          isPrimary: img.isPrimary,
        }))}
      />
    );
  }

  if (product.productType === 'mouse') {
    const [mouseSpec, productImages] = await Promise.all([
      prisma.mouseSpec.findUnique({ where: { productId: slug } }),
      prisma.productImage.findMany({ where: { productId: slug }, orderBy: { sortOrder: 'asc' } }),
    ]);
    const serializedProduct = {
      ...product,
      releaseDate: product.releaseDate ? product.releaseDate.toISOString().split('T')[0] : null,
      createdAt: product.createdAt,
    };
    const serializedSpec = mouseSpec ? {
      ...mouseSpec,
      mouseConnection: mouseSpec.mouseConnection as string[] | null,
      mousePollingRate: mouseSpec.mousePollingRate as string[] | null,
      mouseGripType: mouseSpec.mouseGripType as string[] | null,
      mouseCompatibility: mouseSpec.mouseCompatibility as string[] | null,
      mouseAccessories: mouseSpec.mouseAccessories as string[] | null,
    } : null;
    return (
      <MouseForm
        product={serializedProduct}
        brands={brands}
        vendors={vendors}
        existingVendorProducts={existingVendorProducts}
        mouseSpec={serializedSpec}
        productImages={productImages.map((img) => ({
          id: img.id,
          url: img.url,
          alt: img.alt ?? undefined,
          sortOrder: img.sortOrder,
          isPrimary: img.isPrimary,
        }))}
      />
    );
  }

  const serializedProduct = {
    ...product,
    releaseDate: product.releaseDate ? product.releaseDate.toISOString().split('T')[0] : null,
    createdAt: product.createdAt,
  };

  return (
    <ProductForm
      product={serializedProduct}
      brands={brands}
      vendors={vendors}
      existingVendorProducts={existingVendorProducts}
    />
  );
}
