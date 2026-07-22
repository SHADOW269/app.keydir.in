'use client';

import { useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { CollapsibleCard } from '@/components/admin/collapsible-card';
import { TabbedPanel, TabPanel } from './tabbed-panel';
import { updateVendor, updateVendorScraperConfig, deleteVendor } from '@/lib/admin/vendor-actions';
import { DeletePasswordModal } from './delete-password-modal';
import { useDeleteEntity } from './hooks/use-delete-entity';
import { useScraperTest } from './hooks/use-scraper-test';
import { useFormSubmit } from './hooks/use-form-submit';
import { VendorHeader } from './vendor-header';
import { ScraperConfigTab } from './scraper-config-tab';
import { SelectorsTab } from './selectors-tab';
import { SchedulerSection } from './scheduler-section';
import { TestingTab } from './testing-tab';
import { AdvancedTab } from './advanced-tab';
import { VendorCredentialsSection } from './vendor-credentials-section';

interface Vendor {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  website: string;
  affiliateLink: string | null;
  shippingPolicy: string | null;
  chartColor: string | null;
  enabled: boolean;
  scraperEnabled: boolean;
  scraperEngine: string;
  priceSelector: string | null;
  availabilitySelector: string | null;
  titleSelector: string | null;
  imageSelector: string | null;
  productExistsSelector: string | null;
  priceAttribute: string;
  availabilityAttribute: string;
  titleAttribute: string;
  imageAttribute: string;
  customHeaders: string | null;
  cloudflareProtected: boolean;
  useJavaScriptRendering: boolean;
  customScraper: string | null;
  scraperVersion: number;
  scraperNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Stats {
  productCount: number;
  scrapeLogCount: number;
  successRate: number | null;
  avgResponseTime: number;
  successLogs: number;
  failedLogs: number;
  totalRecentLogs: number;
}

interface LogEntry {
  id: string;
  status: string;
  httpStatus: number | null;
  responseTimeMs: number | null;
  error: string | null;
  price: number | null;
  createdAt: string;
}

type Tab = 'vendor' | 'scraper' | 'selectors' | 'scheduler' | 'testing' | 'credentials' | 'advanced';

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'vendor', label: 'Vendor', icon: '◆' },
  { id: 'scraper', label: 'Scraper', icon: '▲' },
  { id: 'selectors', label: 'Selectors', icon: '◎' },
  { id: 'scheduler', label: 'Scheduler', icon: '◷' },
  { id: 'testing', label: 'Testing', icon: '⚡' },
  { id: 'credentials', label: 'Credentials', icon: '█' },
  { id: 'advanced', label: 'Advanced', icon: '⚙' },
];

export function VendorDashboard({ vendor, stats, recentLogs }: { vendor: Vendor; stats: Stats; recentLogs: LogEntry[] }) {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get('tab') || 'vendor') as Tab;
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);
  const { pending, error, setError, run } = useFormSubmit();
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const {
    showDeleteModal, setShowDeleteModal,
    deletePassword, setDeletePassword,
    deleteError, setDeleteError,
    deleting, handleDelete,
  } = useDeleteEntity(deleteVendor, vendor.id, '/admin/vendors');
  const { testUrl, setTestUrl, testResult, testing, handleTest } = useScraperTest(vendor.id);
  // Scheduler state
  const [priceEnabled, setPriceEnabled] = useState(true);
  const [priceSchedule, setPriceSchedule] = useState('every-12h');
  const [stockEnabled, setStockEnabled] = useState(true);
  const [stockSchedule, setStockSchedule] = useState('every-30m');
  const [delayMin, setDelayMin] = useState(3);
  const [delayMax, setDelayMax] = useState(10);
  const [maxRpm, setMaxRpm] = useState(10);
  const [maxRph, setMaxRph] = useState(100);
  const [concurrency, setConcurrency] = useState(1);
  const [retryAttempts, setRetryAttempts] = useState(3);
  const [quietStart, setQuietStart] = useState('02:00');
  const [quietEnd, setQuietEnd] = useState('06:00');
  const [windowStart, setWindowStart] = useState('08:00');
  const [windowEnd, setWindowEnd] = useState('23:00');

  const flash = useCallback((msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  }, []);

  async function handleSaveGeneral(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const ok = await run(() => updateVendor(vendor.id, form));
    if (ok) flash('Vendor updated');
  }

  async function handleSaveScraper(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const ok = await run(() => updateVendorScraperConfig(vendor.id, form));
    if (ok) flash('Scraper config saved');
  }

  const healthStatus = stats.successRate === null ? 'unknown' : stats.successRate >= 80 ? 'healthy' : stats.successRate >= 50 ? 'warning' : 'error';
  const healthColor = healthStatus === 'healthy' ? 'var(--green)' : healthStatus === 'warning' ? 'var(--orange)' : healthStatus === 'unknown' ? 'var(--text-dim)' : 'var(--red)';

  const lastLog = recentLogs[0];

  return (
    <div className="vd-wrap">
        <VendorHeader
          vendor={vendor}
          stats={stats}
          lastLog={lastLog}
          healthColor={healthColor}
          healthLabel={healthStatus === 'healthy' ? 'HEALTHY' : healthStatus === 'warning' ? 'WARNING' : healthStatus === 'unknown' ? 'NO DATA' : 'BROKEN'}
          pending={pending}
          onSave={() => document.querySelector<HTMLFormElement>('#vendor-form')?.requestSubmit()}
          onCancel={() => {}}
          onDelete={() => setShowDeleteModal(true)}
        />

        <TabbedPanel tabs={TABS} activeTab={activeTab} onTabChange={(id) => setActiveTab(id as Tab)}>

        <div className="vd-body">
          <div className="vd-main">
            {error && <div className="vd-flash vd-flash--error">{error}</div>}
            {successMsg && <div className="vd-flash vd-flash--ok">{successMsg}</div>}

            <TabPanel tabId="vendor" activeTab={activeTab}>
              <form id="vendor-form" onSubmit={handleSaveGeneral}>
                <CollapsibleCard title="General" icon="◆" id="vd-general">
                  <div className="vd-form-grid">
                    <div className="admin-field">
                      <label className="admin-label">Vendor Name *</label>
                      <input name="name" required defaultValue={vendor.name} className="admin-input" />
                    </div>
                    <div className="admin-field">
                      <label className="admin-label">Website *</label>
                      <input name="website" required type="url" defaultValue={vendor.website} className="admin-input" />
                    </div>
                    <div className="admin-field">
                      <label className="admin-label">Country</label>
                      <input name="country" defaultValue="IN" className="admin-input" />
                    </div>
                    <div className="admin-field">
                      <label className="admin-label">Currency</label>
                      <input name="currency" defaultValue="INR" className="admin-input" />
                    </div>
                    <div className="admin-field">
                      <label className="filter-option">
                        <input type="checkbox" name="enabled" defaultChecked={vendor.enabled} />
                        <span className="admin-label" style={{ margin: 0 }}>Enabled</span>
                      </label>
                    </div>
                  </div>
                </CollapsibleCard>

                <CollapsibleCard title="Statistics" icon="▦" id="vd-stats" defaultOpen={false}>
                  <div className="vd-stats-grid">
                    <div className="vd-stat-card">
                      <div className="vd-stat-card-value">{stats.productCount}</div>
                      <div className="vd-stat-card-label">Products</div>
                    </div>
                    <div className="vd-stat-card">
                      <div className="vd-stat-card-value">{vendor.createdAt ? new Date(vendor.createdAt).toLocaleDateString() : '—'}</div>
                      <div className="vd-stat-card-label">First Added</div>
                    </div>
                    <div className="vd-stat-card">
                      <div className="vd-stat-card-value">{vendor.updatedAt ? new Date(vendor.updatedAt).toLocaleDateString() : '—'}</div>
                      <div className="vd-stat-card-label">Last Updated</div>
                    </div>
                  </div>
                </CollapsibleCard>
              </form>
            </TabPanel>

            <TabPanel tabId="scraper" activeTab={activeTab}>
              <ScraperConfigTab vendor={vendor} pending={pending} onSubmit={handleSaveScraper} />
            </TabPanel>

            <TabPanel tabId="selectors" activeTab={activeTab}>
              <SelectorsTab vendor={vendor} pending={pending} onSubmit={handleSaveScraper} />
            </TabPanel>

            <TabPanel tabId="scheduler" activeTab={activeTab}>
              <SchedulerSection
                priceEnabled={priceEnabled} setPriceEnabled={setPriceEnabled}
                priceSchedule={priceSchedule} setPriceSchedule={setPriceSchedule}
                stockEnabled={stockEnabled} setStockEnabled={setStockEnabled}
                stockSchedule={stockSchedule} setStockSchedule={setStockSchedule}
                delayMin={delayMin} setDelayMin={setDelayMin}
                delayMax={delayMax} setDelayMax={setDelayMax}
                maxRpm={maxRpm} setMaxRpm={setMaxRpm}
                maxRph={maxRph} setMaxRph={setMaxRph}
                concurrency={concurrency} setConcurrency={setConcurrency}
                retryAttempts={retryAttempts} setRetryAttempts={setRetryAttempts}
                quietStart={quietStart} setQuietStart={setQuietStart}
                quietEnd={quietEnd} setQuietEnd={setQuietEnd}
                windowStart={windowStart} setWindowStart={setWindowStart}
                windowEnd={windowEnd} setWindowEnd={setWindowEnd}
                healthStatus={healthStatus}
                lastLog={lastLog}
              />
            </TabPanel>

            <TabPanel tabId="testing" activeTab={activeTab}>
              <TestingTab
                vendor={vendor}
                testUrl={testUrl}
                setTestUrl={setTestUrl}
                testResult={testResult}
                testing={testing}
                handleTest={handleTest}
              />
            </TabPanel>

            <TabPanel tabId="credentials" activeTab={activeTab}>
              <VendorCredentialsSection
                vendor={vendor}
                pending={pending}
                onSubmit={handleSaveScraper}
              />
            </TabPanel>

            <TabPanel tabId="advanced" activeTab={activeTab}>
              <AdvancedTab vendor={vendor} />
            </TabPanel>
          </div>
        </div>
        </TabbedPanel>

        {showDeleteModal && (
          <DeletePasswordModal
            description={<>This will permanently delete <strong>{vendor.name}</strong> and all its product listings. Enter password to confirm.</>}
            password={deletePassword}
            error={deleteError}
            pending={deleting}
            onPasswordChange={(val) => { setDeletePassword(val); setDeleteError(null); }}
            onConfirm={handleDelete}
            onCancel={() => { setShowDeleteModal(false); setDeletePassword(''); setDeleteError(null); }}
          />
        )}
      </div>
  );
}
