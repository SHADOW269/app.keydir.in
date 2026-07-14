import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Vendors — Admin' };

export default async function AdminVendorsPage() {
  const vendors = await prisma.vendor.findMany({
    include: { _count: { select: { vendorProducts: true } } },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="page-body">
      <div className="sec-head">
        <h2>ALL <em className="text-[var(--green)]">VENDORS</em></h2>
        <div className="flex items-center gap-3">
          <div className="sec-tag text-[var(--green)]">{vendors.length} VENDORS</div>
          <Link href="/admin/vendors/new" className="btn-primary btn-sm">+ ADD NEW</Link>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="price-table mb-8">
          <thead>
            <tr>
              <th>Name</th>
              <th>Website</th>
              <th>Products</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {vendors.map((v) => (
              <tr key={v.id}>
                <td className="font-bold">{v.name}</td>
                <td>
                  <a
                    href={v.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--blue)] underline"
                  >
                    {v.website}
                  </a>
                </td>
                <td>{v._count.vendorProducts}</td>
                <td>
                  <span className={`badge ${v.enabled ? 'b-green' : 'b-red'}`}>
                    {v.enabled ? 'Active' : 'Disabled'}
                  </span>
                </td>
                <td>
                  <Link href={`/admin/vendors/${v.id}`} className="btn-primary btn-sm">
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
