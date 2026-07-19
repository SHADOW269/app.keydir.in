import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { PRODUCT_CATEGORIES } from '@/lib/admin/product-categories';
import { DashboardGrid, KpiCard, ChartCard, SectionHeader, ActivityFeed, StatusCard } from '@/components/admin/dashboard';
import { ProductBarChart, VotePieChart } from '@/components/admin/dashboard/charts';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Admin — KeyDir' };

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default async function AdminPage() {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(now.getTime() - 7 * 86400000);

  const [
    productCount, vendorCount, brandCount,
    userCount, voteCount, votesToday,
    usersThisWeek, productsThisWeek,
    recentProducts, recentUsers, recentVotes, recentCollections,
    productTypeCounts,
    upvotes, downvotes,
    enabledVendors, disabledVendors,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.vendor.count(),
    prisma.brand.count(),
    prisma.profile.count(),
    prisma.vote.count(),
    prisma.vote.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.profile.count({ where: { createdAt: { gte: weekAgo } } }),
    prisma.product.count({ where: { createdAt: { gte: weekAgo } } }),
    prisma.product.findMany({ orderBy: { createdAt: 'desc' }, take: 8, include: { brand: { select: { name: true } } } }),
    prisma.profile.findMany({ orderBy: { createdAt: 'desc' }, take: 5, select: { username: true, displayName: true, createdAt: true } }),
    prisma.vote.findMany({ orderBy: { createdAt: 'desc' }, take: 8, include: { profile: { select: { username: true } }, product: { select: { name: true, slug: true } } } }),
    prisma.collection.findMany({ orderBy: { createdAt: 'desc' }, take: 5, include: { profile: { select: { username: true } }, product: { select: { name: true, slug: true } } } }),
    prisma.product.groupBy({ by: ['productType'], _count: true }),
    prisma.vote.count({ where: { type: 'upvote' } }),
    prisma.vote.count({ where: { type: 'downvote' } }),
    prisma.vendor.findMany({ where: { enabled: true }, select: { name: true } }),
    prisma.vendor.findMany({ where: { enabled: false }, select: { name: true } }),
  ]);

  const categoryChartData = PRODUCT_CATEGORIES.map((cat) => {
    const match = productTypeCounts.find((pt) => pt.productType === cat.slug);
    return { name: cat.label, count: match?._count ?? 0 };
  });

  const voteChartData = [
    { name: 'Upvotes', value: upvotes },
    { name: 'Downvotes', value: downvotes },
  ].filter((d) => d.value > 0);

  const activity: { id: string; icon: string; text: string; time: string; color: string }[] = [];
  for (const p of recentProducts) {
    activity.push({ id: `p-${p.id}`, icon: '◆', text: `New product: ${p.name}`, time: timeAgo(p.createdAt), color: 'var(--yellow)' });
  }
  for (const c of recentCollections) {
    activity.push({ id: `c-${c.id}`, icon: '◇', text: `${c.profile.username} added ${c.product.name}`, time: timeAgo(c.createdAt), color: 'var(--purple)' });
  }
  activity.sort((a, b) => {
    const parse = (s: string) => { const n = parseInt(s); return s.includes('m') ? n * 60 : s.includes('h') ? n * 3600 : s.includes('d') ? n * 86400 : n; };
    return parse(a.time) - parse(b.time);
  });

  return (
    <div className="page-body">
      <div className="dash-page-header">
        <div>
          <div className="dash-page-title">OPERATIONS <em className="text-[var(--yellow)]">CENTER</em></div>
          <div className="dash-page-desc">Real-time platform metrics and system health</div>
        </div>
        <div className="dash-page-meta">
          <span className="dash-live-dot" />LIVE
        </div>
      </div>

      <DashboardGrid>
        <SectionHeader title="Key Metrics" span={12} />

        <KpiCard label="Products" value={productCount} icon="◆" color="var(--yellow)" span={3}
          trend={productsThisWeek > 0 ? { value: `${productsThisWeek} this week`, positive: true } : undefined} />
        <KpiCard label="Vendors" value={vendorCount} icon="◇" color="var(--green)" span={3}
          trend={{ value: `${enabledVendors.length} active`, positive: true }} />
        <KpiCard label="Brands" value={brandCount} icon="◆" color="var(--blue)" span={3} />
        <KpiCard label="Users" value={userCount} icon="◆" color="var(--purple)" span={3}
          trend={usersThisWeek > 0 ? { value: `${usersThisWeek} this week`, positive: true } : undefined} />

        <SectionHeader title="Analytics" span={12} />

        <ChartCard title="Products by Category" subtitle="Distribution across product types" span={6} height={260}>
          <ProductBarChart data={categoryChartData} />
        </ChartCard>

        <ChartCard title="Vote Distribution" subtitle="Community sentiment" span={6} height={260}>
          {voteChartData.length > 0 ? (
            <VotePieChart data={voteChartData} />
          ) : (
            <div className="dash-empty-sm">No votes yet</div>
          )}
        </ChartCard>

        <SectionHeader title="Activity & Health" span={12} />

        <ActivityFeed items={activity} title="Recent Activity" span={8} />

        <div className="flex flex-col gap-4" style={{ gridColumn: 'span 4' }}>
          <StatusCard title="Database" status="healthy" details="Supabase PostgreSQL" span={4} />
          <StatusCard title="Scraper" status="healthy" details="Cron every 6h" span={4} />
          <StatusCard title="Auth" status="healthy" details="Supabase Auth" span={4} />
          <StatusCard title="Storage" status="healthy" details="Supabase Storage" span={4} />
        </div>

        <SectionHeader title="Quick Actions" span={12} />

        {[
          { label: 'Add Keyboard', href: '/admin/products/new/keyboards', color: 'var(--yellow)' },
          { label: 'Add Switch', href: '/admin/products/new/switches', color: 'var(--yellow)' },
          { label: 'Add Keycap', href: '/admin/products/new/keycaps', color: 'var(--yellow)' },
          { label: 'Add Mouse', href: '/admin/products/new/mouse', color: 'var(--yellow)' },
          { label: 'Add Vendor', href: '/admin/vendors/new', color: 'var(--green)' },
          { label: 'Add Brand', href: '/admin/brands/new', color: 'var(--blue)' },
          { label: 'Manage Banners', href: '/admin/banners/new', color: 'var(--orange)' },
          { label: 'View Reports', href: '/admin/community', color: 'var(--cyan)' },
        ].map((a) => (
          <Link key={a.label} href={a.href} className="dash-kpi" style={{ gridColumn: 'span 3' }}>
            <div className="dash-kpi-label" style={{ color: a.color }}>{a.label}</div>
            <div className="dash-kpi-value" style={{ color: a.color, fontSize: '1.2rem' }}>+ {a.label}</div>
          </Link>
        ))}

        <SectionHeader title="Recent Users" span={6} />

        <div className="dash-panel" style={{ gridColumn: 'span 6' }}>
          <div className="dash-panel-header">Recent Signups</div>
          <div className="dash-panel-body">
            {recentUsers.length === 0 ? (
              <div className="dash-empty-sm">No users yet</div>
            ) : (
              <div className="dash-activity-list">
                {recentUsers.map((u) => (
                  <div key={u.username} className="dash-activity-item">
                    <span className="dash-activity-icon" style={{ color: 'var(--purple)' }}>◆</span>
                    <div className="dash-activity-content">
                      <span className="dash-activity-text">{u.displayName || u.username}</span>
                      <span className="dash-activity-time">{timeAgo(u.createdAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <SectionHeader title="Recent Votes" span={6} />

        <div className="dash-panel" style={{ gridColumn: 'span 6' }}>
          <div className="dash-panel-header">Recent Votes</div>
          <div className="dash-panel-body">
            {recentVotes.length === 0 ? (
              <div className="dash-empty-sm">No votes yet</div>
            ) : (
              <div className="dash-activity-list">
                {recentVotes.slice(0, 6).map((v) => (
                  <div key={v.id} className="dash-activity-item">
                    <span className="dash-activity-icon" style={{ color: v.type === 'upvote' ? 'var(--green)' : 'var(--red)' }}>
                      {v.type === 'upvote' ? '▲' : '▼'}
                    </span>
                    <div className="dash-activity-content">
                      <span className="dash-activity-text">{v.profile.username} voted on {v.product.name}</span>
                      <span className="dash-activity-time">{timeAgo(v.createdAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DashboardGrid>
    </div>
  );
}
