import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Categories — Admin' };

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: 'asc' },
  });

  return (
    <div className="page-body">
      <div className="sec-head">
        <h2>ALL <em className="text-[var(--pink)]">CATEGORIES</em></h2>
        <div className="flex items-center gap-3">
          <div className="sec-tag text-[var(--pink)]">{categories.length} CATEGORIES</div>
          <Link href="/admin/categories/new" className="btn-primary btn-sm">+ ADD NEW</Link>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="price-table mb-8">
          <thead>
            <tr>
              <th>Name</th>
              <th>Slug</th>
              <th>Icon</th>
              <th>Products</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id}>
                <td className="font-bold">{c.name}</td>
                <td className="text-[var(--text-dim)]">{c.slug}</td>
                <td>{c.icon ?? '—'}</td>
                <td>{c._count.products}</td>
                <td>
                  <Link href={`/admin/categories/${c.id}`} className="btn-primary btn-sm">Edit</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
