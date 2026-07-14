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
}

type TimeRange = '30D' | '3M' | '6M' | '1Y' | 'ALL';

const TIME_RANGES: { label: string; value: TimeRange; days: number | null }[] = [
  { label: '30D', value: '30D', days: 30 },
  { label: '3M', value: '3M', days: 90 },
  { label: '6M', value: '6M', days: 180 },
  { label: '1Y', value: '1Y', days: 365 },
  { label: 'ALL', value: 'ALL', days: null },
];

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

export function PriceHistoryChart({ history }: PriceHistoryChartProps) {
  const [activeRange, setActiveRange] = useState<TimeRange>('6M');
  const [tooltip, setTooltip] = useState<{ x: number; y: number; point: PricePoint } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [now] = useState(() => Date.now());

  const filteredHistory = useMemo(() => {
    const range = TIME_RANGES.find((r) => r.value === activeRange);
    if (!range?.days) return history;
    const cutoff = new Date(now - range.days * 24 * 60 * 60 * 1000);
    const filtered = history.filter((h) => new Date(h.recordedAt) >= cutoff);
    return filtered.length > 0 ? filtered : history;
  }, [history, activeRange, now]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (!svgRef.current || filteredHistory.length === 0) return;
      const rect = svgRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const svgW = rect.width;

      const padL = 60;
      const padR = 20;
      const chartW = svgW - padL - padR;

      const relX = mouseX - padL;
      const idx = Math.round((relX / chartW) * (filteredHistory.length - 1));
      const clamped = Math.max(0, Math.min(filteredHistory.length - 1, idx));

      const svgH = rect.height;
      const padT = 20;
      const padB = 40;
      const chartH = svgH - padT - padB;

      const point = filteredHistory[clamped];
      const prices = filteredHistory.map((h) => toNum(h.price));
      const minP = Math.min(...prices);
      const maxP = Math.max(...prices);
      const range = maxP - minP || 1;
      const padding = range * 0.15;
      const yMin = minP - padding;
      const yMax = maxP + padding;
      const yRange = yMax - yMin || 1;

      const pointX = padL + (clamped / Math.max(filteredHistory.length - 1, 1)) * chartW;
      const pointY = padT + chartH - ((toNum(point.price) - yMin) / yRange) * chartH;

      setTooltip({ x: pointX, y: pointY, point });
    },
    [filteredHistory]
  );

  const handleMouseLeave = useCallback(() => setTooltip(null), []);

  if (history.length === 0) {
    return (
      <div className="spec-empty">
        No price history available yet.
      </div>
    );
  }

  const prices = filteredHistory.map((h) => toNum(h.price));
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const rangePad = (maxPrice - minPrice) * 0.15 || 500;
  const yMin = minPrice - rangePad;
  const yMax = maxPrice + rangePad;
  const yRange = yMax - yMin || 1;

  const svgW = 700;
  const svgH = 300;
  const padL = 60;
  const padR = 20;
  const padT = 20;
  const padB = 40;
  const chartW = svgW - padL - padR;
  const chartH = svgH - padT - padB;

  const toX = (i: number) => padL + (i / Math.max(filteredHistory.length - 1, 1)) * chartW;
  const toY = (p: number) => padT + chartH - ((p - yMin) / yRange) * chartH;

  const linePoints = filteredHistory.map((h, i) => `${toX(i)},${toY(toNum(h.price))}`).join(' ');
  const areaPoints = `${toX(0)},${padT + chartH} ${linePoints} ${toX(filteredHistory.length - 1)},${padT + chartH}`;

  const yTicks = 5;
  const yTickValues = Array.from({ length: yTicks + 1 }, (_, i) => yMin + (i / yTicks) * yRange);

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const xLabelCount = Math.min(filteredHistory.length, 6);
  const xStep = Math.max(1, Math.floor(filteredHistory.length / xLabelCount));
  const xLabels = filteredHistory
    .map((h, i) => ({ i, label: months[new Date(h.recordedAt).getMonth()] }))
    .filter((_, i) => i % xStep === 0 || i === filteredHistory.length - 1);

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

          <polygon points={areaPoints} className="price-chart-area" />
          <polyline points={linePoints} className="price-chart-line" fill="none" />

          {filteredHistory.map((h, i) => (
            <circle key={i} cx={toX(i)} cy={toY(toNum(h.price))} r={3} className="price-chart-dot" />
          ))}

          {xLabels.map((l) => (
            <text key={l.i} x={toX(l.i)} y={svgH - 8} className="price-chart-xlabel">
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
              <circle cx={tooltip.x} cy={tooltip.y} r={5} className="price-chart-tooltip-dot" />
            </>
          )}
        </svg>

        {tooltip && (
          <div
            className="price-chart-tooltip"
            style={{
              left: `${(tooltip.x / svgW) * 100}%`,
              top: `${(tooltip.y / svgH) * 100}%`,
            }}
          >
            <div className="price-chart-tooltip-price">{formatPrice(toNum(tooltip.point.price))}</div>
            <div className="price-chart-tooltip-date">{formatDate(new Date(tooltip.point.recordedAt))}</div>
            {tooltip.point.vendor && (
              <div className="price-chart-tooltip-vendor">{tooltip.point.vendor}</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
