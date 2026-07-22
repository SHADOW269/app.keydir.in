import { NextRequest, NextResponse } from 'next/server';
import { fetchProductListings, SWITCH_SPEC_CONFIG } from '@/lib/services/product-service';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const { products, total, page, pageSize, totalPages } = await fetchProductListings('switches', searchParams, SWITCH_SPEC_CONFIG, {
    defaultSort: 'popular',
    includeUserVotes: false,
  });
  return NextResponse.json({ products, total, page, pageSize, totalPages });
}
