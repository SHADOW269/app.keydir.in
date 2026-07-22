'use client';

import { Card } from './admin-card';
import { Seg } from './form-primitives';

const TYPES = [
  { v: 'hero', l: 'Hero Banner', d: 'Full-width homepage banner', i: '▬' },
  { v: 'inline', l: 'Inline Banner', d: 'Between content rows', i: '▦' },
  { v: 'sidebar', l: 'Sidebar Banner', d: 'Sidebar placement', i: '▐' },
];

const RULES = [
  { v: 'desktop', l: 'Desktop' }, { v: 'mobile', l: 'Mobile' }, { v: 'both', l: 'Both' },
];

const PAGES = [
  { v: 'home', l: 'Home' }, { v: 'keyboards', l: 'Keyboards' },
  { v: 'switches', l: 'Switches' }, { v: 'keycaps', l: 'Keycaps' },
  { v: 'mouse', l: 'Mouse' },
];

function Chips({ items, sel, tog }: { items: { v: string; l: string }[]; sel: Set<string>; tog: (v: string) => void }) {
  return (
    <div className="ck">
      {items.map(i => (
        <button key={i.v} type="button" onClick={() => tog(i.v)}
          className={`ck-b ${sel.has(i.v) ? 'on' : ''}`}>{i.l}</button>
      ))}
    </div>
  );
}

interface Props {
  btype: string;
  onBtypeChange: (v: string) => void;
  rule: string;
  onRuleChange: (v: string) => void;
  locs: Set<string>;
  onLocToggle: (v: string) => void;
}

export function BannerConfigSection({ btype, onBtypeChange, rule, onRuleChange, locs, onLocToggle }: Props) {
  return (
    <Card t="Configuration">
      <div className="ce-field">
        <label className="ce-lb">Banner Type</label>
        <div className="sc">
          {TYPES.map(t => (
            <button key={t.v} type="button" onClick={() => onBtypeChange(t.v)}
              className={`sc-b ${btype === t.v ? 'on' : ''}`}>
              <span className="sc-ic">{t.i}</span>
              <span className="sc-body">
                <span className="sc-nm">{t.l}</span>
                <span className="sc-ds">{t.d}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
      <div className="ce-field">
        <label className="ce-lb">Display Rule</label>
        <Seg items={RULES} val={rule} set={onRuleChange} />
      </div>
      <div className="ce-field">
        <label className="ce-lb">Display Locations</label>
        <Chips items={PAGES} sel={locs} tog={onLocToggle} />
        {locs.size === 0 && <span className="ce-warn">Select at least one location</span>}
      </div>
    </Card>
  );
}
