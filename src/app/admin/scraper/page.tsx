import { prisma } from '@/lib/prisma';
import { DashboardGrid, KpiCard, SectionHeader, StatusCard } from '@/components/admin/dashboard';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Scraper Health — Admin' };

export default async function ScraperHealthPage() {
  const vendors = await prisma.vendor.findMany({
    orderBy: { name: 'asc' },
    include: {
      vendorProducts: {
        select: {
          id: true, scrapeStatus: true, lastCheckedAt: true, lastSuccessfulAt: true,
          scrapeError: true, scraperVersion: true, price: true, manualOverride: true,
          lastHttpStatus: true, responseTimeMs: true, lastScrapedPrice: true,
        },
      },
    },
  });

  const stats = vendors.map((v) => {
    const products = v.vendorProducts;
    const total = products.length;
    const success = products.filter((p) => p.scrapeStatus === 'SUCCESS').length;
    const failed = products.filter((p) => p.scrapeStatus === 'FAILED').length;
    const needsReview = products.filter((p) => p.scrapeStatus === 'NEEDS_REVIEW').length;
    const pending = products.filter((p) => p.scrapeStatus === 'PENDING').length;
    const manual = products.filter((p) => p.manualOverride).length;
    const successRate = total > 0 ? Math.round((success / total) * 100) : 0;
    const lastRun = products.map((p) => p.lastCheckedAt).filter(Boolean)
      .sort((a, b) => (b?.getTime() ?? 0) - (a?.getTime() ?? 0))[0] || null;
    const responseTimes = products.map((p) => p.responseTimeMs).filter((t): t is number => t != null);
    const avgResponseMs = responseTimes.length > 0
      ? Math.round(responseTimes.reduce((s, t) => s + t, 0) / responseTimes.length) : null;

    return {
      id: v.id, name: v.name, slug: v.slug, enabled: v.enabled,
      scraperEnabled: v.scraperEnabled, scraperEngine: v.scraperEngine,
      scraperVersion: `v${v.scraperVersion}`,
      total, success, failed, needsReview, pending, manual,
      successRate, lastRun, avgResponseMs,
    };
  });

  const totalProducts = stats.reduce((s, v) => s + v.total, 0);
  const totalSuccess = stats.reduce((s, v) => s + v.success, 0);
  const totalFailed = stats.reduce((s, v) => s + v.failed, 0);
  const totalNeedsReview = stats.reduce((s, v) => s + v.needsReview, 0);
  const overallRate = totalProducts > 0 ? Math.round((totalSuccess / totalProducts) * 100) : 0;
  const allResponseTimes = vendors.flatMap((v) => v.vendorProducts)
    .map((p) => p.responseTimeMs).filter((t): t is number => t != null);
  const globalAvgMs = allResponseTimes.length > 0
    ? Math.round(allResponseTimes.reduce((s, t) => s + t, 0) / allResponseTimes.length) : null;

  const allErrors = vendors.flatMap((v) =>
    v.vendorProducts.filter((p) => p.scrapeStatus === 'FAILED' && p.scrapeError)
      .map((p) => ({
        vendorName: v.name, error: p.scrapeError!, httpStatus: p.lastHttpStatus,
        version: p.scraperVersion || '—', lastChecked: p.lastCheckedAt,
      }))
  ).sort((a, b) => (b.lastChecked?.getTime() ?? 0) - (a.lastChecked?.getTime() ?? 0)).slice(0, 20);

  const allReview = vendors.flatMap((v) =>
    v.vendorProducts.filter((p) => p.scrapeStatus === 'NEEDS_REVIEW')
      .map((p) => ({
        vendorName: v.name, currentPrice: p.price, scrapedPrice: p.lastScrapedPrice,
        error: p.scrapeError, version: p.scraperVersion || '—',
      }))
  );

  return (
    <div className="page-body">
      <div className="dash-page-header">
        <div>
          <div className="dash-page-title">SCRAPER <em className="text-[var(--cyan)]">HEALTH</em></div>
          <div className="dash-page-desc">Automated price scraping monitoring</div>
        </div>
        <span className="badge b-green">CRON: Every 6h</span>
      </div>

      <DashboardGrid>
        <SectionHeader title="System Status" span={12} />

        <KpiCard label="Tracked Products" value={totalProducts} icon="◆" color="var(--cyan)" span={3} />
        <KpiCard label="Success Rate" value={`${overallRate}%`} icon="●" color="var(--green)" span={3} />
        <KpiCard label="Failed" value={totalFailed} icon="▼" color="var(--red)" span={3} />
        <KpiCard label="Needs Review" value={totalNeedsReview} icon="◆" color="var(--orange)" span={3} />

        <StatusCard title="Database" status="healthy" details="Connected" span={3} />
        <StatusCard title="Scraper Engine" status="healthy" details={`${stats.filter((v) => v.scraperEnabled).length} vendors enabled`} span={3} />
        <StatusCard title="Avg Response" status={globalAvgMs && globalAvgMs > 5000 ? 'warning' : 'healthy'} details={globalAvgMs != null ? `${globalAvgMs}ms` : '—'} span={3} />
        <StatusCard title="Last Run" status="healthy" details={stats[0]?.lastRun ? new Date(stats[0].lastRun).toLocaleString() : '—'} span={3} />

        <SectionHeader title="Vendor Health" span={12} />

        {stats.map((v) => (
          <div key={v.id} className="dash-kpi" style={{ gridColumn: 'span 3' }}>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${v.enabled ? 'bg-[var(--green)]' : 'bg-[var(--red)]'}`} />
              <span className="dash-kpi-label">{v.name}</span>
            </div>
            <div className="dash-kpi-value" style={{ fontSize: '1.4rem', color: v.successRate >= 90 ? 'var(--green)' : v.successRate >= 70 ? 'var(--yellow)' : 'var(--red)' }}>
              {v.successRate}%
            </div>
            <div className="dash-kpi-trend positive">{v.total} products · {v.failed} failed</div>
          </div>
        ))}

        {allErrors.length > 0 && (
          <>
            <SectionHeader title="Recent Errors" span={12} />
            <div className="dash-panel" style={{ gridColumn: 'span 12' }}>
              <div className="dash-panel-header">Failed Scrapes</div>
              <div className="dash-panel-body" style={{ padding: 0 }}>
                <div className="overflow-x-auto">
                  <table className="dash-table">
                    <thead>
                      <tr>
                        <th className="dash-th">Vendor</th>
                        <th className="dash-th">Error</th>
                        <th className="dash-th">HTTP</th>
                        <th className="dash-th">Version</th>
                        <th className="dash-th">Last Attempt</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allErrors.map((e, i) => (
                        <tr key={i}>
                          <td className="dash-td font-bold">{e.vendorName}</td>
                          <td className="dash-td text-[var(--red)] text-sm">{e.error}</td>
                          <td className="dash-td text-[var(--text-dim)] text-xs font-mono">{e.httpStatus || '—'}</td>
                          <td className="dash-td text-[var(--text-dim)] text-xs font-mono">{e.version}</td>
                          <td className="dash-td text-[var(--text-dim)] text-xs whitespace-nowrap">
                            {e.lastChecked ? new Date(e.lastChecked).toLocaleString() : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}

        {allReview.length > 0 && (
          <>
            <SectionHeader title="Needs Review" span={12} />
            <div className="dash-panel" style={{ gridColumn: 'span 12' }}>
              <div className="dash-panel-header">Suspicious Price Changes</div>
              <div className="dash-panel-body" style={{ padding: 0 }}>
                <div className="overflow-x-auto">
                  <table className="dash-table">
                    <thead>
                      <tr>
                        <th className="dash-th">Vendor</th>
                        <th className="dash-th">Current Price</th>
                        <th className="dash-th">Scraped Price</th>
                        <th className="dash-th">Reason</th>
                        <th className="dash-th">Version</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allReview.map((e, i) => (
                        <tr key={i}>
                          <td className="dash-td font-bold">{e.vendorName}</td>
                          <td className="dash-td">₹{e.currentPrice.toLocaleString('en-IN')}</td>
                          <td className="dash-td text-[var(--orange)] font-bold">₹{e.scrapedPrice?.toLocaleString('en-IN') ?? '—'}</td>
                          <td className="dash-td text-[var(--text-dim)] text-sm">{e.error || 'Suspicious change'}</td>
                          <td className="dash-td text-[var(--text-dim)] text-xs font-mono">{e.version}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}
      </DashboardGrid>
    </div>
  );
}
