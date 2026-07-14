'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { RotateCcw, Search } from 'lucide-react';

interface FilterData {
  specFields: Record<string, { name: string; slug: string; options: string[] }>;
  brands: { name: string; slug: string }[];
  vendors: { name: string; slug: string }[];
  priceRange: { min: number; max: number };
}

interface FilterModalProps {
  open: boolean;
  onClose: () => void;
  onApply: (filters: Record<string, string[]>, priceRange: { min: string; max: string }) => void;
  liveCount: number;
  onFilterChange: (filters: Record<string, string[]>, priceRange: { min: string; max: string }) => void;
}

interface Category {
  key: string;
  label: string;
  count: number;
}

const LARGE_LIST_THRESHOLD = 12;

const STOCK_LABELS: Record<string, string> = {
  in_stock: 'In Stock',
  preorder: 'Pre Order',
  group_buy: 'Group Buy',
  coming_soon: 'Coming Soon',
  out_of_stock: 'Discontinued',
};

function parseFiltersFromParams(params: URLSearchParams) {
  const filters: Record<string, string[]> = {};
  const skipKeys = new Set(['q', 'sort', 'priceMin', 'priceMax']);
  for (const [key, value] of params.entries()) {
    if (!skipKeys.has(key)) {
      if (!filters[key]) filters[key] = [];
      filters[key].push(value);
    }
  }
  return filters;
}

function getCount(key: string, draft: Record<string, string[]>, pMin: string, pMax: string): number {
  if (key === 'price') return (pMin || pMax) ? 1 : 0;
  return (draft[key] || []).length;
}

function CheckboxList({
  options,
  selected,
  onToggle,
  placeholder,
}: {
  options: { value: string; label: string }[];
  selected: string[];
  onToggle: (v: string) => void;
  placeholder: string;
}) {
  const [q, setQ] = useState('');
  const filtered = useMemo(() => {
    if (!q) return options;
    const l = q.toLowerCase();
    return options.filter((o) => o.label.toLowerCase().includes(l));
  }, [q, options]);

  return (
    <div className="fm-checklist">
      <div className="fm-cl-search">
        <Search size={12} />
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={placeholder}
        />
      </div>
      <div className="fm-cl-scroll">
        {filtered.length === 0 && <div className="fm-cl-empty">No results</div>}
        {filtered.map((opt) => {
          const checked = selected.includes(opt.value);
          return (
            <label
              key={opt.value}
              className={`fm-cl-item ${checked ? 'checked' : ''}`}
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === ' ') { e.preventDefault(); onToggle(opt.value); } }}
            >
              <span className="fm-cl-check">{checked ? '✓' : ''}</span>
              <span className="fm-cl-name">{opt.label}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

function DualRange({
  min,
  max,
  valMin,
  valMax,
  onMin,
  onMax,
}: {
  min: number;
  max: number;
  valMin: string;
  valMax: string;
  onMin: (v: string) => void;
  onMax: (v: string) => void;
}) {
  const nMin = parseFloat(valMin) || min;
  const nMax = parseFloat(valMax) || max;
  const range = max - min || 1;
  const left = ((nMin - min) / range) * 100;
  const right = 100 - ((nMax - min) / range) * 100;

  return (
    <div className="fm-dual-range">
      <div className="fm-dr-track">
        <div className="fm-dr-fill" style={{ left: `${left}%`, right: `${right}%` }} />
      </div>
      <input
        type="range" min={min} max={max} step={100} value={nMin}
        onChange={(e) => { const v = parseInt(e.target.value); if (v <= (parseFloat(valMax) || max)) onMin(String(v)); }}
        className="fm-dr-input"
      />
      <input
        type="range" min={min} max={max} step={100} value={nMax}
        onChange={(e) => { const v = parseInt(e.target.value); if (v >= (parseFloat(valMin) || min)) onMax(String(v)); }}
        className="fm-dr-input"
      />
    </div>
  );
}

export function FilterModal({ open, onClose, onApply, liveCount, onFilterChange }: FilterModalProps) {
  const searchParams = useSearchParams();
  const [filterData, setFilterData] = useState<FilterData | null>(null);
  const [draft, setDraft] = useState<Record<string, string[]>>({});
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeCat, setActiveCat] = useState('layout');
  const [mobileView, setMobileView] = useState<'nav' | 'options'>('nav');
  const modalRef = useRef<HTMLDivElement>(null);
  const prevFocus = useRef<HTMLElement | null>(null);

  const initDraft = useCallback(() => {
    setDraft(parseFiltersFromParams(searchParams));
    setPriceMin(searchParams.get('priceMin') || '');
    setPriceMax(searchParams.get('priceMax') || '');
  }, [searchParams]);

  useEffect(() => {
    if (open) {
      prevFocus.current = document.activeElement as HTMLElement;
      initDraft();
      setLoading(true);
      fetch('/api/products/filters')
        .then((r) => r.json())
        .then((d) => { setFilterData(d); setLoading(false); })
        .catch(() => setLoading(false));
    } else {
      prevFocus.current?.focus();
    }
  }, [open, initDraft]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    const onClick = (e: MouseEvent) => { if (modalRef.current && !modalRef.current.contains(e.target as Node)) onClose(); };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  const categories: Category[] = useMemo(() => {
    if (!filterData) return [];
    const cats: Category[] = [];
    for (const [slug, sf] of Object.entries(filterData.specFields)) {
      if (sf.options.length > 0) cats.push({ key: slug, label: sf.name, count: getCount(slug, draft, priceMin, priceMax) });
    }
    cats.push({ key: 'brand', label: 'Brands', count: getCount('brand', draft, priceMin, priceMax) });
    if (filterData.vendors.length > 0) cats.push({ key: 'vendor', label: 'Vendors', count: getCount('vendor', draft, priceMin, priceMax) });
    cats.push({ key: 'availability', label: 'Availability', count: getCount('availability', draft, priceMin, priceMax) });
    cats.push({ key: 'price', label: 'Price', count: getCount('price', draft, priceMin, priceMax) });
    return cats;
  }, [filterData, draft, priceMin, priceMax]);

  const currentGroup = useMemo(() => {
    if (!filterData || activeCat === 'price') return null;
    if (activeCat === 'brand') return { key: 'brand', label: 'Brands', options: filterData.brands.map((b) => ({ value: b.name, label: b.name })) };
    if (activeCat === 'vendor') return { key: 'vendor', label: 'Vendors', options: filterData.vendors.map((v) => ({ value: v.name, label: v.name })) };
    if (activeCat === 'availability') return { key: 'availability', label: 'Availability', options: Object.entries(STOCK_LABELS).map(([v, l]) => ({ value: v, label: l })) };
    const sf = filterData.specFields[activeCat];
    if (sf) return { key: sf.slug, label: sf.name, options: sf.options.map((v) => ({ value: v, label: v })) };
    return null;
  }, [filterData, activeCat]);

  function toggle(key: string, value: string) {
    setDraft((prev) => {
      const cur = prev[key] || [];
      const next = cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value];
      const upd = { ...prev };
      if (next.length === 0) delete upd[key]; else upd[key] = next;
      return upd;
    });
  }

  function removeFilter(key: string, value: string) {
    setDraft((prev) => {
      const upd = { ...prev };
      if (upd[key]) { upd[key] = upd[key].filter((v) => v !== value); if (upd[key].length === 0) delete upd[key]; }
      return upd;
    });
  }

  function resetAll() { setDraft({}); setPriceMin(''); setPriceMax(''); }

  const totalActive = Object.values(draft).reduce((s, a) => s + a.length, 0) + (priceMin ? 1 : 0) + (priceMax ? 1 : 0);

  function handleApply() {
    onFilterChange(draft, { min: priceMin, max: priceMax });
    onApply(draft, { min: priceMin, max: priceMax });
    onClose();
  }

  useEffect(() => { onFilterChange(draft, { min: priceMin, max: priceMax }); }, [draft, priceMin, priceMax, onFilterChange]);

  if (!open) return null;

  const showChecklist = currentGroup && currentGroup.options.length > LARGE_LIST_THRESHOLD;

  return (
    <div className="fm-backdrop">
      <div className="fm" ref={modalRef} role="dialog" aria-modal="true">
        {/* Title bar */}
        <div className="fm-titlebar">
          <div className="fm-titlebar-left">
            <span className="fm-titlebar-icon">▸</span>
            <span className="fm-titlebar-text">FILTER_PRODUCTS.sh</span>
          </div>
          <div className="fm-titlebar-sub">Refine your search</div>
          <div className="fm-titlebar-actions">
            <span className="fm-titlebar-btn close" onClick={onClose}>✕</span>
          </div>
        </div>

        {/* Body: 3 columns */}
        <div className="fm-body">
          {/* Left nav */}
          <div className="fm-nav">
            {loading
              ? Array.from({ length: 8 }).map((_, i) => <div key={i} className="fm-nav-skel" />)
              : categories.map((cat) => (
                <button
                  key={cat.key}
                  className={`fm-nav-item ${activeCat === cat.key ? 'active' : ''}`}
                  onClick={() => { setActiveCat(cat.key); if (window.innerWidth < 768) setMobileView('options'); }}
                >
                  <span className="fm-nav-arrow">▸</span>
                  <span className="fm-nav-label">{cat.label}</span>
                  {cat.count > 0 && <span className="fm-nav-count">{cat.count}</span>}
                </button>
              ))
            }
          </div>

          {/* Center */}
          <div className={`fm-center ${mobileView === 'options' ? 'fm-center-active' : ''}`}>
            {mobileView === 'options' && (
              <button className="fm-mobile-back" onClick={() => setMobileView('nav')}>← Back</button>
            )}
            {loading ? (
              <div className="fm-center-skel">
                {Array.from({ length: 8 }).map((_, i) => <div key={i} className="fm-chip-skel" />)}
              </div>
            ) : activeCat === 'price' ? (
              <div className="fm-price">
                <div className="fm-section-title">PRICE RANGE</div>
                <DualRange
                  min={filterData?.priceRange.min ?? 0}
                  max={filterData?.priceRange.max ?? 100000}
                  valMin={priceMin} valMax={priceMax}
                  onMin={setPriceMin} onMax={setPriceMax}
                />
                <div className="fm-price-inputs">
                  <div className="fm-price-field">
                    <span className="fm-price-sym">₹</span>
                    <input type="number" placeholder="Min" value={priceMin} onChange={(e) => setPriceMin(e.target.value)} />
                  </div>
                  <span className="fm-price-dash">—</span>
                  <div className="fm-price-field">
                    <span className="fm-price-sym">₹</span>
                    <input type="number" placeholder="Max" value={priceMax} onChange={(e) => setPriceMax(e.target.value)} />
                  </div>
                </div>
              </div>
            ) : currentGroup ? (
              <div className="fm-options">
                <div className="fm-section-title">{currentGroup.label}</div>
                {showChecklist ? (
                  <CheckboxList
                    options={currentGroup.options}
                    selected={draft[currentGroup.key] || []}
                    onToggle={(v) => toggle(currentGroup.key, v)}
                    placeholder={`Search ${currentGroup.label.toLowerCase()}...`}
                  />
                ) : (
                  <div className="fm-chips">
                    {currentGroup.options.map((opt) => {
                      const active = (draft[currentGroup.key] || []).includes(opt.value);
                      return (
                        <button
                          key={opt.value}
                          className={`fm-chip ${active ? 'active' : ''}`}
                          onClick={() => toggle(currentGroup.key, opt.value)}
                          type="button"
                        >
                          <span className="fm-chip-icon">{active ? '✓' : '□'}</span>
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : null}
          </div>

          {/* Right: summary */}
          <div className="fm-right">
            <div className="fm-right-title">SELECTED</div>
            {totalActive === 0 ? (
              <div className="fm-right-empty">No filters</div>
            ) : (
              <div className="fm-right-list">
                {Object.entries(draft).map(([key, values]) => {
                  const cat = categories.find((c) => c.key === key);
                  return (
                    <div className="fm-right-group" key={key}>
                      <div className="fm-right-group-label">{cat?.label || key}</div>
                      {values.map((v) => (
                        <button key={v} className="fm-right-item" onClick={() => removeFilter(key, v)} type="button">
                          <span className="fm-right-check">✓</span> {v}
                        </button>
                      ))}
                    </div>
                  );
                })}
                {(priceMin || priceMax) && (
                  <div className="fm-right-group">
                    <div className="fm-right-group-label">Price</div>
                    <div className="fm-right-item">
                      <span className="fm-right-check">✓</span>
                      ₹{Number(priceMin || 0).toLocaleString()} — ₹{Number(priceMax || 0).toLocaleString() || '∞'}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Fixed footer */}
        <div className="fm-footer">
          <button className="btn-secondary" onClick={resetAll} type="button">
            <RotateCcw size={12} /> Reset
          </button>
          <div className="fm-footer-count">{liveCount} Products Found</div>
          <button className="btn-primary" onClick={handleApply} type="button">
            Apply Filters →
          </button>
        </div>
      </div>
    </div>
  );
}
