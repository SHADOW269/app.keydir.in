'use client';

import { useState } from 'react';

interface CouponFormProps {
  coupons: any[];
  onAddCoupon: (coupon: any) => void;
  onUpdateCoupon: (index: number, updatedCoupon: any) => void;
  onDeleteCoupon: (index: number) => void;
}

export default function CouponForm({ coupons, onAddCoupon, onUpdateCoupon, onDeleteCoupon }: CouponFormProps) {
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    discount: 0,
    description: ''
  });

  const handleAddCoupon = () => {
    if (newCoupon.code && newCoupon.discount > 0) {
      onAddCoupon(newCoupon);
      setNewCoupon({ code: '', discount: 0, description: '' });
    }
  };

  return (
    <div className="coupon-form">
      <h2>Coupons</h2>
      {coupons.map((coupon, index) => (
        <div key={index} className="coupon-item">
          <input
            type="text"
            placeholder="Coupon Code"
            value={coupon.code}
            onChange={(e) => onUpdateCoupon(index, { ...coupon, code: e.target.value })}
          />
          <input
            type="number"
            placeholder="Discount (%)"
            value={coupon.discount}
            onChange={(e) => onUpdateCoupon(index, { ...coupon, discount: parseFloat(e.target.value) || 0 })}
          />
          <textarea
            placeholder="Description"
            value={coupon.description}
            onChange={(e) => onUpdateCoupon(index, { ...coupon, description: e.target.value })}
          />
          <button type="button" onClick={() => onDeleteCoupon(index)}>Delete</button>
        </div>
      ))}
      <div className="new-coupon">
        <input
          type="text"
          placeholder="New Coupon Code"
          value={newCoupon.code}
          onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value })}
        />
        <input
          type="number"
          placeholder="Discount (%)"
          value={newCoupon.discount}
          onChange={(e) => setNewCoupon({ ...newCoupon, discount: parseFloat(e.target.value) || 0 })}
        />
        <textarea
          placeholder="Description"
          value={newCoupon.description}
          onChange={(e) => setNewCoupon({ ...newCoupon, description: e.target.value })}
        />
        <button type="button" onClick={handleAddCoupon}>Add Coupon</button>
      </div>
    </div>
  );
}
