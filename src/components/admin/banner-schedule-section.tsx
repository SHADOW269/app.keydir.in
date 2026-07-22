'use client';

import { Card } from './admin-card';

interface Props {
  dts: string;
  onDtsChange: (v: string) => void;
  dte: string;
  onDteChange: (v: string) => void;
  effLabel: string;
  effColor: string;
  startAfterEnd: boolean;
}

export function BannerScheduleSection({ dts, onDtsChange, dte, onDteChange, effLabel, effColor, startAfterEnd }: Props) {
  return (
    <Card t="Schedule">
      <div className="ce-2c">
        <div className="ce-field">
          <label className="ce-lb">Start Date</label>
          <input className="admin-input" type="date" value={dts} onChange={e => onDtsChange(e.target.value)} />
        </div>
        <div className="ce-field">
          <label className="ce-lb">End Date</label>
          <input className="admin-input" type="date" value={dte} onChange={e => onDteChange(e.target.value)} />
        </div>
      </div>
      <div className="ce-eff">
        <span className="ce-eff-l">Effective Status:</span>
        <span className="ce-eff-v" style={{ color: effColor }}>{effLabel}</span>
        {startAfterEnd && <span className="ce-warn">Start after end</span>}
      </div>
    </Card>
  );
}
