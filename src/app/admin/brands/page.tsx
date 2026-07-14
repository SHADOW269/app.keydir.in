import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Brands — Admin' };

export default async function AdminBrandsPage() {
  const brands = await prisma.brand.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: 'asc' },
  });

  return (
    <div className="page-body">
      <div className="sec-head">
        <h2>ALL <em className="text-[var(--blue)]">BRANDS</em></h2>
        <div className="flex items-center gap-3">
          <div className="sec-tag text-[var(--blue)]">{brands.length} BRANDS</div>
          <Link href="/admin/brands/new" className="btn-primary btn-sm">+ ADD NEW</Link>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="price-table mb-8">
          <thead>
            <tr>
              <th>Name</th>
              <th>Slug</th>
              <th>Products</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {brands.map((b) => (
              <tr key={b.id}>
                <td className="font-bold">{b.name}</td>
                <td className="text-[var(--text-dim)]">{b.slug}</td>
                <td>{b._count.products}</td>
                <td>
                  <Link href={`/admin/brands/${b.id}`} className="btn-primary btn-sm">
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
