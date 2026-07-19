'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createBadge, updateBadge, deleteBadge } from '@/lib/reputation/actions';

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
}

interface AdminBadgeActionsProps {
  existingBadges: BadgeItem[];
}

const DEFAULT_BADGE = {
  name: '',
  slug: '',
  description: '',
  bgColor: '#FAFF00',
  textColor: '#111111',
  borderColor: '#111111',
  icon: '',
  sortOrder: 0,
};

export function AdminBadgeActions({ existingBadges }: AdminBadgeActionsProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [editing, setEditing] = useState<BadgeItem | null>(null);
  const [form, setForm] = useState(DEFAULT_BADGE);
  const [msg, setMsg] = useState('');

  function startCreate() {
    setEditing(null);
    setForm(DEFAULT_BADGE);
  }

  function startEdit(badge: BadgeItem) {
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
    });
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
        });
        if ('error' in res) { setMsg(res.error!); return; }
        setMsg('Badge updated');
      } else {
        const res = await createBadge({
          name: form.name,
          slug,
          description: form.description || undefined,
          bgColor: form.bgColor,
          textColor: form.textColor,
          borderColor: form.borderColor,
          icon: form.icon || undefined,
          sortOrder: form.sortOrder,
        });
        if ('error' in res) { setMsg(res.error!); return; }
        setMsg('Badge created');
      }

      setEditing(null);
      setForm(DEFAULT_BADGE);
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

  return (
    <div>
      {/* ═══ Badge List ═══ */}
      <div className="overflow-x-auto mb-6">
        <table className="price-table">
          <thead>
            <tr>
              <th>Preview</th>
              <th>Name</th>
              <th>Slug</th>
              <th>Users</th>
              <th>Visible</th>
              <th>Order</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {existingBadges.map((b) => (
              <tr key={b.id}>
                <td>
                  <span
                    className="inline-block px-2 py-1 text-xs font-bold rounded border"
                    style={{ backgroundColor: b.bgColor, color: b.textColor, borderColor: b.borderColor }}
                  >
                    {b.icon} {b.name}
                  </span>
                </td>
                <td className="font-bold">{b.name}</td>
                <td className="text-[var(--text-muted)] text-sm font-mono">{b.slug}</td>
                <td>{b.userCount}</td>
                <td>{b.visible ? '✓' : '—'}</td>
                <td>{b.sortOrder}</td>
                <td className="flex gap-2">
                  <button
                    onClick={() => startEdit(b)}
                    className="text-[var(--accent)] text-xs hover:underline"
                  >
                    EDIT
                  </button>
                  <button
                    onClick={() => handleDelete(b.id)}
                    className="text-red-400 text-xs hover:underline"
                  >
                    DELETE
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ═══ Create / Edit Form ═══ */}
      <div className="border border-[var(--border)] p-4 rounded bg-[var(--bg-card)]">
        <div className="text-sm font-bold mb-3 uppercase">
          {editing ? `Edit: ${editing.name}` : 'Create New Badge'}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-[var(--text-muted)] block mb-1">Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full bg-[var(--bg)] border border-[var(--border)] rounded px-3 py-2 text-sm"
              placeholder="e.g. Vendor"
            />
          </div>
          {!editing && (
            <div>
              <label className="text-xs text-[var(--text-muted)] block mb-1">Slug (auto-generated if empty)</label>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                className="w-full bg-[var(--bg)] border border-[var(--border)] rounded px-3 py-2 text-sm"
                placeholder="vendor"
              />
            </div>
          )}
          <div>
            <label className="text-xs text-[var(--text-muted)] block mb-1">Icon (emoji)</label>
            <input
              type="text"
              value={form.icon}
              onChange={(e) => setForm({ ...form, icon: e.target.value })}
              className="w-full bg-[var(--bg)] border border-[var(--border)] rounded px-3 py-2 text-sm"
              placeholder="🔧"
            />
          </div>
          <div>
            <label className="text-xs text-[var(--text-muted)] block mb-1">Sort Order</label>
            <input
              type="number"
              value={form.sortOrder}
              onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })}
              className="w-full bg-[var(--bg)] border border-[var(--border)] rounded px-3 py-2 text-sm"
            />
          </div>
          <div className="col-span-2">
            <label className="text-xs text-[var(--text-muted)] block mb-1">Description</label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full bg-[var(--bg)] border border-[var(--border)] rounded px-3 py-2 text-sm"
              placeholder="What this badge represents"
            />
          </div>
          <div>
            <label className="text-xs text-[var(--text-muted)] block mb-1">Background Color</label>
            <input
              type="color"
              value={form.bgColor}
              onChange={(e) => setForm({ ...form, bgColor: e.target.value })}
              className="w-full h-8 bg-[var(--bg)] border border-[var(--border)] rounded cursor-pointer"
            />
          </div>
          <div>
            <label className="text-xs text-[var(--text-muted)] block mb-1">Text Color</label>
            <input
              type="color"
              value={form.textColor}
              onChange={(e) => setForm({ ...form, textColor: e.target.value })}
              className="w-full h-8 bg-[var(--bg)] border border-[var(--border)] rounded cursor-pointer"
            />
          </div>
          <div>
            <label className="text-xs text-[var(--text-muted)] block mb-1">Border Color</label>
            <input
              type="color"
              value={form.borderColor}
              onChange={(e) => setForm({ ...form, borderColor: e.target.value })}
              className="w-full h-8 bg-[var(--bg)] border border-[var(--border)] rounded cursor-pointer"
            />
          </div>
          <div className="flex items-end gap-3">
            <button
              onClick={handleSave}
              disabled={pending || !form.name.trim()}
              className="bg-[var(--accent)] text-black px-4 py-2 rounded text-sm font-bold hover:brightness-110 disabled:opacity-50"
            >
              {editing ? 'UPDATE' : 'CREATE'}
            </button>
            {editing && (
              <button
                onClick={startCreate}
                className="text-[var(--text-muted)] text-sm hover:underline"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
        {msg && <p className="text-xs mt-2 text-[var(--accent)]">{msg}</p>}
      </div>
    </div>
  );
}
