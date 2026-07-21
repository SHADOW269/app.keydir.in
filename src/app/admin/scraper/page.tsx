import { prisma } from '@/lib/prisma';
import { ScraperOpsClient } from './scraper-ops-client';
import { getFailedLogs, getLatestPriceChanges, getActivityFeed, getOverviewStats } from '@/lib/admin/scraper-actions';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Scraper Operations — Admin' };

export default async function ScraperOpsPage() {
  const vendors = await prisma.vendor.findMany({
    orderBy: { name: 'asc' },
    include: {
      vendorProducts: {
        select: {
          id: true, scrapeStatus: true, lastCheckedAt: true, lastSuccessfulAt: true,
          scrapeError: true, price: true, manualOverride: true, responseTimeMs: true,
          lastScrapedPrice: true, lastScrapedAvailability: true,
        },
      },
    },
  });

  const vendorStats = vendors.map((v) => {
    const products = v.vendorProducts;
    const total = products.length;
    const success = products.filter((p) => p.scrapeStatus === 'SUCCESS').length;
    const failed = products.filter((p) => p.scrapeStatus === 'FAILED').length;
    const pending = products.filter((p) => p.scrapeStatus === 'PENDING').length;
    const successRate = total > 0 ? Math.round((success / total) * 100) : 0;
    const lastRun = products.map((p) => p.lastCheckedAt).filter(Boolean)
      .sort((a, b) => (b?.getTime() ?? 0) - (a?.getTime() ?? 0))[0] || null;
    const responseTimes = products.map((p) => p.responseTimeMs).filter((t): t is number => t != null);
    const avgMs = responseTimes.length > 0
      ? Math.round(responseTimes.reduce((s, t) => s + t, 0) / responseTimes.length) : null;

    return {
      id: v.id, name: v.name, slug: v.slug, logo: v.logo, enabled: v.enabled,
      scraperEnabled: v.scraperEnabled, total, success, failed, pending,
      successRate, lastRun, avgMs,
    };
  });

  const enabledVendors = vendorStats.filter((v) => v.scraperEnabled && v.enabled);
  const scraperVendors = vendorStats.filter((v) => v.scraperEnabled);

  const [overview, failedLogs, priceChanges, activity] = await Promise.all([
    getOverviewStats(),
    getFailedLogs({}),
    getLatestPriceChanges(),
    getActivityFeed(),
  ]);

  const lastRunTime = overview.lastRun
    ? new Date(overview.lastRun).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
    : '—';

  return (
    <div className="sop-page">
      <ScraperOpsClient
        vendors={vendors.map((v) => ({ id: v.id, name: v.name, slug: v.slug }))}
        vendorStats={scraperVendors}
        initialFailedLogs={failedLogs}
        initialPriceChanges={priceChanges}
        initialActivity={activity}
        enabledVendors={enabledVendors.length}
        lastRunTime={lastRunTime}
      />
    </div>
  );
}
