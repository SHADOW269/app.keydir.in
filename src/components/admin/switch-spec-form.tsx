'use client';

import { useState } from 'react';
import { CollapsibleCard } from './collapsible-card';
import { ChipSelect, Toggle, TagInput, Field } from './form-primitives';

const SWITCH_COMPAT = ['3-Pin', '5-Pin', 'Hall Effect', 'Optical', 'Low Profile', 'Outemu Socket Compatible'];
const SWITCH_TYPE = ['Linear', 'Tactile', 'Clicky', 'Silent Linear', 'Silent Tactile', 'Silent Clicky', 'Magnetic (Hall Effect)', 'Optical', 'Low Profile'];
const STEM_MATERIALS = ['POM', 'Modified POM', 'UPE', 'UHMWPE', 'LY', 'POK', 'MMD', 'Blend / Proprietary', 'Other'];
const TOP_HOUSING = ['Polycarbonate (PC)', 'Nylon', 'POM', 'UHMWPE', 'Blend / Proprietary', 'Other'];
const BOTTOM_HOUSING = ['Nylon', 'Polycarbonate (PC)', 'POM', 'PA66', 'Blend / Proprietary', 'Other'];
const SPRING_TYPES = ['Standard', 'Long', 'Progressive', 'Symmetric', 'Two-Stage (Dual Stage)', 'Three-Stage', 'Slow Curve'];
const PACKAGING = ['Tray', 'Bag', 'Box', 'Blister Pack', 'Other'];

interface SwitchSpecData {
  factoryLubed?: boolean; handLubed?: boolean; factoryFilmed?: boolean; breakInProgress?: boolean;
  switchCompat?: string[] | null; switchType?: string[] | null;
  switchBrand?: string[] | null; switchModel?: string[] | null;
  switchOpForce?: number | null; switchBottomOut?: number | null;
  switchPreTravel?: number | null; switchTotalTravel?: number | null;
  switchSpringWeight?: number | null; switchSpringLength?: number | null;
  switchRatedLifetime?: number | null;
  switchStemMaterial?: string | null; switchTopHousing?: string | null; switchBottomHousing?: string | null;
  switchSpringType?: string | null;
  switchLongPole?: boolean; switchLedDiffuser?: boolean; switchDustproofStem?: boolean; switchLightPipe?: boolean;
  quantityPerPack?: number | null; packagingType?: string | null;
}

interface Props {
  spec?: SwitchSpecData | null;
  onChange?: () => void;
}

export function SwitchSpecForm({ spec, onChange }: Props) {
  const markChange = () => onChange?.();

  const [factoryLubed, setFactoryLubed] = useState(spec?.factoryLubed ?? false);
  const [handLubed, setHandLubed] = useState(spec?.handLubed ?? false);
  const [factoryFilmed, setFactoryFilmed] = useState(spec?.factoryFilmed ?? false);
  const [breakInProgress, setBreakInProgress] = useState(spec?.breakInProgress ?? false);
  const [switchCompat, setSwitchCompat] = useState<string[]>(spec?.switchCompat ?? []);
  const [switchType, setSwitchType] = useState<string[]>(spec?.switchType ?? []);
  const [switchBrand, setSwitchBrand] = useState<string[]>(spec?.switchBrand ?? []);
  const [switchModel, setSwitchModel] = useState<string[]>(spec?.switchModel ?? []);
  const [switchOpForce, setSwitchOpForce] = useState(String(spec?.switchOpForce ?? ''));
  const [switchBottomOut, setSwitchBottomOut] = useState(String(spec?.switchBottomOut ?? ''));
  const [switchPreTravel, setSwitchPreTravel] = useState(String(spec?.switchPreTravel ?? ''));
  const [switchTotalTravel, setSwitchTotalTravel] = useState(String(spec?.switchTotalTravel ?? ''));
  const [switchSpringWeight, setSwitchSpringWeight] = useState(String(spec?.switchSpringWeight ?? ''));
  const [switchSpringLength, setSwitchSpringLength] = useState(String(spec?.switchSpringLength ?? ''));
  const [switchRatedLifetime, setSwitchRatedLifetime] = useState(String(spec?.switchRatedLifetime ?? ''));
  const [switchStemMaterial, setSwitchStemMaterial] = useState(spec?.switchStemMaterial ?? '');
  const [switchTopHousing, setSwitchTopHousing] = useState(spec?.switchTopHousing ?? '');
  const [switchBottomHousing, setSwitchBottomHousing] = useState(spec?.switchBottomHousing ?? '');
  const [switchSpringType, setSwitchSpringType] = useState(spec?.switchSpringType ?? '');
  const [switchLongPole, setSwitchLongPole] = useState(spec?.switchLongPole ?? false);
  const [switchLedDiffuser, setSwitchLedDiffuser] = useState(spec?.switchLedDiffuser ?? false);
  const [switchDustproofStem, setSwitchDustproofStem] = useState(spec?.switchDustproofStem ?? false);
  const [switchLightPipe, setSwitchLightPipe] = useState(spec?.switchLightPipe ?? false);
  const [quantityPerPack, setQuantityPerPack] = useState(String(spec?.quantityPerPack ?? ''));
  const [packagingType, setPackagingType] = useState(spec?.packagingType ?? '');

  return (
    <>
      {/* 1. Included */}
      <CollapsibleCard title="Included" icon="📦" id="sw-card-included">
        <div className="pe-row-2">
          <Toggle label="Factory Lubed" name="factoryLubed" checked={factoryLubed} onChange={(v) => { setFactoryLubed(v); markChange(); }} />
          <Toggle label="Hand Lubed" name="handLubed" checked={handLubed} onChange={(v) => { setHandLubed(v); markChange(); }} />
        </div>
        <div className="pe-row-2">
          <Toggle label="Factory Filmed" name="factoryFilmed" checked={factoryFilmed} onChange={(v) => { setFactoryFilmed(v); markChange(); }} />
          <Toggle label="Break-in Completed" name="breakInProgress" checked={breakInProgress} onChange={(v) => { setBreakInProgress(v); markChange(); }} />
        </div>
      </CollapsibleCard>

      {/* 2. Compatibility */}
      <CollapsibleCard title="Compatibility" icon="🔌" id="sw-card-compat" defaultOpen={false}>
        <Field label="Socket Compatibility">
          <div className="kb-chip-container">
            <ChipSelect name="switchCompat" options={SWITCH_COMPAT} value={switchCompat} onChange={(v) => { setSwitchCompat(v); markChange(); }} />
          </div>
        </Field>
      </CollapsibleCard>

      {/* 3. Switch Type */}
      <CollapsibleCard title="Switch Type" icon="⌨" id="sw-card-type" defaultOpen={false}>
        <Field label="Type">
          <div className="kb-chip-container">
            <ChipSelect name="switchType" options={SWITCH_TYPE} value={switchType} onChange={(v) => { setSwitchType(v); markChange(); }} />
          </div>
        </Field>
      </CollapsibleCard>

      {/* 4 & 5. Brand & Model */}
      <CollapsibleCard title="Brand & Model" icon="🏷" id="sw-card-brand" defaultOpen={false}>
        <div className="pe-row-2">
          <TagInput label="Switch Brands" value={switchBrand} onChange={(v) => { setSwitchBrand(v); markChange(); }} placeholder="+ Add Brand" />
          <TagInput label="Switch Models" value={switchModel} onChange={(v) => { setSwitchModel(v); markChange(); }} placeholder="+ Add Model" />
        </div>
      </CollapsibleCard>

      {/* 6. Specifications */}
      <CollapsibleCard title="Specifications" icon="📊" id="sw-card-specs">
        <div className="kb-dim-grid">
          <Field label="Operating Force (gf)">
            <input type="number" name="switchOpForce" value={switchOpForce} onChange={(e) => { setSwitchOpForce(e.target.value); markChange(); }} className="kb-input" placeholder="45" />
          </Field>
          <Field label="Bottom-out Force (gf)">
            <input type="number" name="switchBottomOut" value={switchBottomOut} onChange={(e) => { setSwitchBottomOut(e.target.value); markChange(); }} className="kb-input" placeholder="60" />
          </Field>
        </div>
        <div className="kb-dim-grid">
          <Field label="Pre-Travel (mm)">
            <input type="number" step="0.1" name="switchPreTravel" value={switchPreTravel} onChange={(e) => { setSwitchPreTravel(e.target.value); markChange(); }} className="kb-input" placeholder="2.0" />
          </Field>
          <Field label="Total Travel (mm)">
            <input type="number" step="0.1" name="switchTotalTravel" value={switchTotalTravel} onChange={(e) => { setSwitchTotalTravel(e.target.value); markChange(); }} className="kb-input" placeholder="4.0" />
          </Field>
        </div>
        <div className="kb-dim-grid">
          <Field label="Spring Weight (gf)">
            <input type="number" name="switchSpringWeight" value={switchSpringWeight} onChange={(e) => { setSwitchSpringWeight(e.target.value); markChange(); }} className="kb-input" placeholder="50" />
          </Field>
          <Field label="Spring Length (mm)">
            <input type="number" step="0.1" name="switchSpringLength" value={switchSpringLength} onChange={(e) => { setSwitchSpringLength(e.target.value); markChange(); }} className="kb-input" placeholder="22" />
          </Field>
        </div>
        <Field label="Rated Lifetime (Million)">
          <input type="number" name="switchRatedLifetime" value={switchRatedLifetime} onChange={(e) => { setSwitchRatedLifetime(e.target.value); markChange(); }} className="kb-input kb-input--short" placeholder="80" />
        </Field>
      </CollapsibleCard>

      {/* 7. Materials */}
      <CollapsibleCard title="Materials" icon="🧪" id="sw-card-materials" defaultOpen={false}>
        <div className="pe-row-2">
          <Field label="Stem Material">
            <select name="switchStemMaterial" value={switchStemMaterial} onChange={(e) => { setSwitchStemMaterial(e.target.value); markChange(); }} className="kb-input">
              <option value="">— Select —</option>
              {STEM_MATERIALS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </Field>
          <Field label="Top Housing">
            <select name="switchTopHousing" value={switchTopHousing} onChange={(e) => { setSwitchTopHousing(e.target.value); markChange(); }} className="kb-input">
              <option value="">— Select —</option>
              {TOP_HOUSING.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </Field>
        </div>
        <Field label="Bottom Housing">
          <select name="switchBottomHousing" value={switchBottomHousing} onChange={(e) => { setSwitchBottomHousing(e.target.value); markChange(); }} className="kb-input">
            <option value="">— Select —</option>
            {BOTTOM_HOUSING.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </Field>
      </CollapsibleCard>

      {/* 8. Spring */}
      <CollapsibleCard title="Spring" icon="🔩" id="sw-card-spring" defaultOpen={false}>
        <Field label="Spring Type">
          <select name="switchSpringType" value={switchSpringType} onChange={(e) => { setSwitchSpringType(e.target.value); markChange(); }} className="kb-input">
            <option value="">— Select —</option>
            {SPRING_TYPES.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </Field>
      </CollapsibleCard>

      {/* 9. Additional Features */}
      <CollapsibleCard title="Additional Features" icon="✨" id="sw-card-features" defaultOpen={false}>
        <div className="pe-row-2">
          <Toggle label="Long Pole" name="switchLongPole" checked={switchLongPole} onChange={(v) => { setSwitchLongPole(v); markChange(); }} />
          <Toggle label="LED Diffuser" name="switchLedDiffuser" checked={switchLedDiffuser} onChange={(v) => { setSwitchLedDiffuser(v); markChange(); }} />
        </div>
        <div className="pe-row-2">
          <Toggle label="Dustproof Stem" name="switchDustproofStem" checked={switchDustproofStem} onChange={(v) => { setSwitchDustproofStem(v); markChange(); }} />
          <Toggle label="Light Pipe" name="switchLightPipe" checked={switchLightPipe} onChange={(v) => { setSwitchLightPipe(v); markChange(); }} />
        </div>
      </CollapsibleCard>

      {/* 10. Packaging */}
      <CollapsibleCard title="Packaging" icon="📦" id="sw-card-packaging" defaultOpen={false}>
        <div className="pe-row-2">
          <Field label="Quantity Per Pack">
            <input type="number" name="quantityPerPack" value={quantityPerPack} onChange={(e) => { setQuantityPerPack(e.target.value); markChange(); }} className="kb-input" placeholder="e.g. 10, 35, 90" />
          </Field>
          <Field label="Packaging Type">
            <select name="packagingType" value={packagingType} onChange={(e) => { setPackagingType(e.target.value); markChange(); }} className="kb-input">
              <option value="">— Select —</option>
              {PACKAGING.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </Field>
        </div>
      </CollapsibleCard>
    </>
  );
}
