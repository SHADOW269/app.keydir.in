'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useProduct } from '@/lib/hooks/use-product';
import { VendorCards } from '@/components/admin/vendor-cards';
import { CouponForm } from '@/components/admin/coupon-form';
import { HeroBanner } from '@/components/banner/hero-banner';

export default function EditProductPage({ params }) {
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch product data based on the category and product ID
    fetch(`/api/products/${params.category}/${params.id}`)
      .then(res => res.json())
      .then(data => {
        setProduct(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching product:', error);
        setLoading(false);
      });
  }, [params.category, params.id]);

  if (loading) return <div>Loading...</div>;
  if (!product) return <div>Product not found</div>;

  const handleSave = async () => {
    // Save product data to the server
    await fetch(`/api/products/${params.category}/${params.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    });
    router.push(`/admin/products/${params.category}`);
  };

  const handleDelete = async () => {
    // Delete product from the server
    await fetch(`/api/products/${params.category}/${params.id}`, {
      method: 'DELETE',
    });
    router.push(`/admin/products/${params.category}`);
  };

  return (
    <div className="edit-product-page">
      <h1>Edit Product</h1>
      <form onSubmit={handleSave}>
        {/* Basic Information */}
        <div>
          <label>Name:</label>
          <input type="text" value={product.name} onChange={(e) => setProduct({ ...product, name: e.target.value })} />
        </div>
        <div>
          <label>Description:</label>
          <textarea value={product.description} onChange={(e) => setProduct({ ...product, description: e.target.value })} />
        </div>

        {/* Images */}
        <div>
          <label>Image URL:</label>
          <input type="text" value={product.image} onChange={(e) => setProduct({ ...product, image: e.target.value })} />
        </div>

        {/* Specifications */}
        <div>
          <label>Specifications:</label>
          <textarea value={product.specifications} onChange={(e) => setProduct({ ...product, specifications: e.target.value })} />
        </div>

        {/* Vendor Offers */}
        <VendorCards
          productId={product.id}
          vendors={product.vendors || []}
          existingVendorProducts={product.existingVendorProducts || []}
          onChange={() => {}}
        />

        {/* Coupons */}
        <CouponForm
          coupons={product.coupons || []}
          onAddCoupon={(coupon) => setProduct({ ...product, coupons: [...(product.coupons || []), coupon] })}
          onUpdateCoupon={(index, updatedCoupon) => {
            const newCoupons = [...(product.coupons || [])];
            newCoupons[index] = updatedCoupon;
            setProduct({ ...product, coupons: newCoupons });
          }}
          onDeleteCoupon={(index) => {
            const newCoupons = [...(product.coupons || [])].filter((_, i) => i !== index);
            setProduct({ ...product, coupons: newCoupons });
          }}
        />

        {/* Variants */}
        <div>
          <label>Variants:</label>
          <textarea value={product.variants} onChange={(e) => setProduct({ ...product, variants: e.target.value })} />
        </div>

        {/* SEO */}
        <div>
          <label>SEO Title:</label>
          <input type="text" value={product.seoTitle} onChange={(e) => setProduct({ ...product, seoTitle: e.target.value })} />
        </div>
        <div>
          <label>SEO Description:</label>
          <textarea value={product.seoDescription} onChange={(e) => setProduct({ ...product, seoDescription: e.target.value })} />
        </div>

        {/* Metadata */}
        <div>
          <label>Metadata:</label>
          <textarea value={product.metadata} onChange={(e) => setProduct({ ...product, metadata: e.target.value })} />
        </div>

        {/* Save and Delete Buttons */}
        <button type="submit">Save</button>
        <button type="button" onClick={handleDelete}>Delete</button>
      </form>
    </div>
  );
}
