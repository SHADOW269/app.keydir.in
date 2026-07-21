export interface VendorHealthInput {
  successRate: number | null;
}

export interface VendorHealthResult {
  status: 'healthy' | 'warning' | 'error' | 'unknown';
  color: string;
  label: string;
}

export function computeVendorHealth(successRate: number | null): VendorHealthResult {
  const status = successRate === null ? 'unknown' : successRate >= 80 ? 'healthy' : successRate >= 50 ? 'warning' : 'error';
  const color = status === 'healthy' ? 'var(--green)' : status === 'warning' ? 'var(--orange)' : status === 'unknown' ? 'var(--text-dim)' : 'var(--red)';
  const label = status === 'healthy' ? 'HEALTHY' : status === 'warning' ? 'WARNING' : status === 'unknown' ? 'NO DATA' : 'BROKEN';
  return { status, color, label };
}
