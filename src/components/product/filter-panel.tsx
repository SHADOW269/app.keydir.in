'use client';

import { useState, useRef, useMemo, useEffect } from 'react';
import { clamp } from '@/lib/utils';

interface FilterOptions {
  priceMin: number;
  priceMax: number;
}

interface FilterPanelProps {
  filterOptions: FilterOptions | null;
  pending: Record<string, string[]>;
  applied: Record<string, string[]>;
  priceMin: number;
  priceMax: number;
  PRICE_MIN: number;
  PRICE_MAX: number;
  onToggle: (key: string, val: string) => void;
  onRemove: (key: string, val: string) => void;
  onApply: () => void;
  onReset: () => void;
  onPriceMinChange: (v: number) => void;
  onPriceMaxChange: (v: number) => void;
  onPriceMinInputChange: (v: string) => void;
  onPriceMaxInputChange: (v: string) => void;
  onClose?: () => void;
}

const AVAILABILITY = ['In Stock', 'Pre-order', 'Group Buy', 'Coming Soon', 'Out of Stock'];

function fmtPrice(n: number): string {
  return '₹' + n.toLocaleString('en-IN');
}

function pctToVal(pct: number, PRICE_MIN: number, PRICE_MAX: number) {
  return Math.round(PRICE_MIN + (pct / 100) * (PRICE_MAX - PRICE_MIN));
}

function valToPct(val: number, PRICE_MIN: number, PRICE_MAX: number) {
  return ((val - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100;
}

export default function FilterPanel({
  filterOptions,
  pending,
  applied,
  priceMin,
  priceMax,
  PRICE_MIN,
  PRICE_MAX,
  onToggle,
  onRemove,
  onApply,
  onReset,
  onPriceMinChange,
  onPriceMaxChange,
  onPriceMinInputChange,
  onPriceMaxInputChange,
  onClose,
}: FilterPanelProps) {
  const sliderRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<'min' | 'max' | null>(null);

  useEffect(() => {
    if (!onClose) return;
    const close = onClose;
    function handleMouseDown(e: MouseEvent) {
      const target = e.target as Node;
      if (target instanceof HTMLElement && target.closest('.catalog-filter-btn')) return;
      if (wrapRef.current && !wrapRef.current.contains(target)) close();
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') close();
    }
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  function getPointerPct(e: React.PointerEvent | PointerEvent) {
    if (!sliderRef.current) return 0;
    const rect = sliderRef.current.getBoundingClientRect();
    return clamp(((e.clientX - rect.left) / rect.width) * 100, 0, 100);
  }

  function onPointerDown(handle: 'min' | 'max') {
    return (e: React.PointerEvent) => {
      e.preventDefault();
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      setDragging(handle);
    };
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!dragging) return;
    const p = getPointerPct(e);
    const v = pctToVal(p, PRICE_MIN, PRICE_MAX);
    if (dragging === 'min') onPriceMinChange(clamp(v, PRICE_MIN, priceMax - 100));
    else onPriceMaxChange(clamp(v, priceMin + 100, PRICE_MAX));
  }

  function onPointerUp() { setDragging(null); }

  const minPct = valToPct(priceMin, PRICE_MIN, PRICE_MAX);
  const maxPct = valToPct(priceMax, PRICE_MIN, PRICE_MAX);

  const selectedChips = useMemo(() => {
    const chips: { key: string; val: string; label: string }[] = [];
    for (const [k, vals] of Object.entries(applied)) {
      for (const v of vals) {
        let label = v;
        if (k === 'priceMin') label = `Min ₹${parseInt(v).toLocaleString('en-IN')}`;
        else if (k === 'priceMax') label = `Max ₹${parseInt(v).toLocaleString('en-IN')}`;
        else if (k === 'availability') label = v;
        chips.push({ key: k, val: v, label });
      }
    }
    return chips;
  }, [applied]);

  return (
    <div className="kb-explorer-wrap" ref={wrapRef}>
      <div className="kb-explorer">
        <div className="kb-explorer-header">Filters</div>

        <div className="kb-explorer-options">
          <div className="kb-filter-columns">
            <div className="kb-explorer-group">
              <div className="kb-explorer-group-label">Price Range</div>
              <div className="kb-price-display">
                <span>{fmtPrice(priceMin)}</span>
                <span className="kb-explorer-price-sep">—</span>
                <span>{priceMax >= PRICE_MAX ? `${fmtPrice(PRICE_MAX)}+` : fmtPrice(priceMax)}</span>
              </div>
              <div
                className="kb-range-slider"
                ref={sliderRef}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerLeave={onPointerUp}
              >
                <div className="kb-range-track">
                  <div className="kb-range-active" style={{ left: `${minPct}%`, width: `${maxPct - minPct}%` }} />
                </div>
                <div className="kb-range-handle" style={{ left: `${minPct}%` }} onPointerDown={onPointerDown('min')} />
                <div className="kb-range-handle" style={{ left: `${maxPct}%` }} onPointerDown={onPointerDown('max')} />
              </div>
              <div className="kb-price-inputs">
                <div className="kb-price-input-wrap">
                  <span className="kb-price-input-prefix">₹</span>
                  <input type="text" className="kb-price-input" value={priceMin.toLocaleString('en-IN')} onChange={(e) => onPriceMinInputChange(e.target.value)} />
                </div>
                <span className="kb-explorer-price-sep">—</span>
                <div className="kb-price-input-wrap">
                  <span className="kb-price-input-prefix">₹</span>
                  <input type="text" className="kb-price-input" value={priceMax >= PRICE_MAX ? `${PRICE_MAX.toLocaleString('en-IN')}+` : priceMax.toLocaleString('en-IN')} onChange={(e) => onPriceMaxInputChange(e.target.value)} />
                </div>
              </div>
            </div>

            <div className="kb-explorer-group">
              <div className="kb-explorer-group-label">Availability</div>
              <div className="kb-explorer-chips-col">
                {AVAILABILITY.map((a) => (
                  <button key={a} type="button" className={`kb-explorer-chip ${(pending.availability || []).includes(a) ? 'active' : ''}`} onClick={() => onToggle('availability', a)}>
                    <span className="kb-explorer-chk">{(pending.availability || []).includes(a) ? '☑' : '☐'}</span>{a}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="kb-filter-selected">
            <div className="kb-filter-selected-header">Selected</div>
            {selectedChips.length === 0 ? (
              <span className="kb-filter-selected-none">None</span>
            ) : (
              <div className="kb-filter-selected-items">
                {selectedChips.map((c) => (
                  <span key={`${c.key}-${c.val}`} className="kb-filter-sel-chip">
                    <span>{c.label}</span>
                    <button type="button" className="kb-filter-sel-x" onClick={() => onRemove(c.key, c.val)}>×</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="kb-filter-actions">
            <button type="button" className="btn-secondary" onClick={onReset}>Reset</button>
            <button type="button" className="btn-primary" onClick={onApply}>Apply</button>
          </div>
        </div>
      </div>
    </div>
  );
}
