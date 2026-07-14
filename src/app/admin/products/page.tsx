import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { formatPrice } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Products — Admin' };

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    include: {
      brand: { select: { name: true } },
      category: { select: { name: true } },
      vendorProducts: { select: { totalPrice: true }, orderBy: { totalPrice: 'asc' }, take: 1 },
      _count: { select: { vendorProducts: true, votes: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return (
    <div className="page-body">
      <div className="sec-head">
        <h2>ALL <em className="text-[var(--yellow)]">PRODUCTS</em></h2>
        <div className="flex items-center gap-3">
          <div className="sec-tag text-[var(--yellow)]">{products.length} PRODUCTS</div>
          <Link href="/admin/products/new" className="btn-primary btn-sm">+ ADD NEW</Link>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="price-table mb-8">
          <thead>
            <tr>
              <th>Name</th>
              <th>Brand</th>
              <th>Category</th>
              <th>Lowest Price</th>
              <th>Vendors</th>
              <th>Votes</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td className="font-bold">{p.name}</td>
                <td className="text-[var(--text-muted)]">{p.brand?.name ?? '—'}</td>
                <td>{p.category.name}</td>
                <td className="text-[var(--green)] font-bold">
                  {p.vendorProducts[0]
                    ? formatPrice(Number(p.vendorProducts[0].totalPrice))
                    : '—'}
                </td>
                <td>{p._count.vendorProducts}</td>
                <td>{p._count.votes}</td>
                <td>
                  <Link
                    href={`/admin/products/${p.id}`}
                    className="btn-primary btn-sm"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
