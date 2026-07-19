import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { BannerActions } from '@/components/admin/banner-actions';
import { DeleteBannerButton } from './delete-button';
import { DashboardGrid, KpiCard, SectionHeader } from '@/components/admin/dashboard';

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

  const active = banners.filter((b) => b.status === 'ACTIVE').length;
  const scheduled = banners.filter((b) => b.status === 'SCHEDULED').length;
  const draft = banners.filter((b) => b.status === 'DRAFT').length;

  return (
    <div className="page-body">
      <div className="dash-page-header">
        <div>
          <div className="dash-page-title">PROMOTIONS <em className="text-[var(--yellow)]">MANAGER</em></div>
          <div className="dash-page-desc">{banners.length} banners configured</div>
        </div>
        <Link href="/admin/banners/new" className="btn-primary btn-sm">+ NEW BANNER</Link>
      </div>

      <DashboardGrid>
        <SectionHeader title="Overview" span={12} />

        <KpiCard label="Total Banners" value={banners.length} icon="◆" color="var(--yellow)" span={3} />
        <KpiCard label="Active" value={active} icon="●" color="var(--green)" span={3} />
        <KpiCard label="Scheduled" value={scheduled} icon="◆" color="var(--blue)" span={3} />
        <KpiCard label="Drafts" value={draft} icon="○" color="var(--text-muted)" span={3} />

        <SectionHeader title="All Banners" span={12} />

        <div className="dash-panel" style={{ gridColumn: 'span 12' }}>
          <div className="dash-panel-header">Banner Directory</div>
          <div className="dash-panel-body" style={{ padding: 0 }}>
            <div className="overflow-x-auto">
              <table className="dash-table">
                <thead>
                  <tr>
                    <th className="dash-th">Name</th>
                    <th className="dash-th">Placement</th>
                    <th className="dash-th">Status</th>
                    <th className="dash-th">Start</th>
                    <th className="dash-th">End</th>
                    <th className="dash-th">Priority</th>
                    <th className="dash-th">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {banners.map((b) => (
                    <tr key={b.id}>
                      <td className="dash-td font-bold">{b.title}</td>
                      <td className="dash-td">
                        <div className="flex flex-wrap gap-1">
                          {b.locations.map((l) => (
                            <span key={l.location} className="badge b-yellow text-[10px]">{LOCATION_LABELS[l.location] || l.location}</span>
                          ))}
                        </div>
                      </td>
                      <td className="dash-td">
                        <BannerActions id={b.id} status={b.status} />
                      </td>
                      <td className="dash-td text-xs text-[var(--text-muted)] whitespace-nowrap">
                        {b.startDate ? new Date(b.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}
                      </td>
                      <td className="dash-td text-xs text-[var(--text-muted)] whitespace-nowrap">
                        {b.endDate ? new Date(b.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}
                      </td>
                      <td className="dash-td text-center font-bold">{b.priority}</td>
                      <td className="dash-td">
                        <div className="flex gap-2">
                          <Link href={`/admin/banners/${b.id}`} className="text-[var(--yellow)] hover:text-[var(--green)] font-[family-name:var(--f-m)] text-xs font-bold">
                            EDIT
                          </Link>
                          <DeleteBannerButton id={b.id} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </DashboardGrid>
    </div>
  );
}
