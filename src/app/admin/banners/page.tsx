import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { BannerActions } from '@/components/admin/banner-actions';
import { DeleteBannerButton } from './delete-button';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Promotions — Admin' };

const LOCATION_LABELS: Record<string, string> = {
  home: 'Home', keyboards: 'Keyboards', switches: 'Switches', keycaps: 'Keycaps',
  mouse: 'Mouse', vendors: 'Vendors', builders: 'Builders', brands: 'Brands',
  search: 'Search Results', guide: 'Guide', about: 'About',
};

export default async function AdminPromotionsPage() {
  const banners = await prisma.banner.findMany({
    orderBy: [{ priority: 'asc' }, { createdAt: 'desc' }],
    include: { locations: true },
  });

  return (
    <div className="page-body">
      <div className="sec-head">
        <h2>PROMOTIONS <em className="text-[var(--yellow)]">MANAGER</em></h2>
        <div className="flex items-center gap-3">
          <div className="sec-tag text-[var(--yellow)]">{banners.length} BANNERS</div>
          <Link href="/admin/banners/new" className="btn-primary btn-sm">+ NEW BANNER</Link>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="price-table mb-8">
          <thead>
            <tr>
              <th>Name</th>
              <th>Placement</th>
              <th>Status</th>
              <th>Start</th>
              <th>End</th>
              <th>Priority</th>
              <th />
              <th />
            </tr>
          </thead>
          <tbody>
            {banners.map((b) => (
              <tr key={b.id}>
                <td className="font-bold">{b.title}</td>
                <td>
                  <div className="flex flex-wrap gap-1">
                    {b.locations.map((l) => (
                      <span key={l.location} className="badge b-yellow text-[10px]">{LOCATION_LABELS[l.location] || l.location}</span>
                    ))}
                  </div>
                </td>
                <td>
                  <BannerActions id={b.id} status={b.status} />
                </td>
                <td className="text-xs text-[var(--text-muted)] whitespace-nowrap">
                  {b.startDate ? new Date(b.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}
                </td>
                <td className="text-xs text-[var(--text-muted)] whitespace-nowrap">
                  {b.endDate ? new Date(b.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}
                </td>
                <td className="text-center font-bold">{b.priority}</td>
                <td>
                  <Link href={`/admin/banners/${b.id}`} className="btn-primary btn-sm">Edit</Link>
                </td>
                <td>
                  <DeleteBannerButton id={b.id} />
                </td>
              </tr>
            ))}
            {banners.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center py-8 text-[var(--text-muted)]">
                  No banners yet. Create one to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
