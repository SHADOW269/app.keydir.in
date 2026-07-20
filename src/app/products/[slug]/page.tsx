import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { VendorCard } from '@/components/product/vendor-card';
import { PriceHistoryChart } from '@/components/product/price-history-chart';
import { ProductHeroCommunity } from '@/components/product/product-hero-community';
import { ProductHeroSpecs } from '@/components/product/product-hero-specs';
import { ProductSpecs } from '@/components/product/product-specs';
import { prisma } from '@/lib/prisma';
import { formatPrice, timeAgo } from '@/lib/utils';
import { getCurrentUser } from '@/lib/profile/actions';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { brand: true },
  });

  if (!product) return { title: 'Product Not Found' };

  return {
    title: `${product.name} — Compare Prices | KeyDir`,
    description: `Compare prices for ${product.name} across Indian vendors. Find the lowest price.`,
    openGraph: {
      title: `${product.name} — KeyDir`,
      description: `Compare prices for ${product.name} across Indian vendors.`,
      images: product.image ? [product.image] : [],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      brand: true,
      keyboardSpec: true,
      switchSpec: true,
      keycapSpec: true,
      mouseSpec: true,
      vendorProducts: {
        include: {
          vendor: true,
          variants: { orderBy: { createdAt: 'asc' } },
          priceHistory: {
            orderBy: { recordedAt: 'asc' },
            take: 500,
          },
        },
        where: { vendor: { enabled: true } },
        orderBy: { totalPrice: 'asc' },
      },
      votes: { select: { type: true } },
    },
  });

  if (!product) notFound();

  const serializedVendorProducts = product.vendorProducts.map((vp) => ({
    ...vp,
    price: Number(vp.price),
    shippingCost: Number(vp.shippingCost),
    totalPrice: Number(vp.totalPrice),
    variants: vp.variants.map((v) => ({
      ...v,
      color: v.color as string[] | null,
      switches: v.switches as string[] | null,
      keycaps: v.keycaps as string[] | null,
      price: Number(v.price),
    })),
  }));

  const currentUser = await getCurrentUser();

  let inCollection = false;
  let userVote: 'upvote' | 'downvote' | null = null;
  if (currentUser) {
    const [collectItem, voteItem] = await Promise.all([
      prisma.collection.findUnique({
        where: { profileId_productId: { profileId: currentUser.id, productId: product.id } },
      }),
      prisma.vote.findUnique({
        where: { profileId_productId: { profileId: currentUser.id, productId: product.id } },
      }),
    ]);
    inCollection = !!collectItem;
    userVote = (voteItem?.type as 'upvote' | 'downvote') || null;
  }

  const upvotes = product.votes.filter((v) => v.type === 'upvote').length;
  const downvotes = product.votes.filter((v) => v.type === 'downvote').length;
  const lowestPrice = serializedVendorProducts[0]?.totalPrice ?? null;
  const highestPrice = serializedVendorProducts.length > 1
    ? serializedVendorProducts[serializedVendorProducts.length - 1]?.totalPrice ?? null
    : null;
  const vendorCount = serializedVendorProducts.length;

  const lastUpdated = serializedVendorProducts.reduce<Date | null>((latest, vp) => {
    const newest = vp.priceHistory.at(-1)?.recordedAt ?? vp.updatedAt;
    return !latest || newest > latest ? newest : latest;
  }, null);

  function priceNum(v: unknown): number {
    if (typeof v === 'number') return v;
    if (typeof v === 'string') return parseFloat(v);
    if (v && typeof v === 'object' && 'toNumber' in v) return (v as { toNumber(): number }).toNumber();
    return 0;
  }

  const allHistory = serializedVendorProducts
    .flatMap((vp) =>
      vp.priceHistory.map((ph) => ({
        price: priceNum(ph.price),
        recordedAt: ph.recordedAt,
        vendor: vp.vendor.name,
      }))
    )
    .sort((a, b) => a.recordedAt.getTime() - b.recordedAt.getTime());

  const vendorColors: Record<string, string> = {};
  for (const vp of serializedVendorProducts) {
    if (vp.vendor.chartColor) {
      vendorColors[vp.vendor.name] = vp.vendor.chartColor;
    }
  }

  return (
    <>
      <Navbar />

      <div className="page-body product-page">
        {/* Breadcrumb */}
        <div className="product-breadcrumb">
          <Link href="/" className="hover:text-[var(--text)]">Home</Link>
          {' / '}
          <Link href={`/${product.productType}`} className="hover:text-[var(--text)]">
            {product.productType}
          </Link>
          {' / '}
          <span className="text-[var(--text)]">{product.name}</span>
        </div>

        {/* ═══ HERO ═══ */}
        <section className="product-hero">
          {/* Product Image panel */}
          <div className="product-hero-image">
            <div className="neo-card product-hero-panel product-hero-image-card">
              {product.image ? (
                <Image
                  src={product.image}
                  alt={product.name}
                  width={600}
                  height={600}
                  className="w-full aspect-square object-contain"
                  loading="eager"
                  priority
                />
              ) : (
                <div className="w-full aspect-square bg-[var(--surface-raised)] flex items-center justify-center text-7xl font-bold font-[family-name:var(--f-m)] text-[var(--text-dim)]">
                  {product.name.charAt(0)}
                </div>
              )}
            </div>
          </div>

          {/* Product Summary panel */}
          <div className="product-hero-info">
            <div className="neo-card product-hero-panel">
              <div className="product-hero-summary-body">
                <h1 className="product-hero-name">{product.name}</h1>

                {lowestPrice && (
                  <div className="product-hero-price-block">
                    <span className="product-hero-price-label">PRICE</span>
                    <div className="product-hero-price-row">
                      <span className="product-hero-price">{formatPrice(priceNum(lowestPrice))}</span>
                      {highestPrice && highestPrice !== lowestPrice && (
                        <>
                          <span className="product-hero-price-range-sep">→</span>
                          <span className="product-hero-price-alt">{formatPrice(priceNum(highestPrice))}</span>
                        </>
                      )}
                    </div>
                    <span className="product-hero-price-sub">
                      Lowest across {vendorCount} vendor{vendorCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                )}

                <ProductHeroSpecs
                  productType={product.productType}
                  spec={product.keyboardSpec ?? product.switchSpec ?? product.keycapSpec ?? product.mouseSpec}
                />

                <div className="product-hero-overview">
                  <span className="product-hero-overview-label">DESCRIPTION</span>
                  {product.description?.trim() ? (
                    <p className="product-hero-overview-text">{product.description}</p>
                  ) : (
                    <p className="product-hero-overview-text product-hero-overview-empty">No product overview available.</p>
                  )}
                </div>

                <ProductHeroCommunity
                  productId={product.id}
                  productSlug={product.slug}
                  productName={product.name}
                  productImage={product.image}
                  productPrice={lowestPrice}
                  productCategory={product.productType}
                  upvotes={upvotes}
                  downvotes={downvotes}
                  userVote={userVote}
                  inCollection={inCollection}
                  showVoting={product.productType === 'keyboards' || product.productType === 'mouse'}
                  showCompare={product.productType === 'keyboards' || product.productType === 'mouse'}
                />
              </div>
            </div>
          </div>
        </section>

        {/* ═══ HERO STATS ═══ */}
        <div className="product-hero-stats">
          <div className="product-stat-card">
            <div className="product-stat-label">Available</div>
            <div className="product-stat-big">{vendorCount}</div>
            <div className="product-stat-unit">VENDOR{vendorCount !== 1 ? 'S' : ''}</div>
          </div>
          <div className="product-stat-card">
            <div className="product-stat-label">Price Range</div>
            {lowestPrice ? (
              <div className="product-stat-price-row">
                <span className="product-stat-big">{formatPrice(priceNum(lowestPrice))}</span>
                {highestPrice && highestPrice !== lowestPrice && (
                  <>
                    <span className="product-stat-arrow">→</span>
                    <span className="product-stat-big alt">{formatPrice(priceNum(highestPrice))}</span>
                  </>
                )}
              </div>
            ) : (
              <div className="product-stat-big">—</div>
            )}
          </div>
          <div className="product-stat-card">
            <div className="product-stat-label">Last Updated</div>
            <div className="product-stat-big">
              {lastUpdated ? lastUpdated.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
            </div>
            {lastUpdated && (
              <div className="product-stat-unit">{timeAgo(lastUpdated)}</div>
            )}
          </div>
        </div>

        {/* ═══ AVAILABLE VENDORS ═══ */}
        <section className="product-section">
          <div className="sec-head">
            <h2>
              AVAILABLE <em className="text-[var(--green)]">VENDORS</em>
            </h2>
            <div className="sec-tag text-[var(--green)]">
              {serializedVendorProducts.length} VENDOR{serializedVendorProducts.length !== 1 ? 'S' : ''}
            </div>
          </div>
          <div className="vendor-cards">
            {serializedVendorProducts.map((vp, i) => (
              <VendorCard
                key={vp.id}
                vendorProduct={vp}
                isLowest={i === 0}
              />
            ))}
          </div>
        </section>

        {/* ═══ PRICE HISTORY ═══ */}
        <section className="product-section">
          <div className="sec-head">
            <h2>
              <em className="text-[var(--yellow)]">PRICE HISTORY</em>
            </h2>
          </div>
          <PriceHistoryChart history={allHistory} vendorColors={vendorColors} />
        </section>

        {/* ═══ SPECIFICATIONS ═══ */}
        <ProductSpecs
          productType={product.productType}
          spec={product.keyboardSpec ?? product.switchSpec ?? product.keycapSpec ?? product.mouseSpec}
        />
      </div>

      <Footer />
    </>
  );
}
