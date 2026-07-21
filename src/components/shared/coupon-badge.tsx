interface CouponBadgeProps {
  code: string;
  className?: string;
}

export function CouponBadge({ code, className }: CouponBadgeProps) {
  return (
    <span className={`product-card-coupon-badge ${className || ''}`}>
      🏷️ {code || 'COUPON'}
    </span>
  );
}
