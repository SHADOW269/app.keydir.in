'use client';

type FilterType = 'all' | 'visible' | 'hidden' | 'rank' | 'community';
type SortType = 'order' | 'name' | 'users' | 'newest';

interface Props {
  search: string;
  onSearchChange: (v: string) => void;
  filter: FilterType;
  onFilterChange: (f: FilterType) => void;
  sort: SortType;
  onSortChange: (s: SortType) => void;
  selectedCount: number;
  onBulkDelete: () => void;
  onCreate: () => void;
}

export function BadgeToolbarSection({ search, onSearchChange, filter, onFilterChange, sort, onSortChange, selectedCount, onBulkDelete, onCreate }: Props) {
  return (
    <div className="bdg-toolbar">
      <div className="bdg-toolbar-left">
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search badges..."
          className="bdg-search"
        />
        <div className="bdg-filters">
          {(['all', 'visible', 'hidden', 'rank', 'community'] as FilterType[]).map((f) => (
            <button
              key={f}
              className={`bdg-filter-btn ${filter === f ? 'active' : ''}`}
              onClick={() => onFilterChange(f)}
            >
              {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>
      <div className="bdg-toolbar-right">
        <select value={sort} onChange={(e) => onSortChange(e.target.value as SortType)} className="bdg-sort-select">
          <option value="order">Sort: Order</option>
          <option value="name">Sort: Name</option>
          <option value="users">Sort: Most Used</option>
          <option value="newest">Sort: Newest</option>
        </select>
        {selectedCount > 0 && (
          <button className="btn-secondary btn-sm" onClick={onBulkDelete}>
            Delete ({selectedCount})
          </button>
        )}
        <button className="btn-primary btn-sm" onClick={onCreate}>
          + Create Badge
        </button>
      </div>
    </div>
  );
}
