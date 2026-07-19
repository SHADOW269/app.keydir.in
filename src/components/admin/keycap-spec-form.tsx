'use client';

import { useState } from 'react';
import { CollapsibleCard } from './collapsible-card';

const PROFILES = ['Cherry', 'OEM', 'XDA', 'DSA', 'CSA', 'KAT', 'MT3', 'SA', 'MDA', 'MOA', 'MA', 'Other'];
const LAYOUT_SUPPORT = ['60%', '65%', '75%', 'TKL', '96%', '1800', 'Full Size', 'Alice', 'ISO', 'HHKB', 'Split Space', 'Numpad'];
const MATERIALS = ['PBT', 'ABS', 'POM', 'PC', 'Resin', 'Metal'];
const MANUFACTURING = ['Double-shot', 'Dye Sublimation', 'Reverse Dye Sub', 'UV Printed', 'Laser Etched', 'Pad Printed'];
const LEGENDS = ['Shine Through', 'Non Shine Through', 'Side Printed', 'Front Printed', 'Blank'];
const LANGUAGE = ['English', 'Japanese', 'Korean', 'Russian', 'Other'];
const KEY_COUNT = ['61', '68', '84', '87', '98', '104', '108', '129+', 'Custom'];
const STEM_COMPAT = ['MX', 'Low Profile MX', 'Topre', 'Choc V1', 'Choc V2'];
const THICKNESS = ['1.3mm', '1.5mm', '1.7mm', 'Unknown'];
const MANUFACTURERS = ['GMK', 'Key Kobo', 'JTK', 'Domikey', 'PBTFans', 'NicePBT', 'ePBT', 'WS', 'Other'];

interface KeycapSpecData {
  keycapProfile?: string[] | null;
  keycapLayoutSupport?: string[] | null;
  keycapMaterial?: string[] | null;
  keycapManufacturing?: string[] | null;
  keycapLegends?: string[] | null;
  keycapLegendPlacement?: string[] | null;
  keycapLanguage?: string[] | null;
  keycapKeyCount?: string[] | null;
  keycapStemCompat?: string[] | null;
  keycapThickness?: string | null;
  keycapColorway?: string | null;
  keycapManufacturer?: string[] | null;
  keycapDesigner?: string | null;
  keycapNovelties?: boolean;
  keycapSpacebars?: boolean;
  keycapAccentKeys?: boolean;
  keycapArtisan?: boolean;
  keycapNotes?: string | null;
}

interface Props {
  spec?: KeycapSpecData | null;
  onChange?: () => void;
}

function ChipSelect({ options, value, onChange, name }: { options: string[]; value: string[]; onChange: (v: string[]) => void; name: string }) {
  const toggle = (opt: string) => onChange(value.includes(opt) ? value.filter((v) => v !== opt) : [...value, opt]);
  return (
    <div className="kb-chip-grid">
      <input type="hidden" name={name} value={JSON.stringify(value)} />
      {options.map((opt) => (
        <button key={opt} type="button" className={`kb-chip ${value.includes(opt) ? 'active' : ''}`} onClick={() => toggle(opt)}>
          <span className="kb-chip-check">{value.includes(opt) ? '☑' : '☐'}</span>
          {opt}
        </button>
      ))}
    </div>
  );
}

function Toggle({ label, name, checked, onChange }: { label: string; name: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="kb-toggle-row">
      <span className="kb-toggle-label">{label}</span>
      <input type="hidden" name={name} value={checked ? 'true' : 'false'} />
      <div className="kb-toggle-right">
        <span className={`kb-toggle-status ${checked ? 'on' : ''}`}>{checked ? 'Yes' : 'No'}</span>
        <button type="button" className={`kb-switch ${checked ? 'on' : ''}`} onClick={() => onChange(!checked)} aria-label={label}>
          <span className="kb-switch-thumb" />
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="kb-field">
      <label className="kb-field-label">{label}</label>
      {children}
    </div>
  );
}

export function KeycapSpecForm({ spec, onChange }: Props) {
  const markChange = () => onChange?.();

  const [keycapProfile, setKeycapProfile] = useState<string[]>(spec?.keycapProfile ?? []);
  const [keycapLayoutSupport, setKeycapLayoutSupport] = useState<string[]>(spec?.keycapLayoutSupport ?? []);
  const [keycapMaterial, setKeycapMaterial] = useState<string[]>(spec?.keycapMaterial ?? []);
  const [keycapManufacturing, setKeycapManufacturing] = useState<string[]>(spec?.keycapManufacturing ?? []);
  const [keycapLegends, setKeycapLegends] = useState<string[]>(spec?.keycapLegends ?? []);
  const [keycapLegendPlacement, setKeycapLegendPlacement] = useState<string[]>(spec?.keycapLegendPlacement ?? []);
  const [keycapLanguage, setKeycapLanguage] = useState<string[]>(spec?.keycapLanguage ?? []);
  const [keycapKeyCount, setKeycapKeyCount] = useState<string[]>(spec?.keycapKeyCount ?? []);
  const [keycapStemCompat, setKeycapStemCompat] = useState<string[]>(spec?.keycapStemCompat ?? []);
  const [keycapThickness, setKeycapThickness] = useState(spec?.keycapThickness ?? '');
  const [keycapColorway, setKeycapColorway] = useState(spec?.keycapColorway ?? '');
  const [keycapManufacturer, setKeycapManufacturer] = useState<string[]>(spec?.keycapManufacturer ?? []);
  const [keycapDesigner, setKeycapDesigner] = useState(spec?.keycapDesigner ?? '');
  const [keycapNovelties, setKeycapNovelties] = useState(spec?.keycapNovelties ?? false);
  const [keycapSpacebars, setKeycapSpacebars] = useState(spec?.keycapSpacebars ?? false);
  const [keycapAccentKeys, setKeycapAccentKeys] = useState(spec?.keycapAccentKeys ?? false);
  const [keycapArtisan, setKeycapArtisan] = useState(spec?.keycapArtisan ?? false);
  const [keycapNotes, setKeycapNotes] = useState(spec?.keycapNotes ?? '');

  return (
    <>
      {/* 1. Profile */}
      <CollapsibleCard title="Profile" icon="🎨" id="kc-card-profile">
        <Field label="Keycap Profile">
          <div className="kb-chip-container">
            <ChipSelect name="keycapProfile" options={PROFILES} value={keycapProfile} onChange={(v) => { setKeycapProfile(v); markChange(); }} />
          </div>
        </Field>
      </CollapsibleCard>

      {/* 2. Layout Support */}
      <CollapsibleCard title="Layout Support" icon="📐" id="kc-card-layout" defaultOpen={false}>
        <Field label="Layout Support">
          <div className="kb-chip-container">
            <ChipSelect name="keycapLayoutSupport" options={LAYOUT_SUPPORT} value={keycapLayoutSupport} onChange={(v) => { setKeycapLayoutSupport(v); markChange(); }} />
          </div>
        </Field>
      </CollapsibleCard>

      {/* 3. Material & Manufacturing */}
      <CollapsibleCard title="Material & Manufacturing" icon="🧪" id="kc-card-material">
        <Field label="Material">
          <div className="kb-chip-container">
            <ChipSelect name="keycapMaterial" options={MATERIALS} value={keycapMaterial} onChange={(v) => { setKeycapMaterial(v); markChange(); }} />
          </div>
        </Field>
        <Field label="Manufacturing Method">
          <div className="kb-chip-container">
            <ChipSelect name="keycapManufacturing" options={MANUFACTURING} value={keycapManufacturing} onChange={(v) => { setKeycapManufacturing(v); markChange(); }} />
          </div>
        </Field>
      </CollapsibleCard>

      {/* 4. Legends */}
      <CollapsibleCard title="Legends" icon="🔤" id="kc-card-legends" defaultOpen={false}>
        <Field label="Legend Type">
          <div className="kb-chip-container">
            <ChipSelect name="keycapLegends" options={LEGENDS} value={keycapLegends} onChange={(v) => { setKeycapLegends(v); markChange(); }} />
          </div>
        </Field>
        <Field label="Legend Placement">
          <div className="kb-chip-container">
            <ChipSelect name="keycapLegendPlacement" options={['Top-Printed', 'Side-Printed', 'Front-Printed', 'Blank', 'Pudding', 'Other']} value={keycapLegendPlacement} onChange={(v) => { setKeycapLegendPlacement(v); markChange(); }} />
          </div>
        </Field>
      </CollapsibleCard>

      {/* 5. Language & Layout */}
      <CollapsibleCard title="Language & Layout" icon="🌍" id="kc-card-language" defaultOpen={false}>
        <Field label="Language">
          <div className="kb-chip-container">
            <ChipSelect name="keycapLanguage" options={LANGUAGE} value={keycapLanguage} onChange={(v) => { setKeycapLanguage(v); markChange(); }} />
          </div>
        </Field>
        <Field label="Key Count">
          <div className="kb-chip-container">
            <ChipSelect name="keycapKeyCount" options={KEY_COUNT} value={keycapKeyCount} onChange={(v) => { setKeycapKeyCount(v); markChange(); }} />
          </div>
        </Field>
        <Field label="Stem Compatibility">
          <div className="kb-chip-container">
            <ChipSelect name="keycapStemCompat" options={STEM_COMPAT} value={keycapStemCompat} onChange={(v) => { setKeycapStemCompat(v); markChange(); }} />
          </div>
        </Field>
      </CollapsibleCard>

      {/* 6. Physical */}
      <CollapsibleCard title="Physical" icon="📏" id="kc-card-physical" defaultOpen={false}>
        <Field label="Thickness">
          <select name="keycapThickness" value={keycapThickness} onChange={(e) => { setKeycapThickness(e.target.value); markChange(); }} className="kb-input">
            <option value="">— Select —</option>
            {THICKNESS.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </Field>
      </CollapsibleCard>

      {/* 7. Identity */}
      <CollapsibleCard title="Identity" icon="🏷" id="kc-card-identity" defaultOpen={false}>
        <Field label="Colorway">
          <input name="keycapColorway" value={keycapColorway} onChange={(e) => { setKeycapColorway(e.target.value); markChange(); }} className="kb-input" placeholder="e.g. BOW, Botanical, Hammer" />
        </Field>
        <Field label="Manufacturer">
          <div className="kb-chip-container">
            <ChipSelect name="keycapManufacturer" options={MANUFACTURERS} value={keycapManufacturer} onChange={(v) => { setKeycapManufacturer(v); markChange(); }} />
          </div>
        </Field>
        <Field label="Designer">
          <input name="keycapDesigner" value={keycapDesigner} onChange={(e) => { setKeycapDesigner(e.target.value); markChange(); }} className="kb-input" placeholder="Designer name" />
        </Field>
      </CollapsibleCard>

      {/* 8. Inclusions */}
      <CollapsibleCard title="Inclusions" icon="📦" id="kc-card-inclusions" defaultOpen={false}>
        <div className="pe-row-2">
          <Toggle label="Includes Novelties" name="keycapNovelties" checked={keycapNovelties} onChange={(v) => { setKeycapNovelties(v); markChange(); }} />
          <Toggle label="Includes Spacebars" name="keycapSpacebars" checked={keycapSpacebars} onChange={(v) => { setKeycapSpacebars(v); markChange(); }} />
        </div>
        <div className="pe-row-2">
          <Toggle label="Accent Keys" name="keycapAccentKeys" checked={keycapAccentKeys} onChange={(v) => { setKeycapAccentKeys(v); markChange(); }} />
          <Toggle label="Artisan Included" name="keycapArtisan" checked={keycapArtisan} onChange={(v) => { setKeycapArtisan(v); markChange(); }} />
        </div>
      </CollapsibleCard>

      {/* 9. Notes */}
      <CollapsibleCard title="Compatibility Notes" icon="📝" id="kc-card-notes" defaultOpen={false}>
        <Field label="Notes">
          <textarea name="keycapNotes" value={keycapNotes} onChange={(e) => { setKeycapNotes(e.target.value); markChange(); }} className="kb-input kb-textarea" rows={4} placeholder="Compatibility notes, thickness info, dye-sub quality notes..." />
        </Field>
      </CollapsibleCard>
    </>
  );
}
