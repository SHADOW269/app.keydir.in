'use client';

import { useState, useRef, useCallback, useMemo } from 'react';
import { formatPrice } from '@/lib/utils';

interface PricePoint {
  price: number;
  recordedAt: Date;
  vendor?: string;
}

interface PriceHistoryChartProps {
  history: PricePoint[];
  vendorColors?: Record<string, string>;
}

type TimeRange = '30D' | '3M' | '6M' | '1Y' | 'ALL';

const TIME_RANGES: { label: string; value: TimeRange; days: number | null }[] = [
  { label: '30D', value: '30D', days: 30 },
  { label: '3M', value: '3M', days: 90 },
  { label: '6M', value: '6M', days: 180 },
  { label: '1Y', value: '1Y', days: 365 },
  { label: 'ALL', value: 'ALL', days: null },
];

const FALLBACK_PALETTE = [
  '#22C55E',
  '#EAB308',
  '#EF4444',
  '#3B82F6',
  '#A855F7',
  '#14B8A6',
  '#F97316',
];

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function toNum(v: unknown): number {
  if (typeof v === 'number') return v;
  if (typeof v === 'string') return parseFloat(v);
  if (v && typeof v === 'object' && 'toNumber' in v) return (v as { toNumber(): number }).toNumber();
  return 0;
}

function formatDate(d: Date): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

function toDateKey(d: Date): number {
  const dt = new Date(d);
  dt.setHours(0, 0, 0, 0);
  return dt.getTime();
}

function buildUnifiedTimeline(history: PricePoint[]): number[] {
  const dateSet = new Set<number>();
  for (const p of history) {
    dateSet.add(toDateKey(new Date(p.recordedAt)));
  }
  return Array.from(dateSet).sort((a, b) => a - b);
}

interface VendorGroup {
  vendor: string;
  points: PricePoint[];
  color: { line: string; area: string };
}

function buildVendorGroups(
  filteredHistory: PricePoint[],
  vendorColors: Record<string, string>
): VendorGroup[] {
  const map = new Map<string, PricePoint[]>();
  for (const p of filteredHistory) {
    const name = p.vendor || 'Unknown';
    if (!map.has(name)) map.set(name, []);
    map.get(name)!.push(p);
  }

  let fallbackIndex = 0;
  return Array.from(map.entries()).map(([vendor, points]) => {
    const configured = vendorColors[vendor];
    let hex: string;
    if (configured && /^#[0-9a-fA-F]{6}$/.test(configured)) {
      hex = configured;
    } else {
      hex = FALLBACK_PALETTE[fallbackIndex % FALLBACK_PALETTE.length];
      fallbackIndex++;
    }

    return {
      vendor,
      points: points.sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()),
      color: { line: hex, area: hexToRgba(hex, 0.08) },
    };
  });
}

interface DensePoint {
  dateIndex: number;
  price: number;
}

function buildDenseSeries(
  group: VendorGroup,
  dateKeyToIndex: Map<number, number>
): (DensePoint | null)[] {
  const dense: (DensePoint | null)[] = new Array(dateKeyToIndex.size).fill(null);
  for (const p of group.points) {
    const key = toDateKey(new Date(p.recordedAt));
    const idx = dateKeyToIndex.get(key);
    if (idx !== undefined) {
      dense[idx] = { dateIndex: idx, price: toNum(p.price) };
    }
  }
  return dense;
}

function segmentDense(dense: (DensePoint | null)[]): DensePoint[][] {
  const segments: DensePoint[][] = [];
  let current: DensePoint[] = [];
  for (const pt of dense) {
    if (pt) {
      current.push(pt);
    } else {
      if (current.length > 0) {
        segments.push(current);
        current = [];
      }
    }
  }
  if (current.length > 0) segments.push(current);
  return segments;
}

interface TooltipVendor {
  vendor: string;
  price: number;
  color: string;
  y: number;
}

interface TooltipState {
  x: number;
  date: Date;
  vendors: TooltipVendor[];
}

function getTooltipData(
  denseSeries: { vendor: string; dense: (DensePoint | null)[]; color: { line: string } }[],
  dateIndex: number,
  unifiedDates: number[],
  toY: (p: number) => number
): TooltipVendor[] {
  const vendors: TooltipVendor[] = [];
  for (const s of denseSeries) {
    const pt = s.dense[dateIndex];
    if (pt) {
      vendors.push({
        vendor: s.vendor,
        price: pt.price,
        color: s.color.line,
        y: toY(pt.price),
      });
    }
  }
  vendors.sort((a, b) => a.price - b.price);
  return vendors;
}

export function PriceHistoryChart({ history, vendorColors = {} }: PriceHistoryChartProps) {
  const [activeRange, setActiveRange] = useState<TimeRange>('6M');
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [now] = useState(() => Date.now());

  const filteredHistory = useMemo(() => {
    const range = TIME_RANGES.find((r) => r.value === activeRange);
    if (!range?.days) return history;
    const cutoff = new Date(now - range.days * 24 * 60 * 60 * 1000);
    const filtered = history.filter((h) => new Date(h.recordedAt) >= cutoff);
    return filtered.length > 0 ? filtered : history;
  }, [history, activeRange, now]);

  const vendorGroups = useMemo(
    () => buildVendorGroups(filteredHistory, vendorColors),
    [filteredHistory, vendorColors]
  );

  const unifiedDates = useMemo(() => buildUnifiedTimeline(filteredHistory), [filteredHistory]);

  const dateKeyToIndex = useMemo(() => {
    const map = new Map<number, number>();
    unifiedDates.forEach((d, i) => map.set(d, i));
    return map;
  }, [unifiedDates]);

  const denseSeries = useMemo(
    () =>
      vendorGroups.map((group) => ({
        vendor: group.vendor,
        color: group.color,
        dense: buildDenseSeries(group, dateKeyToIndex),
      })),
    [vendorGroups, dateKeyToIndex]
  );

  const allPrices = filteredHistory.map((h) => toNum(h.price));
  const maxPrice = Math.max(...allPrices);
  const yMin = 0;
  const yMax = maxPrice * 1.1 || 1000;
  const yRange = yMax - yMin || 1;

  const svgW = 700;
  const svgH = 300;
  const padL = 60;
  const padR = 20;
  const padT = 20;
  const padB = 40;
  const chartW = svgW - padL - padR;
  const chartH = svgH - padT - padB;

  const toXUnified = useCallback(
    (dateIndex: number) => padL + (dateIndex / Math.max(unifiedDates.length - 1, 1)) * chartW,
    [unifiedDates.length, chartW]
  );

  const toY = useCallback(
    (p: number) => padT + chartH - ((p - yMin) / yRange) * chartH,
    [yMin, yRange, chartH]
  );

  const yTicks = 5;
  const yTickValues = Array.from({ length: yTicks + 1 }, (_, i) => yMin + (i / yTicks) * yRange);

  const xLabels = useMemo(() => {
    const maxLabels = 6;
    if (unifiedDates.length <= maxLabels) {
      return unifiedDates.map((d, i) => ({ i, label: formatDate(new Date(d)) }));
    }
    const step = Math.max(1, Math.floor((unifiedDates.length - 1) / (maxLabels - 1)));
    const labels: { i: number; label: string }[] = [];
    for (let i = 0; i < unifiedDates.length; i += step) {
      labels.push({ i, label: formatDate(new Date(unifiedDates[i])) });
    }
    const last = unifiedDates.length - 1;
    if (labels[labels.length - 1].i !== last) {
      labels.push({ i: last, label: formatDate(new Date(unifiedDates[last])) });
    }
    return labels;
  }, [unifiedDates]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (!svgRef.current || unifiedDates.length === 0) return;
      const rect = svgRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;

      const relX = mouseX - padL;
      const dateRatio = relX / chartW;
      const nearestIndex = Math.round(dateRatio * (unifiedDates.length - 1));
      const clampedIndex = Math.max(0, Math.min(unifiedDates.length - 1, nearestIndex));

      const x = toXUnified(clampedIndex);
      const vendors = getTooltipData(denseSeries, clampedIndex, unifiedDates, toY);

      setTooltip({ x, date: new Date(unifiedDates[clampedIndex]), vendors });
    },
    [unifiedDates, denseSeries, chartW, toXUnified, toY]
  );

  const handleMouseLeave = useCallback(() => setTooltip(null), []);

  if (history.length === 0) {
    return (
      <div className="spec-empty">
        No price history available yet.
      </div>
    );
  }

  return (
    <div className="price-chart-container">
      <div className="price-chart-range-bar">
        {TIME_RANGES.map((r) => (
          <button
            key={r.value}
            className={`price-chart-range-btn ${activeRange === r.value ? 'active' : ''}`}
            onClick={() => setActiveRange(r.value)}
          >
            {r.label}
          </button>
        ))}
      </div>

      <div className="price-chart-wrap">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${svgW} ${svgH}`}
          className="price-chart-svg"
          preserveAspectRatio="xMidYMid meet"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {yTickValues.map((v) => (
            <g key={v}>
              <line x1={padL} y1={toY(v)} x2={svgW - padR} y2={toY(v)} className="price-chart-grid" />
              <text x={padL - 8} y={toY(v) + 4} className="price-chart-ylabel">
                {formatPrice(v)}
              </text>
            </g>
          ))}

          {denseSeries.map(({ vendor, dense, color }) => {
            const segments = segmentDense(dense);
            return (
              <g key={vendor}>
                {segments.map((seg, si) => {
                  const linePoints = seg.map((pt) => `${toXUnified(pt.dateIndex)},${toY(pt.price)}`).join(' ');
                  const firstX = toXUnified(seg[0].dateIndex);
                  const lastX = toXUnified(seg[seg.length - 1].dateIndex);
                  const areaPoints = `${firstX},${padT + chartH} ${linePoints} ${lastX},${padT + chartH}`;
                  return (
                    <g key={si}>
                      <polygon points={areaPoints} fill={color.area} />
                      <polyline points={linePoints} fill="none" stroke={color.line} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
                    </g>
                  );
                })}
                {dense.map((pt, i) =>
                  pt ? (
                    <circle key={i} cx={toXUnified(pt.dateIndex)} cy={toY(pt.price)} r={3} fill={color.line} stroke="var(--surface)" strokeWidth={1.5} />
                  ) : null
                )}
              </g>
            );
          })}

          {xLabels.map((l) => (
            <text key={l.i} x={toXUnified(l.i)} y={svgH - 8} className="price-chart-xlabel">
              {l.label}
            </text>
          ))}

          {tooltip && (
            <>
              <line
                x1={tooltip.x}
                y1={padT}
                x2={tooltip.x}
                y2={padT + chartH}
                className="price-chart-crosshair"
              />
              {tooltip.vendors.map((v) => (
                <circle key={v.vendor} cx={tooltip.x} cy={v.y} r={5} fill={v.color} stroke="var(--surface)" strokeWidth={2} />
              ))}
            </>
          )}
        </svg>

        {tooltip && (
          <div
            className="price-chart-tooltip"
            style={{
              left: `${(tooltip.x / svgW) * 100}%`,
              top: '10%',
            }}
          >
            <div className="price-chart-tooltip-date">{formatDate(tooltip.date)}</div>
            {tooltip.vendors.map((v) => (
              <div key={v.vendor} className="price-chart-tooltip-row">
                <span className="price-chart-tooltip-swatch" style={{ background: v.color }} />
                <span className="price-chart-tooltip-vendor">{v.vendor}</span>
                <span className="price-chart-tooltip-price">{formatPrice(v.price)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {vendorGroups.length > 1 && (
        <div className="price-chart-legend">
          {vendorGroups.map(({ vendor, color }) => (
            <div key={vendor} className="price-chart-legend-item">
              <span className="price-chart-legend-swatch" style={{ background: color.line }} />
              <span className="price-chart-legend-label">{vendor}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
