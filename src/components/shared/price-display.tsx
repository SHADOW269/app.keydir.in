import { formatPrice } from '@/lib/utils';

interface PriceDisplayProps {
  price: number;
  originalPrice?: number | null;
  className?: string;
}

export function PriceDisplay({ price, originalPrice, className }: PriceDisplayProps) {
  const hasDiscount = originalPrice != null && originalPrice > price;
  return (
    <span className={className || 'product-card-price'}>
      {hasDiscount && (
        <span className="product-card-price-original">{formatPrice(originalPrice!)}</span>
      )}
      {formatPrice(price)}
    </span>
  );
}
