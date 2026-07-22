import { NextRequest, NextResponse } from 'next/server';
import { fetchProductListings, KEYBOARD_SPEC_CONFIG } from '@/lib/services/product-service';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const { products, total, page, pageSize, totalPages } = await fetchProductListings('keyboards', searchParams, KEYBOARD_SPEC_CONFIG);
  return NextResponse.json({ products, total, page, pageSize, totalPages });
}
