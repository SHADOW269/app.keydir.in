'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import ContributionCard from '@/components/profile/contribution-card';
import {
  assignCommunityBadge,
  adminDirectContribution,
  deleteContribution,
  suspendUser,
  banUser,
} from '@/lib/reputation/actions';
import type { ContributionType } from '@prisma/client';
import { ProfileSection } from './profile-section';
import { RankBadgesSection } from './rank-badges-section';

interface ContributionItem {
  id: string;
  type: string;
  title: string;
  description: string | null;
  xpAwarded: number;
  status: string;
  createdAt: string;
  approvedBy: string | null;
}

interface BanItem {
  id: string;
  type: string;
  reason: string;
  status: string;
  createdAt: string;
  expiresAt: string | null;
  admin: string;
}

interface ActivityLogItem {
  id: string;
  action: string;
  details: string | null;
  createdAt: string;
}

interface BadgeInfo {
  name: string;
  icon: string | null;
  bgColor: string;
  textColor: string;
  borderColor: string;
}

interface AdminUserActionsProps {
  profileId: string;
  username: string;
  displayName: string | null;
  rank: string;
  xp: number;
  xpMax: number;
  xpProgress: number;
  nextRank: { name: string } | null;
  currentCommunityBadgeId: string | null;
  currentCommunityBadge: BadgeInfo | null;
  communityBadges: (BadgeInfo & { id: string })[];
  sortedBadges: BadgeInfo[];
  votes: number;
  collection: number;
  wishlist: number;
  contributions: ContributionItem[];
  bans: BanItem[];
  activityLog: ActivityLogItem[];
  lastActiveDate: string;
  joinedDate: string;
}

const CONTRIBUTION_TYPES = [
  { value: 'ADD_PRODUCT', label: 'Product Added' },
  { value: 'UPDATE_PRICE', label: 'Price Update' },
  { value: 'EDIT_SPECS', label: 'Spec Fix' },
  { value: 'REPORT_VENDOR', label: 'Vendor Report' },
  { value: 'UPLOAD_IMAGES', label: 'Image Added' },
  { value: 'FIX_PRODUCT_INFO', label: 'Info Fix' },
  { value: 'ADD_VENDOR', label: 'Vendor Added' },
  { value: 'ADD_BRAND', label: 'Brand Added' },
  { value: 'DOCUMENTATION', label: 'Documentation' },
  { value: 'BUG_FIX', label: 'Bug Fix' },
  { value: 'FEATURE_DEV', label: 'Feature Dev' },
  { value: 'DB_CLEANUP', label: 'DB Cleanup' },
  { value: 'OTHER', label: 'Other' },
];

export function AdminUserActions({
  profileId,
  username,
  displayName,
  rank,
  xp,
  xpMax,
  xpProgress,
  nextRank,
  currentCommunityBadgeId: initialBadgeId,
  currentCommunityBadge,
  communityBadges,
  sortedBadges,
  votes,
  collection,
  wishlist,
  contributions,
  bans,
  activityLog,
  lastActiveDate,
  joinedDate,
}: AdminUserActionsProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [saveMsg, setSaveMsg] = useState('');

  const [communityBadgeId, setCommunityBadgeId] = useState(initialBadgeId || '');
  const [badgeMsg, setBadgeMsg] = useState('');

  const [contribType, setContribType] = useState('ADD_PRODUCT');
  const [contribTitle, setContribTitle] = useState('');
  const [contribDesc, setContribDesc] = useState('');
  const [contribXp, setContribXp] = useState('5');
  const [contribRef, setContribRef] = useState('');
  const [contribMsg, setContribMsg] = useState('');

  const [banType, setBanType] = useState<'suspend' | 'ban'>('suspend');
  const [banReason, setBanReason] = useState('');
  const [banDuration, setBanDuration] = useState('');
  const [banMsg, setBanMsg] = useState('');

  const hasChanges = communityBadgeId !== (initialBadgeId || '') || !!contribTitle.trim() || !!banReason.trim();

  async function handleCommunityBadgeChange(newBadgeId: string) {
    setCommunityBadgeId(newBadgeId);
    startTransition(async () => {
      const res = await assignCommunityBadge(profileId, newBadgeId);
      if ('error' in res) { setBadgeMsg(res.error!); return; }
      setBadgeMsg(newBadgeId ? 'Community badge updated' : 'Community badge removed');
      router.refresh();
    });
  }

  async function handleAddContribution() {
    if (!contribTitle.trim()) return;
    startTransition(async () => {
      const description = [contribDesc, contribRef ? `Ref: ${contribRef}` : ''].filter(Boolean).join('\n');
      const res = await adminDirectContribution({
        profileId,
        type: contribType as ContributionType,
        title: contribTitle,
        description: description || undefined,
        xpAwarded: parseInt(contribXp) || 0,
      });
      if ('error' in res) { setContribMsg(res.error!); return; }
      setContribMsg(`+${contribXp} XP — Rank: ${res.rank}`);
      setContribTitle('');
      setContribDesc('');
      setContribRef('');
      setContribXp('5');
      router.refresh();
    });
  }

  async function handleDeleteContribution(contributionId: string) {
    if (!confirm('Delete this contribution? XP will be revoked.')) return;
    startTransition(async () => {
      const res = await deleteContribution(contributionId);
      if ('error' in res) { setContribMsg(res.error!); return; }
      setContribMsg('Contribution deleted');
      router.refresh();
    });
  }

  async function handleBan() {
    if (!banReason.trim()) return;
    startTransition(async () => {
      let res;
      if (banType === 'suspend') {
        const days = banDuration ? parseInt(banDuration) : undefined;
        res = await suspendUser(profileId, banReason, days);
      } else {
        res = await banUser(profileId, banReason);
      }
      if ('error' in res) { setBanMsg(res.error!); return; }
      setBanMsg(banType === 'suspend' ? 'User suspended' : 'User banned');
      setBanReason('');
      setBanDuration('');
      router.refresh();
    });
  }

  async function handleSaveAll() {
    const badgeChanged = communityBadgeId !== (initialBadgeId || '');
    const hasContribution = contribTitle.trim();
    const hasBanAction = banReason.trim();

    startTransition(async () => {
      let errors: string[] = [];

      if (badgeChanged && communityBadgeId) {
        const r = await assignCommunityBadge(profileId, communityBadgeId);
        if ('error' in r) errors.push(r.error!);
      }
      if (hasContribution) {
        const description = [contribDesc, contribRef ? `Ref: ${contribRef}` : ''].filter(Boolean).join('\n');
        const r = await adminDirectContribution({
          profileId, type: contribType as ContributionType, title: contribTitle,
          description: description || undefined, xpAwarded: parseInt(contribXp) || 0,
        });
        if ('error' in r) errors.push(r.error!);
        else { setContribTitle(''); setContribDesc(''); setContribRef(''); setContribXp('5'); }
      }
      if (hasBanAction) {
        const days = banType === 'suspend' && banDuration ? parseInt(banDuration) : undefined;
        const r = banType === 'suspend' ? await suspendUser(profileId, banReason, days) : await banUser(profileId, banReason);
        if ('error' in r) errors.push(r.error!);
        else { setBanReason(''); setBanDuration(''); }
      }

      setSaveMsg(errors.length > 0 ? errors.join('; ') : 'Saved');
      router.refresh();
    });
  }

  return (
    <form id="admin-user-form" onSubmit={(e) => { e.preventDefault(); handleSaveAll(); }}>
      {/* ═══ Header ═══ */}
      <header className="ce-hd">
        <div className="ce-hd-l">
          <div className="ce-hd-title-row">
            <span className="ce-name">{displayName || username}</span>
            <span className="admin-user-rank-badge" style={{ position: 'relative', top: -1 }}>{rank}</span>
            {currentCommunityBadge && (
              <span
                className="admin-user-community-badge"
                style={{
                  backgroundColor: currentCommunityBadge.bgColor,
                  color: currentCommunityBadge.textColor,
                  borderColor: currentCommunityBadge.borderColor,
                  position: 'relative',
                  top: -1,
                }}
              >
                {currentCommunityBadge.icon} {currentCommunityBadge.name}
              </span>
            )}
          </div>
          <div className="ce-hd-stats">
            <span className="ce-hd-stat">@{username}</span>
            <span className="ce-hd-stat-sep">•</span>
            <span className="ce-hd-stat">Last active <strong>{lastActiveDate}</strong></span>
            <span className="ce-hd-stat-sep">•</span>
            <span className="ce-hd-stat">Joined <strong>{joinedDate}</strong></span>
            <span className="ce-hd-stat-sep">•</span>
            <span className="ce-hd-stat">Contributions <strong>{contributions.length}</strong></span>
            <span className="ce-hd-stat-sep">•</span>
            <span className="ce-hd-stat">Votes <strong>{votes}</strong></span>
          </div>
        </div>
        <div className="ce-hd-r">
          <button type="submit" disabled={pending || !hasChanges} className="ce-toolbar-btn ce-toolbar-btn-primary">{pending ? 'SAVING…' : 'SAVE'}</button>
        </div>
      </header>

      {/* ═══ Two Column Grid ═══ */}
      <div className="admin-user-grid">
        {/* LEFT: Profile Info */}
        <ProfileSection
          displayName={displayName}
          profileId={profileId}
          votes={votes}
          collection={collection}
          wishlist={wishlist}
        />

        {/* RIGHT: Rank & Badges */}
        <RankBadgesSection
          rank={rank}
          xp={xp}
          xpMax={xpMax}
          xpProgress={xpProgress}
          nextRank={nextRank}
          sortedBadges={sortedBadges}
        />
      </div>

      {/* ═══ Community Badge ═══ */}
      <div className="admin-form-panel">
        <div className="admin-form-panel-header">COMMUNITY BADGE</div>
        <div className="admin-form-panel-body">
          <div className="admin-form-row admin-form-row--badge">
            <div className="admin-form-field-group">
              <span className="admin-form-label">Badge</span>
              <select
                value={communityBadgeId}
                onChange={(e) => handleCommunityBadgeChange(e.target.value)}
                className="admin-select"
                disabled={pending}
              >
                <option value="">None</option>
                {communityBadges.map((b) => (
                  <option key={b.id} value={b.id}>{b.icon ? `${b.icon} ` : ''}{b.name}</option>
                ))}
              </select>
            </div>
            <div className="admin-form-field-group admin-form-field-group--preview">
              <span className="admin-form-label">Preview</span>
              {communityBadgeId && (() => {
                const selected = communityBadges.find(b => b.id === communityBadgeId);
                if (!selected) return null;
                return (
                  <span
                    className="admin-badge-pill assigned"
                    style={{
                      backgroundColor: selected.bgColor,
                      color: selected.textColor,
                      borderColor: selected.borderColor,
                    }}
                  >
                    {selected.icon} {selected.name}
                  </span>
                );
              })() || <span className="admin-info-value" style={{ padding: 'var(--sp-2) var(--sp-3)', border: '1px dashed var(--border)', fontSize: 'var(--fs-badge)' }}>None selected</span>}
            </div>
          </div>
          {badgeMsg && <p className="admin-msg admin-msg-accent">{badgeMsg}</p>}
        </div>
      </div>

      {/* ═══ Add Contribution ═══ */}
      <div className="admin-form-panel">
        <div className="admin-form-panel-header">ADD CONTRIBUTION</div>
        <div className="admin-form-panel-body">
          <div className="admin-contrib-top-row">
            <div className="admin-contrib-top-field">
              <span className="admin-form-label">Type</span>
              <select
                value={contribType}
                onChange={(e) => setContribType(e.target.value)}
                className="admin-select admin-select--full"
              >
                {CONTRIBUTION_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div className="admin-contrib-top-field admin-contrib-xp">
              <span className="admin-form-label">XP</span>
              <input
                type="number"
                value={contribXp}
                onChange={(e) => setContribXp(e.target.value)}
                className="admin-input"
                min={0}
              />
            </div>
            <div className="admin-contrib-top-field admin-contrib-ref">
              <span className="admin-form-label">Reference</span>
              <input
                type="text"
                value={contribRef}
                onChange={(e) => setContribRef(e.target.value)}
                className="admin-input"
                placeholder="optional"
              />
            </div>
          </div>
          <div className="admin-form-row">
            <span className="admin-form-label">Title</span>
            <input
              type="text"
              value={contribTitle}
              onChange={(e) => setContribTitle(e.target.value)}
              className="admin-input"
              placeholder="Brief description of contribution"
            />
          </div>
          <div className="admin-form-row">
            <span className="admin-form-label">Description</span>
            <textarea
              value={contribDesc}
              onChange={(e) => setContribDesc(e.target.value)}
              className="admin-input admin-textarea"
              placeholder="Detailed description..."
              rows={2}
            />
          </div>
          <div className="admin-contrib-footer">
            <button
              type="button"
              onClick={handleAddContribution}
              disabled={pending || !contribTitle.trim()}
              className="admin-btn admin-btn-primary"
            >
              ADD CONTRIBUTION
            </button>
            {contribMsg && <p className="admin-msg admin-msg-accent">{contribMsg}</p>}
          </div>
        </div>
      </div>

      {/* ═══ Contribution History ═══ */}
      <div className="admin-form-panel">
        <div className="admin-form-panel-header">CONTRIBUTIONS</div>
        <div className="admin-form-panel-body">
          {contributions.length > 0 ? (
            <div className="card-contribution-list">
              {contributions.map((c) => (
                <ContributionCard
                  key={c.id}
                  id={c.id}
                  type={c.type}
                  title={c.title}
                  description={c.description}
                  xpAwarded={c.xpAwarded}
                  status={c.status}
                  createdAt={c.createdAt}
                  approvedBy={c.approvedBy}
                  onDelete={handleDeleteContribution}
                  disabled={pending}
                />
              ))}
            </div>
          ) : (
            <div className="admin-empty-state-enhanced">
              <div className="admin-empty-state-icon">&#9733;</div>
              <div className="admin-empty-state-title">No contributions have been recorded.</div>
              <div className="admin-empty-state-sub">When an admin adds a contribution it will appear here.</div>
            </div>
          )}
        </div>
      </div>

      {/* ═══ Suspend / Ban ═══ */}
      <div className="admin-form-panel">
        <div className="admin-form-panel-header admin-form-panel-header--danger">MODERATION</div>
        <div className="admin-form-panel-body">
          <div className="admin-form-row admin-ban-controls">
            <div className="admin-ban-field">
              <span className="admin-form-label">Action</span>
              <select
                value={banType}
                onChange={(e) => setBanType(e.target.value as 'suspend' | 'ban')}
                className="admin-select admin-select--full"
              >
                <option value="suspend">Suspend</option>
                <option value="ban">Permanent Ban</option>
              </select>
            </div>
            <div className="admin-ban-field">
              <span className="admin-form-label">Duration</span>
              {banType === 'suspend' ? (
                <select
                  value={banDuration}
                  onChange={(e) => setBanDuration(e.target.value)}
                  className="admin-select admin-select--full"
                >
                  <option value="">Select duration</option>
                  <option value="1">1 Day</option>
                  <option value="3">3 Days</option>
                  <option value="7">7 Days</option>
                  <option value="14">14 Days</option>
                  <option value="30">30 Days</option>
                  <option value="90">90 Days</option>
                </select>
              ) : (
                <span className="admin-info-value" style={{ padding: 'var(--sp-2) var(--sp-3)', border: '1px dashed var(--border)', fontFamily: 'var(--f-m)', fontSize: 'var(--fs-status-body)' }}>Permanent</span>
              )}
            </div>
          </div>
          <div className="admin-form-row">
            <span className="admin-form-label">Reason</span>
            <input
              type="text"
              placeholder="Enter reason for this action..."
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              className="admin-input"
            />
          </div>
          <div className="admin-ban-submit-row">
            <button
              type="button"
              onClick={handleBan}
              disabled={pending || !banReason.trim()}
              className="admin-btn admin-btn-danger"
            >
              {banType === 'suspend' ? 'SUSPEND' : 'BAN'}
            </button>
            {banMsg && <p className="admin-msg admin-msg-error">{banMsg}</p>}
          </div>

          {bans.length > 0 && (
            <div className="admin-ban-list">
              {bans.map((b) => (
                <div key={b.id} className="admin-ban-card">
                  <div className="admin-ban-card-header">
                    <span className="admin-ban-type">{b.type}</span>
                    <span className={`admin-ban-status ${b.status === 'ACTIVE' ? 'active' : 'lifted'}`}>
                      {b.status}
                    </span>
                  </div>
                  <div className="admin-ban-reason">{b.reason}</div>
                  <div className="admin-ban-meta">
                    By {b.admin} &middot; {new Date(b.createdAt).toLocaleDateString('en-IN')}
                    {b.expiresAt && <> &middot; Expires {new Date(b.expiresAt).toLocaleDateString('en-IN')}</>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ═══ User History ═══ */}
      <div className="admin-form-panel">
        <div className="admin-form-panel-header">USER HISTORY</div>
        <div className="admin-form-panel-body">
          {activityLog.length > 0 ? (
            <div className="admin-timeline">
              {activityLog.map((log) => (
                <div key={log.id} className="admin-timeline-item">
                  <div className="admin-timeline-dot" />
                  <div className="admin-timeline-content">
                    <div className="admin-timeline-action">{log.action.replace(/_/g, ' ')}</div>
                    {log.details && <div className="admin-timeline-details">{log.details}</div>}
                    <div className="admin-timeline-time">{new Date(log.createdAt).toLocaleDateString('en-IN')} {new Date(log.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="admin-empty-state-enhanced">
              <div className="admin-empty-state-icon">&#128203;</div>
              <div className="admin-empty-state-title">No activity recorded yet.</div>
              <div className="admin-empty-state-sub">When a user performs an action it will appear here.</div>
            </div>
          )}
        </div>
      </div>

      {saveMsg && <p className="admin-msg" style={{ textAlign: 'center', marginTop: 'var(--sp-3)', color: saveMsg === 'Saved' ? 'var(--yellow)' : 'var(--red)' }}>{saveMsg}</p>}
    </form>
  );
}
