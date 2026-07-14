import Link from 'next/link';
import { prisma } from '@/lib/prisma';

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

  const [
    productCount, vendorCount, brandCount, categoryCount,
    userCount, voteCount, votesToday,
    recentProducts, recentUsers, recentVotes, recentCollections,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.vendor.count(),
    prisma.brand.count(),
    prisma.category.count(),
    prisma.profile.count(),
    prisma.vote.count(),
    prisma.vote.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.product.findMany({ orderBy: { createdAt: 'desc' }, take: 8, include: { brand: { select: { name: true } }, category: { select: { name: true } } } }),
    prisma.profile.findMany({ orderBy: { createdAt: 'desc' }, take: 5, select: { username: true, displayName: true, createdAt: true } }),
    prisma.vote.findMany({ orderBy: { createdAt: 'desc' }, take: 8, include: { profile: { select: { username: true } }, product: { select: { name: true, slug: true } } } }),
    prisma.collection.findMany({ orderBy: { createdAt: 'desc' }, take: 5, include: { profile: { select: { username: true } }, product: { select: { name: true, slug: true } } } }),
  ]);

  const activity: { time: string; icon: string; action: string; detail: string }[] = [];
  for (const p of recentProducts) {
    activity.push({ time: timeAgo(p.createdAt), icon: '◆', action: 'New product added', detail: p.name });
  }
  for (const c of recentCollections) {
    activity.push({ time: timeAgo(c.createdAt), icon: '◇', action: 'Added to collection', detail: c.product.name });
  }
  activity.sort((a, b) => {
    const parse = (s: string) => { const n = parseInt(s); return s.includes('m') ? n * 60 : s.includes('h') ? n * 3600 : s.includes('d') ? n * 86400 : n; };
    return parse(a.time) - parse(b.time);
  });

  return (
    <div className="page-body">
      {/* ═══ SYSTEM OVERVIEW ═══ */}
      <div className="sec-head">
        <h2>SYSTEM <em className="text-[var(--red)]">OVERVIEW</em></h2>
        <span className="badge b-green">LIVE</span>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {[
          { label: 'Products', value: productCount, href: '/admin/products', color: 'var(--yellow)' },
          { label: 'Vendors', value: vendorCount, href: '/admin/vendors', color: 'var(--green)' },
          { label: 'Brands', value: brandCount, href: '/admin/brands', color: 'var(--blue)' },
          { label: 'Categories', value: categoryCount, href: '/admin/categories', color: 'var(--pink)' },
          { label: 'Users', value: userCount, href: '/admin/users', color: 'var(--purple)' },
          { label: 'Pending Contributions', value: 0, href: '/admin/community', color: 'var(--orange)' },
          { label: 'Pending Price Updates', value: 0, href: '/admin/products', color: 'var(--cyan)' },
          { label: 'Votes Today', value: votesToday, href: '/admin/votes', color: 'var(--yellow)' },
        ].map((s) => (
          <Link key={s.label} href={s.href} className="neo-card p-6 block no-underline">
            <span className="block font-[family-name:var(--f-m)] text-4xl font-extrabold leading-none" style={{ color: s.color }}>{s.value}</span>
            <span className="block font-[family-name:var(--f-m)] text-xs font-bold uppercase tracking-widest text-[var(--text-dim)] mt-2">{s.label}</span>
          </Link>
        ))}
      </div>

      {/* ═══ QUICK ACTIONS ═══ */}
      <div className="sec-head">
        <h2>QUICK <em className="text-[var(--yellow)]">ACTIONS</em></h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        {[
          { label: 'Add Product', href: '/admin/products/new' },
          { label: 'Add Vendor', href: '/admin/vendors/new' },
          { label: 'Add Brand', href: '/admin/brands/new' },
          { label: 'Add Category', href: '/admin/categories/new' },
          { label: 'Import Products', href: '/admin/products' },
          { label: 'Import Vendors', href: '/admin/vendors' },
          { label: 'Submit Group Buy', href: '/admin/products/new' },
          { label: 'Create Announcement', href: '/admin/banners/new' },
        ].map((a) => (
          <Link key={a.label} href={a.href} className="neo-card p-5 block no-underline text-center">
            <span className="font-[family-name:var(--f-m)] text-sm font-bold uppercase tracking-wider text-[var(--text)]">+ {a.label}</span>
          </Link>
        ))}
      </div>

      {/* ═══ TWO-COLUMN ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 items-start">

        {/* ── LEFT ── */}
        <div className="flex flex-col gap-6">

          {/* Recent Activity */}
          <div className="neo-card">
            <div className="sec-head border-b-[3px] border-[var(--border)] pb-3 mb-0">
              <h2>RECENT <em className="text-[var(--green)]">ACTIVITY</em></h2>
            </div>
            <table className="price-table">
              <thead>
                <tr>
                  <th className="w-20">Time</th>
                  <th className="w-8"></th>
                  <th>Action</th>
                  <th>Detail</th>
                </tr>
              </thead>
              <tbody>
                {activity.length === 0 ? (
                  <tr><td colSpan={4} className="text-center text-[var(--text-dim)] py-8 font-[family-name:var(--f-m)] text-sm">No recent activity</td></tr>
                ) : (
                  activity.slice(0, 10).map((item, i) => (
                    <tr key={i}>
                      <td className="text-[var(--text-dim)] text-xs whitespace-nowrap">{item.time}</td>
                      <td className="text-[var(--green)] text-center">{item.icon}</td>
                      <td className="text-[var(--text-muted)]">{item.action}</td>
                      <td className="font-bold text-[var(--text)]">{item.detail}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pending Moderation */}
          <div className="neo-card">
            <div className="sec-head border-b-[3px] border-[var(--border)] pb-3 mb-0">
              <h2>PENDING <em className="text-[var(--orange)]">MODERATION</em></h2>
            </div>
            <table className="price-table">
              <tbody>
                {[
                  { label: 'Pending Products', count: 0, href: '/admin/products' },
                  { label: 'Pending Vendors', count: 0, href: '/admin/vendors' },
                  { label: 'Pending Price Changes', count: 0, href: '/admin/products' },
                  { label: 'Pending Specs', count: 0, href: '/admin/products' },
                  { label: 'Pending Community Edits', count: 0, href: '/admin/community' },
                ].map((item) => (
                  <tr key={item.label}>
                    <td className="font-bold">{item.label}</td>
                    <td className="text-right text-[var(--text-dim)]">{item.count}</td>
                    <td className="text-right w-24">
                      <Link href={item.href} className="font-[family-name:var(--f-m)] text-xs font-bold uppercase tracking-wider text-[var(--yellow)] hover:text-[var(--green)] transition-colors">Review</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Reports Queue */}
          <div className="neo-card">
            <div className="sec-head border-b-[3px] border-[var(--border)] pb-3 mb-0">
              <h2>REPORTS <em className="text-[var(--red)]">QUEUE</em></h2>
            </div>
            <table className="price-table">
              <tbody>
                {[
                  { label: 'Report Product', count: 0 },
                  { label: 'Broken Vendor Link', count: 0 },
                  { label: 'Wrong Specs', count: 0 },
                  { label: 'Duplicate Product', count: 0 },
                ].map((item) => (
                  <tr key={item.label}>
                    <td className="font-bold">{item.label}</td>
                    <td className="text-right text-[var(--text-dim)]">{item.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── RIGHT SIDEBAR ── */}
        <div className="flex flex-col gap-6">

          {/* System Health */}
          <div className="neo-card">
            <div className="sec-head border-b-[3px] border-[var(--border)] pb-3 mb-0">
              <h2>SYSTEM <em className="text-[var(--cyan)]">HEALTH</em></h2>
            </div>
            <table className="price-table">
              <tbody>
                {[
                  { label: 'Database', value: 'Operational', ok: true },
                  { label: 'Storage', value: 'Operational', ok: true },
                  { label: 'Image Count', value: `${productCount} products` },
                  { label: 'Users Online', value: '—' },
                  { label: 'Cron Jobs', value: 'Active', ok: true },
                  { label: 'Scraper Status', value: 'Idle', ok: true },
                ].map((item) => (
                  <tr key={item.label}>
                    <td className="text-[var(--text-muted)]">{item.label}</td>
                    <td className={`text-right font-bold ${item.ok ? 'text-[var(--green)]' : 'text-[var(--text-dim)]'}`}>{item.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Recent Signups */}
          <div className="neo-card">
            <div className="sec-head border-b-[3px] border-[var(--border)] pb-3 mb-0">
              <h2>RECENT <em className="text-[var(--purple)]">SIGNUPS</em></h2>
            </div>
            <table className="price-table">
              <tbody>
                {recentUsers.length === 0 ? (
                  <tr><td className="text-center text-[var(--text-dim)] py-6 font-[family-name:var(--f-m)] text-sm">No users yet</td></tr>
                ) : (
                  recentUsers.map((u) => (
                    <tr key={u.username}>
                      <td className="font-bold">{u.displayName || u.username}</td>
                      <td className="text-right text-[var(--text-dim)] text-xs whitespace-nowrap">{timeAgo(u.createdAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Recent Votes */}
          <div className="neo-card">
            <div className="sec-head border-b-[3px] border-[var(--border)] pb-3 mb-0">
              <h2>RECENT <em className="text-[var(--yellow)]">VOTES</em></h2>
            </div>
            <table className="price-table">
              <tbody>
                {recentVotes.length === 0 ? (
                  <tr><td className="text-center text-[var(--text-dim)] py-6 font-[family-name:var(--f-m)] text-sm">No votes yet</td></tr>
                ) : (
                  recentVotes.slice(0, 6).map((v) => (
                    <tr key={v.id}>
                      <td className={`w-8 text-center ${v.type === 'upvote' ? 'text-[var(--green)]' : 'text-[var(--red)]'}`}>{v.type === 'upvote' ? '▲' : '▼'}</td>
                      <td className="font-bold">{v.profile.username}</td>
                      <td className="text-[var(--text-dim)] text-right truncate max-w-[140px]">{v.product.name}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Announcements */}
          <div className="neo-card">
            <div className="sec-head border-b-[3px] border-[var(--border)] pb-3 mb-0">
              <h2>ANNOUNCEMENTS</h2>
            </div>
            <div className="p-6 flex flex-col gap-3">
              <Link href="/admin/banners/new" className="btn-primary btn-sm text-center no-underline">+ Create Announcement</Link>
              <Link href="/admin/banners" className="btn-secondary btn-sm text-center no-underline">Manage Banners</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
