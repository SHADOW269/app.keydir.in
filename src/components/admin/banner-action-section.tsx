'use client';

import { Card } from './admin-card';
import { Seg } from './form-primitives';

const ACTIONS = [
  { v: 'url', l: 'URL' }, { v: 'internal', l: 'Page' },
  { v: 'vendor', l: 'Vendor' }, { v: 'product', l: 'Product' },
  { v: 'category', l: 'Category' },
];

interface Props {
  ltype: string;
  onLtypeChange: (v: string) => void;
  lurl: string;
  onLurlChange: (v: string) => void;
  ntab: boolean;
  onNtabChange: (v: boolean) => void;
}

export function BannerActionSection({ ltype, onLtypeChange, lurl, onLurlChange, ntab, onNtabChange }: Props) {
  return (
    <Card t="Click Action">
      <div className="ce-field">
        <label className="ce-lb">Destination</label>
        <Seg items={ACTIONS} val={ltype} set={onLtypeChange} />
      </div>
      <div className="ce-field">
        <label className="ce-lb">
          {ltype === 'url' ? 'URL' : ltype === 'internal' ? 'Path' : `${ltype[0].toUpperCase() + ltype.slice(1)} Slug`}
        </label>
        <input className="admin-input ce-mono" value={lurl} onChange={e => onLurlChange(e.target.value)}
          placeholder={ltype === 'url' ? 'https://example.com' : ltype === 'internal' ? '/keyboards' : 'slug'} />
      </div>
      <div className="ce-field">
        <label className="ce-cb">
          <input type="checkbox" checked={ntab} onChange={e => onNtabChange(e.target.checked)} disabled={ltype === 'url'} />
          Open in new tab
          {ltype === 'url' && <span className="ce-hi"> (auto for external)</span>}
        </label>
      </div>
    </Card>
  );
}
