import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { SpecTable } from '@/components/product/spec-table';
import { VendorCard } from '@/components/product/vendor-card';
import { PriceHistoryChart } from '@/components/product/price-history-chart';
import { VoteWidget } from '@/components/product/vote-widget';
import { SaveButtons } from '@/components/product/save-buttons';
import { prisma } from '@/lib/prisma';
import { formatPrice } from '@/lib/utils';
import { getCurrentUser } from '@/lib/profile/actions';
import type { Metadata } from 'next';

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
      category: true,
      specifications: { include: { specField: true } },
      vendorProducts: {
        include: {
          vendor: true,
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
  const lowestPrice = product.vendorProducts[0]?.totalPrice ?? null;

  function priceNum(v: unknown): number {
    if (typeof v === 'number') return v;
    if (typeof v === 'string') return parseFloat(v);
    if (v && typeof v === 'object' && 'toNumber' in v) return (v as { toNumber(): number }).toNumber();
    return 0;
  }

  const allHistory = product.vendorProducts
    .flatMap((vp) =>
      vp.priceHistory.map((ph) => ({
        price: priceNum(ph.price),
        recordedAt: ph.recordedAt,
        vendor: vp.vendor.name,
      }))
    )
    .sort((a, b) => a.recordedAt.getTime() - b.recordedAt.getTime());

  return (
    <>
      <Navbar />

      <div className="page-body product-page">
        {/* Breadcrumb */}
        <div className="product-breadcrumb">
          <Link href="/" className="hover:text-[var(--text)]">Home</Link>
          {' / '}
          <Link href={`/${product.category.slug}`} className="hover:text-[var(--text)]">
            {product.category.name}
          </Link>
          {' / '}
          <span className="text-[var(--text)]">{product.name}</span>
        </div>

        {/* ═══ HERO ═══ */}
        <section className="product-hero">
          <div className="product-hero-image">
            <div className="neo-card overflow-hidden">
              {product.image ? (
                <Image
                  src={product.image}
                  alt={product.name}
                  width={600}
                  height={600}
                  className="w-full aspect-square object-cover"
                  priority
                />
              ) : (
                <div className="w-full aspect-square bg-[var(--surface-raised)] flex items-center justify-center text-7xl font-bold font-[family-name:var(--f-m)] text-[var(--text-dim)]">
                  {product.name.charAt(0)}
                </div>
              )}
            </div>
          </div>

          <div className="product-hero-info">
            <h1 className="product-hero-name">
              {product.name}
            </h1>

            <div className="product-hero-votes">
              <VoteWidget
                productId={product.id}
                upvotes={upvotes}
                downvotes={downvotes}
                userVote={userVote}
              />
              <span className="product-hero-score-label">
                ★ Community Score
              </span>
            </div>

            {lowestPrice && (
              <div className="product-hero-price">
                From {formatPrice(priceNum(lowestPrice))}
              </div>
            )}

            {product.description && (
              <p className="product-hero-desc">
                {product.description}
              </p>
            )}

            <div className="product-hero-actions">
              <SaveButtons
                productId={product.id}
                inCollection={inCollection}
              />
            </div>
          </div>
        </section>

        {/* ═══ SPECIFICATIONS ═══ */}
        <section className="product-section">
          <div className="sec-head">
            <h2>
              <em className="text-[var(--yellow)]">SPECIFICATIONS</em>
            </h2>
          </div>
          <SpecTable specifications={product.specifications} />
        </section>

        {/* ═══ AVAILABLE VENDORS ═══ */}
        <section className="product-section">
          <div className="sec-head">
            <h2>
              AVAILABLE <em className="text-[var(--green)]">VENDORS</em>
            </h2>
            <div className="sec-tag text-[var(--green)]">
              {product.vendorProducts.length} VENDOR{product.vendorProducts.length !== 1 ? 'S' : ''}
            </div>
          </div>
          <div className="vendor-cards">
            {product.vendorProducts.map((vp, i) => (
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
          <PriceHistoryChart history={allHistory} />
        </section>
      </div>

      <Footer />
    </>
  );
}
