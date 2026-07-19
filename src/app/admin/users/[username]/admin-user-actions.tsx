'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { setXP, assignBadge, removeBadgeFromUser, suspendUser, banUser, liftBan } from '@/lib/reputation/actions';

interface AdminUserActionsProps {
  profileId: string;
  username: string;
  currentXP: number;
  assignedBadgeIds: string[];
  allBadges: { id: string; name: string; slug: string; type: string }[];
}

export function AdminUserActions({
  profileId,
  username,
  currentXP,
  assignedBadgeIds,
  allBadges,
}: AdminUserActionsProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [xpValue, setXpValue] = useState(currentXP.toString());
  const [badgeMsg, setBadgeMsg] = useState('');
  const [banReason, setBanReason] = useState('');
  const [banType, setBanType] = useState<'suspend' | 'ban'>('suspend');
  const [banDuration, setBanDuration] = useState('');
  const [banMsg, setBanMsg] = useState('');

  async function handleSetXP() {
    const val = parseInt(xpValue);
    if (isNaN(val)) return;
    startTransition(async () => {
      const res = await setXP(profileId, val);
      if ('error' in res) { setBadgeMsg(res.error!); return; }
      setBadgeMsg(`XP set to ${val} (${res.rank})`);
      router.refresh();
    });
  }

  async function handleAssignBadge(badgeId: string) {
    startTransition(async () => {
      const res = await assignBadge(profileId, badgeId);
      if ('error' in res) { setBadgeMsg(res.error!); return; }
      setBadgeMsg('Badge assigned');
      router.refresh();
    });
  }

  async function handleRemoveBadge(badgeId: string) {
    startTransition(async () => {
      const res = await removeBadgeFromUser(profileId, badgeId);
      if ('error' in res) { setBadgeMsg(res.error!); return; }
      setBadgeMsg('Badge removed');
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

  return (
    <>
      {/* ═══ XP Editor ═══ */}
      <div className="admin-form-panel">
        <div className="admin-form-panel-header">XP EDITOR</div>
        <div className="admin-form-panel-body">
          <div className="admin-form-row">
            <span className="admin-form-label">Set XP</span>
            <input
              type="number"
              value={xpValue}
              onChange={(e) => setXpValue(e.target.value)}
              className="admin-input admin-input-sm"
            />
            <button
              onClick={handleSetXP}
              disabled={pending}
              className="admin-btn admin-btn-primary"
            >
              SAVE
            </button>
          </div>
          {badgeMsg && <p className="admin-msg admin-msg-accent">{badgeMsg}</p>}
        </div>
      </div>

      {/* ═══ Badge Editor ═══ */}
      <div className="admin-form-panel">
        <div className="admin-form-panel-header">BADGE EDITOR</div>
        <div className="admin-form-panel-body">
          <div className="admin-badges-wrap">
            {allBadges.filter(b => b.type !== 'rank').map((b) => {
              const assigned = assignedBadgeIds.includes(b.id);
              return (
                <button
                  key={b.id}
                  onClick={() => assigned ? handleRemoveBadge(b.id) : handleAssignBadge(b.id)}
                  disabled={pending}
                  className={`admin-badge-pill ${assigned ? 'assigned' : ''}`}
                >
                  {assigned ? '✓ ' : ''}{b.name}
                </button>
              );
            })}
            {allBadges.filter(b => b.type !== 'rank').length === 0 && (
              <span className="admin-badge-pill empty">No badges created yet</span>
            )}
          </div>
          {badgeMsg && !badgeMsg.includes('XP') && (
            <p className="admin-msg admin-msg-accent">{badgeMsg}</p>
          )}
        </div>
      </div>

      {/* ═══ User Status ═══ */}
      <div className="admin-form-panel">
        <div className="admin-form-panel-header" style={{ color: 'var(--red)' }}>SUSPEND / BAN USER</div>
        <div className="admin-form-panel-body">
          <div className="admin-form-row">
            <span className="admin-form-label">Action</span>
            <select
              value={banType}
              onChange={(e) => setBanType(e.target.value as 'suspend' | 'ban')}
              className="admin-select"
            >
              <option value="suspend">Suspend</option>
              <option value="ban">Ban</option>
            </select>
            {banType === 'suspend' && (
              <input
                type="number"
                placeholder="Days (empty=infinite)"
                value={banDuration}
                onChange={(e) => setBanDuration(e.target.value)}
                className="admin-input admin-input-sm"
              />
            )}
          </div>
          <div className="admin-form-row">
            <span className="admin-form-label">Reason</span>
            <input
              type="text"
              placeholder="Reason for action..."
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              className="admin-input"
            />
            <button
              onClick={handleBan}
              disabled={pending || !banReason.trim()}
              className="admin-btn admin-btn-danger"
            >
              {banType === 'suspend' ? 'SUSPEND' : 'BAN'}
            </button>
          </div>
          {banMsg && <p className="admin-msg admin-msg-error">{banMsg}</p>}
        </div>
      </div>
    </>
  );
}
