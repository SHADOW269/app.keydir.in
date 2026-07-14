import Link from 'next/link';
import Image from 'next/image';
import { formatPrice } from '@/lib/utils';
import type { ProductCard as ProductCardType } from '@/types';

interface ProductCardProps {
  product: ProductCardType;
}

export function ProductCard({ product }: ProductCardProps) {
  const hasPrice = product.lowestPrice !== null;

  return (
    <Link href={`/products/${product.slug}`} className="product-card">
      <div className="product-card-img-wrap">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            width={400}
            height={300}
            className="product-card-img"
            loading="lazy"
          />
        ) : (
          <div className="product-card-img product-card-img-fallback">
            {product.name.charAt(0)}
          </div>
        )}
      </div>
      <div className="product-card-body">
        <div className="product-card-name">{product.name}</div>

        <div className="product-card-meta">
          {hasPrice && (
            <span className="product-card-price">
              {formatPrice(product.lowestPrice!)}
            </span>
          )}
          <span className="product-card-upvotes">▲{product.upvotes}</span>
        </div>

        {product.specs.length > 0 && (
          <div className="product-card-specs">
            {product.specs.slice(0, 4).map((spec, i) => (
              <span key={i} className="product-card-spec">{spec}</span>
            ))}
          </div>
        )}

        <div className="product-card-cta">
          Compare {product.vendorCount} Vendor{product.vendorCount !== 1 ? 's' : ''} →
        </div>
      </div>
    </Link>
  );
}
