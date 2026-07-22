'use client';

import { useState, useTransition, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  createBadge,
  updateBadge,
  deleteBadge,
  reorderBadges,
  bulkDeleteBadges,
  duplicateBadge,
} from '@/lib/reputation/actions';
import { BadgeKpiSection } from './badge-kpi-section';
import { BadgeToolbarSection } from './badge-toolbar-section';

interface BadgeItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  bgColor: string;
  textColor: string;
  borderColor: string;
  icon: string | null;
  visible: boolean;
  sortOrder: number;
  userCount: number;
  type: string;
  xpRequired: number;
  createdAt?: string;
}

interface AdminBadgeActionsProps {
  existingBadges: BadgeItem[];
  stats: {
    total: number;
    visible: number;
    hidden: number;
    totalAwards: number;
    rankCount: number;
    communityCount: number;
  };
}

type FilterType = 'all' | 'visible' | 'hidden' | 'rank' | 'community';
type SortType = 'order' | 'name' | 'users' | 'newest';

const DEFAULT_FORM = {
  name: '',
  slug: '',
  description: '',
  bgColor: '#FAFF00',
  textColor: '#111111',
  borderColor: '#111111',
  icon: '',
  sortOrder: 0,
  xpRequired: 0,
  type: 'community' as string,
};

const PRESET_COLORS = [
  '#FAFF00', '#FF3366', '#00FF88', '#00CCFF', '#FF6600',
  '#AA00FF', '#FF0055', '#00FFCC', '#FFD700', '#FF4444',
  '#111111', '#222222', '#333333', '#FFFFFF', '#888888',
];

function getBadgeCategory(badge: BadgeItem): string {
  if (badge.type === 'rank') return 'rank';
  return 'community';
}

export function AdminBadgeActions({ existingBadges, stats }: AdminBadgeActionsProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [sort, setSort] = useState<SortType>('order');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [drawer, setDrawer] = useState<'create' | 'edit' | null>(null);
  const [editing, setEditing] = useState<BadgeItem | null>(null);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [msg, setMsg] = useState('');

  const filteredBadges = useMemo(() => {
    let result = [...existingBadges];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (b) =>
          b.name.toLowerCase().includes(q) ||
          b.slug.toLowerCase().includes(q) ||
          (b.description || '').toLowerCase().includes(q)
      );
    }

    if (filter === 'visible') result = result.filter((b) => b.visible);
    else if (filter === 'hidden') result = result.filter((b) => !b.visible);
    else if (filter === 'rank') result = result.filter((b) => b.type === 'rank');
    else if (filter === 'community') result = result.filter((b) => b.type === 'manual');

    if (sort === 'name') result.sort((a, b) => a.name.localeCompare(b.name));
    else if (sort === 'users') result.sort((a, b) => b.userCount - a.userCount);
    else if (sort === 'newest') result.sort((a, b) => b.sortOrder - a.sortOrder);
    else result.sort((a, b) => a.sortOrder - b.sortOrder);

    return result;
  }, [existingBadges, search, filter, sort]);

  const groupedBadges = useMemo(() => {
    const groups: Record<string, BadgeItem[]> = { rank: [], community: [] };
    for (const b of filteredBadges) {
      const cat = getBadgeCategory(b);
      if (groups[cat]) groups[cat].push(b);
      else groups.community.push(b);
    }
    return groups;
  }, [filteredBadges]);

  const GROUP_LABELS: Record<string, string> = {
    rank: 'Rank Badges',
    community: 'Community Badges',
  };

  const GROUP_COLORS: Record<string, string> = {
    rank: 'var(--yellow)',
    community: 'var(--green)',
  };

  function toggleGroup(group: string) {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(group)) next.delete(group);
      else next.add(group);
      return next;
    });
  }

  function openCreate() {
    setEditing(null);
    setForm(DEFAULT_FORM);
    setDrawer('create');
  }

  function openEdit(badge: BadgeItem) {
    setEditing(badge);
    setForm({
      name: badge.name,
      slug: badge.slug,
      description: badge.description || '',
      bgColor: badge.bgColor,
      textColor: badge.textColor,
      borderColor: badge.borderColor,
      icon: badge.icon || '',
      sortOrder: badge.sortOrder,
      xpRequired: badge.xpRequired || 0,
      type: badge.type,
    });
    setDrawer('edit');
  }

  function closeDrawer() {
    setDrawer(null);
    setEditing(null);
    setForm(DEFAULT_FORM);
  }

  async function handleSave() {
    if (!form.name.trim()) return;
    const slug = form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    startTransition(async () => {
      if (editing) {
        const res = await updateBadge(editing.id, {
          name: form.name,
          description: form.description || null,
          bgColor: form.bgColor,
          textColor: form.textColor,
          borderColor: form.borderColor,
          icon: form.icon || null,
          sortOrder: form.sortOrder,
          xpRequired: form.xpRequired,
        });
        if ('error' in res) { setMsg(res.error!); return; }
      } else {
        const res = await createBadge({
          name: form.name,
          slug,
          type: form.type,
          description: form.description || undefined,
          bgColor: form.bgColor,
          textColor: form.textColor,
          borderColor: form.borderColor,
          icon: form.icon || undefined,
          sortOrder: form.sortOrder,
          xpRequired: form.xpRequired,
        });
        if ('error' in res) { setMsg(res.error!); return; }
      }
      closeDrawer();
      setMsg(editing ? 'Badge updated' : 'Badge created');
      router.refresh();
    });
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this badge? All assignments will be removed.')) return;
    startTransition(async () => {
      const res = await deleteBadge(id);
      if ('error' in res) { setMsg(res.error!); return; }
      setMsg('Badge deleted');
      router.refresh();
    });
  }

  async function handleDuplicate(id: string) {
    startTransition(async () => {
      const res = await duplicateBadge(id);
      if ('error' in res) { setMsg(res.error!); return; }
      setMsg('Badge duplicated');
      router.refresh();
    });
  }

  async function handleToggleVisible(badge: BadgeItem) {
    startTransition(async () => {
      await updateBadge(badge.id, { visible: !badge.visible });
      router.refresh();
    });
  }

  async function handleBulkDelete() {
    if (!selectedIds.length) return;
    if (!confirm(`Delete ${selectedIds.length} badge(s)? All assignments will be removed.`)) return;
    startTransition(async () => {
      const res = await bulkDeleteBadges(selectedIds);
      if ('error' in res) { setMsg(res.error!); return; }
      setMsg(`${selectedIds.length} badge(s) deleted`);
      setSelectedIds([]);
      router.refresh();
    });
  }

  function toggleSelectAll() {
    const allVisible = filteredBadges.map((b) => b.id);
    const allSelected = allVisible.every((id) => selectedIds.includes(id));
    setSelectedIds(allSelected ? [] : allVisible);
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  return (
    <div>
      {/* ═══ KPI Cards ═══ */}
      <BadgeKpiSection stats={stats} />

      {/* ═══ Toolbar ═══ */}
      <BadgeToolbarSection
        search={search}
        onSearchChange={setSearch}
        filter={filter}
        onFilterChange={setFilter}
        sort={sort}
        onSortChange={(s) => setSort(s)}
        selectedCount={selectedIds.length}
        onBulkDelete={handleBulkDelete}
        onCreate={openCreate}
      />

      {/* ═══ Badge Table ═══ */}
      {filteredBadges.length === 0 ? (
        <div className="bdg-empty">
          <div className="bdg-empty-icon">◆</div>
          <div className="bdg-empty-title">No badges found</div>
          <div className="bdg-empty-desc">
            {existingBadges.length === 0
              ? 'Create your first badge to get started.'
              : 'Try adjusting your search or filters.'}
          </div>
          {existingBadges.length === 0 && (
            <button className="btn-primary btn-sm" onClick={openCreate}>
              + Create Badge
            </button>
          )}
        </div>
      ) : (
        <div className="bdg-table-wrap">
          <div className="bdg-table-head">
            <div className="bdg-th bdg-th-check">
              <input
                type="checkbox"
                checked={filteredBadges.every((b) => selectedIds.includes(b.id))}
                onChange={toggleSelectAll}
              />
            </div>
            <div className="bdg-th bdg-th-preview">Preview</div>
            <div className="bdg-th bdg-th-name sortable" onClick={() => setSort(sort === 'name' ? 'order' : 'name')}>
              Name {sort === 'name' && '▲'}
            </div>
            <div className="bdg-th bdg-th-category">Category</div>
            <div className="bdg-th bdg-th-xp">XP Req.</div>
            <div className="bdg-th bdg-th-users sortable" onClick={() => setSort(sort === 'users' ? 'order' : 'users')}>
              Users {sort === 'users' && '▲'}
            </div>
            <div className="bdg-th bdg-th-visible">Visible</div>
            <div className="bdg-th bdg-th-order sortable" onClick={() => setSort(sort === 'order' ? 'newest' : 'order')}>
              Order {sort === 'order' && '▲'}
            </div>
            <div className="bdg-th bdg-th-actions">Actions</div>
          </div>

          {(['rank', 'community'] as const).map((group) => {
            const items = groupedBadges[group];
            if (!items.length) return null;
            const isCollapsed = collapsedGroups.has(group);
            return (
              <div key={group} className="bdg-group">
                <button className="bdg-group-header" onClick={() => toggleGroup(group)}>
                  <span className="bdg-group-chevron">{isCollapsed ? '▸' : '▾'}</span>
                  <span className="bdg-group-dot" style={{ background: GROUP_COLORS[group] }} />
                  <span className="bdg-group-label">{GROUP_LABELS[group]}</span>
                  <span className="bdg-group-count">{items.length}</span>
                </button>
                {!isCollapsed && items.map((b) => (
                  <div key={b.id} className={`bdg-row ${selectedIds.includes(b.id) ? 'selected' : ''}`}>
                    <div className="bdg-td bdg-td-check">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(b.id)}
                        onChange={() => toggleSelect(b.id)}
                      />
                    </div>
                    <div className="bdg-td bdg-td-preview">
                      <span
                        className="bdg-preview-badge"
                        style={{
                          backgroundColor: b.bgColor,
                          color: b.textColor,
                          borderColor: b.borderColor,
                        }}
                      >
                        {b.icon} {b.name}
                      </span>
                    </div>
                    <div className="bdg-td bdg-td-name">
                      <div className="bdg-name">{b.name}</div>
                      <div className="bdg-slug">{b.slug}</div>
                    </div>
                    <div className="bdg-td bdg-td-category">
                      <span className={`bdg-cat-badge bdg-cat-${getBadgeCategory(b)}`}>
                        {getBadgeCategory(b)}
                      </span>
                    </div>
                    <div className="bdg-td bdg-td-xp">
                      {b.type === 'rank' ? (
                        <span className="bdg-xp-val">{b.xpRequired.toLocaleString()}</span>
                      ) : (
                        <span className="bdg-xp-na">—</span>
                      )}
                    </div>
                    <div className="bdg-td bdg-td-users">{b.userCount}</div>
                    <div className="bdg-td bdg-td-visible">
                      <span className={`bdg-vis-dot ${b.visible ? 'on' : 'off'}`} />
                    </div>
                    <div className="bdg-td bdg-td-order">{b.sortOrder}</div>
                    <div className="bdg-td bdg-td-actions">
                      <button className="bdg-action-btn" title="Edit" onClick={() => openEdit(b)}>
                        ✎
                      </button>
                      <button className="bdg-action-btn" title="Duplicate" onClick={() => handleDuplicate(b.id)}>
                        ⧉
                      </button>
                      <button
                        className="bdg-action-btn"
                        title={b.visible ? 'Hide' : 'Show'}
                        onClick={() => handleToggleVisible(b)}
                      >
                        {b.visible ? '◉' : '○'}
                      </button>
                      <button className="bdg-action-btn bdg-action-danger" title="Delete" onClick={() => handleDelete(b.id)}>
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}

      {/* ═══ Drawer ═══ */}
      {drawer && (
        <div className="bdg-drawer-overlay" onClick={closeDrawer}>
          <div className="bdg-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="bdg-drawer-header">
              <div className="bdg-drawer-title">
                {drawer === 'create' ? 'Create Badge' : `Edit: ${editing?.name}`}
              </div>
              <button className="bdg-drawer-close" onClick={closeDrawer}>✕</button>
            </div>

            <div className="bdg-drawer-body">
              {/* Live Preview */}
              <div className="bdg-preview-section">
                <div className="bdg-preview-label">Live Preview</div>
                <div className="bdg-preview-box">
                  <div className="bdg-preview-dark">
                    <span
                      className="bdg-preview-badge-lg"
                      style={{
                        backgroundColor: form.bgColor,
                        color: form.textColor,
                        borderColor: form.borderColor,
                      }}
                    >
                      {form.icon} {form.name || 'Badge Name'}
                    </span>
                  </div>
                  <div className="bdg-preview-profile">
                    <div className="bdg-preview-avatar" />
                    <div>
                      <div className="bdg-preview-username">username</div>
                      <span
                        className="bdg-preview-badge-sm"
                        style={{
                          backgroundColor: form.bgColor,
                          color: form.textColor,
                          borderColor: form.borderColor,
                        }}
                      >
                        {form.icon} {form.name || 'Badge'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Fields */}
              <div className="bdg-form">
                {drawer === 'create' && (
                  <div className="bdg-form-row">
                    <label className="bdg-label">Badge Type</label>
                    <div className="bdg-type-select">
                      <button
                        className={`bdg-type-btn ${form.type === 'community' ? 'active-community' : ''}`}
                        onClick={() => setForm({ ...form, type: 'community' })}
                        type="button"
                      >
                        Community
                      </button>
                      <button
                        className={`bdg-type-btn ${form.type === 'rank' ? 'active-rank' : ''}`}
                        onClick={() => setForm({ ...form, type: 'rank' })}
                        type="button"
                      >
                        Rank
                      </button>
                    </div>
                  </div>
                )}

                <div className="bdg-form-row">
                  <label className="bdg-label">Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="bdg-input"
                    placeholder="e.g. Vendor"
                  />
                </div>

                {drawer === 'create' && (
                  <div className="bdg-form-row">
                    <label className="bdg-label">Slug</label>
                    <input
                      type="text"
                      value={form.slug}
                      onChange={(e) => setForm({ ...form, slug: e.target.value })}
                      className="bdg-input"
                      placeholder="auto-generated"
                    />
                  </div>
                )}

                <div className="bdg-form-row">
                  <label className="bdg-label">Icon (emoji)</label>
                  <input
                    type="text"
                    value={form.icon}
                    onChange={(e) => setForm({ ...form, icon: e.target.value })}
                    className="bdg-input"
                    placeholder="🔧"
                  />
                </div>

                <div className="bdg-form-row">
                  <label className="bdg-label">Description</label>
                  <input
                    type="text"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="bdg-input"
                    placeholder="What this badge represents"
                  />
                </div>

                {(form.type === 'rank' || (editing && editing.type === 'rank')) && (
                  <div className="bdg-form-row">
                    <label className="bdg-label">XP Required</label>
                    <input
                      type="number"
                      value={form.xpRequired}
                      onChange={(e) => setForm({ ...form, xpRequired: parseInt(e.target.value) || 0 })}
                      className="bdg-input"
                      min={0}
                    />
                  </div>
                )}

                <div className="bdg-form-row">
                  <label className="bdg-label">Sort Order</label>
                  <input
                    type="number"
                    value={form.sortOrder}
                    onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })}
                    className="bdg-input"
                  />
                </div>

                {/* Colors */}
                <div className="bdg-colors">
                  <label className="bdg-label">Colors</label>
                  <div className="bdg-color-row">
                    <div className="bdg-color-field">
                      <span className="bdg-color-label">Background</span>
                      <div className="bdg-color-input-wrap">
                        <input
                          type="color"
                          value={form.bgColor}
                          onChange={(e) => setForm({ ...form, bgColor: e.target.value })}
                          className="bdg-color-input"
                        />
                        <input
                          type="text"
                          value={form.bgColor}
                          onChange={(e) => setForm({ ...form, bgColor: e.target.value })}
                          className="bdg-color-hex"
                        />
                      </div>
                    </div>
                    <div className="bdg-color-field">
                      <span className="bdg-color-label">Text</span>
                      <div className="bdg-color-input-wrap">
                        <input
                          type="color"
                          value={form.textColor}
                          onChange={(e) => setForm({ ...form, textColor: e.target.value })}
                          className="bdg-color-input"
                        />
                        <input
                          type="text"
                          value={form.textColor}
                          onChange={(e) => setForm({ ...form, textColor: e.target.value })}
                          className="bdg-color-hex"
                        />
                      </div>
                    </div>
                    <div className="bdg-color-field">
                      <span className="bdg-color-label">Border</span>
                      <div className="bdg-color-input-wrap">
                        <input
                          type="color"
                          value={form.borderColor}
                          onChange={(e) => setForm({ ...form, borderColor: e.target.value })}
                          className="bdg-color-input"
                        />
                        <input
                          type="text"
                          value={form.borderColor}
                          onChange={(e) => setForm({ ...form, borderColor: e.target.value })}
                          className="bdg-color-hex"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="bdg-presets">
                    {PRESET_COLORS.map((c) => (
                      <button
                        key={c}
                        className={`bdg-preset ${form.bgColor === c ? 'active' : ''}`}
                        style={{ background: c }}
                        onClick={() => setForm({ ...form, bgColor: c })}
                      />
                    ))}
                  </div>
                </div>

                {msg && <div className="bdg-msg">{msg}</div>}
              </div>
            </div>

            <div className="bdg-drawer-footer">
              <button className="btn-secondary btn-sm" onClick={closeDrawer}>
                Cancel
              </button>
              <button
                className="btn-primary btn-sm"
                onClick={handleSave}
                disabled={pending || !form.name.trim()}
              >
                {pending ? 'Saving...' : drawer === 'create' ? 'Create Badge' : 'Update Badge'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
