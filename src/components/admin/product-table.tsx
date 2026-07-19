import Link from 'next/link';
import { formatPrice } from '@/lib/utils';

interface ProductRow {
  id: string;
  name: string;
  brand: { name: string } | null;
  vendorProducts: { totalPrice: any }[];
  _count: { vendorProducts: number; votes: number };
}

interface Props {
  products: ProductRow[];
}

export function AdminProductTable({ products }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="price-table mb-8">
        <thead>
          <tr>
            <th>Name</th>
            <th>Brand</th>
            <th>Lowest Price</th>
            <th>Vendors</th>
            <th>Votes</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {products.length === 0 ? (
            <tr>
              <td colSpan={6} className="text-center text-[var(--text-dim)] py-8 font-[family-name:var(--f-m)] text-sm">
                No products found
              </td>
            </tr>
          ) : (
            products.map((p) => (
              <tr key={p.id}>
                <td className="font-bold">{p.name}</td>
                <td className="text-[var(--text-muted)]">{p.brand?.name ?? '—'}</td>
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
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
