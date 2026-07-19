'use client';

import { useState, useMemo } from 'react';

export interface DataTableColumn<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  searchable?: boolean;
  searchPlaceholder?: string;
  searchKeys?: string[];
  pageSize?: number;
  emptyMessage?: string;
  emptyIcon?: string;
  emptyAction?: React.ReactNode;
  bulkActions?: React.ReactNode;
  selectedRows?: string[];
  onSelectionChange?: (ids: string[]) => void;
  idKey?: string;
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  searchable = true,
  searchPlaceholder = 'Search...',
  searchKeys = [],
  pageSize = 20,
  emptyMessage = 'No data found',
  emptyIcon = '📋',
  emptyAction,
  bulkActions,
  selectedRows = [],
  onSelectionChange,
  idKey = 'id',
}: DataTableProps<T>) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    let result = [...data];
    if (search && searchKeys.length > 0) {
      const q = search.toLowerCase();
      result = result.filter((item) =>
        searchKeys.some((key) => String(item[key] ?? '').toLowerCase().includes(q))
      );
    }
    if (sortKey) {
      result.sort((a, b) => {
        const av = a[sortKey] ?? '';
        const bv = b[sortKey] ?? '';
        const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true });
        return sortDir === 'asc' ? cmp : -cmp;
      });
    }
    return result;
  }, [data, search, sortKey, sortDir, searchKeys]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paged = filtered.slice(page * pageSize, (page + 1) * pageSize);

  function handleSort(key: string) {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
  }

  function toggleAll() {
    if (!onSelectionChange) return;
    const allIds = paged.map((r) => String(r[idKey]));
    const allSelected = allIds.every((id) => selectedRows.includes(id));
    onSelectionChange(allSelected ? selectedRows.filter((id) => !allIds.includes(id)) : [...new Set([...selectedRows, ...allIds])]);
  }

  return (
    <div className="dash-table-wrap">
      {(searchable || bulkActions) && (
        <div className="dash-table-toolbar">
          {searchable && (
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              placeholder={searchPlaceholder}
              className="dash-table-search"
            />
          )}
          <div className="dash-table-toolbar-right">
            {bulkActions && selectedRows.length > 0 && (
              <span className="dash-table-selected">{selectedRows.length} selected</span>
            )}
            {bulkActions}
          </div>
        </div>
      )}
      {filtered.length === 0 ? (
        <div className="dash-table-empty">
          <div className="dash-table-empty-icon">{emptyIcon}</div>
          <div className="dash-table-empty-msg">{emptyMessage}</div>
          {emptyAction && <div className="dash-table-empty-action">{emptyAction}</div>}
        </div>
      ) : (
        <>
          <div className="dash-table-scroll">
            <table className="dash-table">
              <thead>
                <tr>
                  {onSelectionChange && (
                    <th className="dash-th-check">
                      <input type="checkbox" checked={paged.every((r) => selectedRows.includes(String(r[idKey])))} onChange={toggleAll} />
                    </th>
                  )}
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      className={`dash-th ${col.sortable ? 'sortable' : ''} ${col.className || ''}`}
                      onClick={() => col.sortable && handleSort(col.key)}
                    >
                      {col.label}
                      {sortKey === col.key && <span className="dash-th-sort">{sortDir === 'asc' ? ' ▲' : ' ▼'}</span>}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paged.map((item, i) => (
                  <tr key={String(item[idKey] ?? i)} className={selectedRows.includes(String(item[idKey])) ? 'selected' : ''}>
                    {onSelectionChange && (
                      <td className="dash-td-check">
                        <input
                          type="checkbox"
                          checked={selectedRows.includes(String(item[idKey]))}
                          onChange={() => {
                            const id = String(item[idKey]);
                            onSelectionChange(selectedRows.includes(id) ? selectedRows.filter((x) => x !== id) : [...selectedRows, id]);
                          }}
                        />
                      </td>
                    )}
                    {columns.map((col) => (
                      <td key={col.key} className={`dash-td ${col.className || ''}`}>
                        {col.render ? col.render(item) : String(item[col.key] ?? '')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="dash-table-pagination">
              <span className="dash-table-info">
                Showing {page * pageSize + 1}–{Math.min((page + 1) * pageSize, filtered.length)} of {filtered.length}
              </span>
              <div className="dash-table-pages">
                <button disabled={page === 0} onClick={() => setPage((p) => p - 1)} className="dash-page-btn">←</button>
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  const p = totalPages <= 7 ? i : Math.max(0, Math.min(page - 3, totalPages - 7)) + i;
                  return (
                    <button key={p} onClick={() => setPage(p)} className={`dash-page-btn ${p === page ? 'active' : ''}`}>{p + 1}</button>
                  );
                })}
                <button disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)} className="dash-page-btn">→</button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
