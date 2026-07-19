import Link from 'next/link';
import Image from 'next/image';
import { formatPrice } from '@/lib/utils';
import type { ProductCard as ProductCardType } from '@/types';

interface ProductCardProps {
  product: ProductCardType;
  variant?: 'listing' | 'profile';
  brand?: string;
  onRemove?: (id: string) => void;
  removing?: boolean;
  collectionItemId?: string;
}

export function ProductCard({ product, variant = 'listing', brand, onRemove, removing, collectionItemId }: ProductCardProps) {
  if (variant === 'profile') {
    return (
      <div className="profile-product-card">
        <Link href={`/products/${product.slug}`} className="profile-product-link">
          {product.image ? (
            <div
              className="profile-product-img"
              style={{ backgroundImage: `url(${product.image})` }}
            />
          ) : (
            <div className="profile-product-img profile-product-placeholder">
              {product.name.charAt(0)}
            </div>
          )}
          <div className="profile-product-info">
            <div className="profile-product-brand">
              {brand ?? 'Unknown'}
            </div>
            <div className="profile-product-name">{product.name}</div>
          </div>
        </Link>
        {onRemove && collectionItemId && (
          <button
            className="profile-product-remove"
            onClick={() => onRemove(collectionItemId)}
            disabled={removing}
          >
            {removing ? '...' : '\u00d7'}
          </button>
        )}
      </div>
    );
  }

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

        <div className="product-card-cta">
          Compare {product.vendorCount} Vendor{product.vendorCount !== 1 ? 's' : ''} →
        </div>
      </div>
    </Link>
  );
}
