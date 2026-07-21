'use client';

import { useState, useCallback } from 'react';
import { ChipSelect, Toggle, TagInput, Field } from './form-primitives';

const LAYOUTS = ['40%', '60%', '65%', '75%', 'TKL', 'FRL (F-rowless)', '96%', '1800 Compact', '102-Key', 'Full Size', 'Pad / Macropad'];
const STYLES = ['Standard', 'Alice', 'Split', 'Ortholinear', 'Low Profile', 'HHKB', 'WKL (Winkeyless)', 'Ergonomic Contoured'];
const CASE_MATERIALS = ['ABS Plastic', 'Aluminum', 'Wood', 'Polycarbonate', 'Acrylic', 'Resin', 'Magnesium Alloy', 'Brass', 'Copper', 'Stainless Steel', 'FR4', 'Other'];
const SURFACE_FINISHES = ['Anodized', 'E-coated', 'Powder Coated', 'Sandblasted', 'Matte', 'Glossy', 'PVD Coated', 'Other'];
const MOUNTING_STYLES = ['Gasket Mount', 'Tray Mount', 'Top Mount', 'Bottom Mount', 'Integrated Mount', 'Plateless Mount', 'O-Ring Mount', 'Sandwich Mount', 'Leaf Spring Mount', 'Other'];
const PLATE_MATERIALS = ['Polycarbonate (PC)', 'FR4', 'Aluminum', 'POM', 'Brass', 'Carbon Fiber', 'Steel', 'Other'];
const STABILIZERS = ['PCB Screw-In', 'PCB Snap-In', 'Plate-Mount'];
const STABILIZER_LAYOUTS = ['6.25u Spacebar Wire', '7u Spacebar Wire', 'Split Spacebar'];
const FOAM_MATERIALS = ['PORON', 'EVA', 'IXPE', 'Silicone', 'Neoprene / Sorbothane', 'PET Film', 'Latex'];
const FOAM_PLACEMENTS = ['Case Foam', 'Plate Foam', 'Switch Pads', 'Spacebar Foam'];
const PCB_TYPES = ['3-Pin Hot-Swap', '5-Pin Hot-Swap', '3-Pin Solder', '5-Pin Solder'];
const CONNECTIVITY = ['Wired', '2.4GHz Wireless', 'Bluetooth 5.0', 'Bluetooth 5.1', 'Bluetooth 5.2', 'Bluetooth 5.3'];
const FIRMWARE = ['No Firmware', 'Proprietary OEM Software', 'Custom Web-Based Driver', 'QMK', 'VIA', 'VIAL'];
const LIGHTING_OPTS = ['No RGB', 'RGB', 'Customizable RGB'];
const LED_ORIENTATION = ['South-Facing', 'North-Facing'];
const SWITCH_COMPAT = ['3-Pin', '5-Pin', 'Hall Effect', 'Optical', 'Low Profile', 'Outemu Socket Compatible'];
const SWITCH_TYPE = ['Linear', 'Tactile', 'Clicky', 'Silent Linear', 'Silent Tactile', 'Silent Clicky', 'Magnetic (Hall Effect)', 'Optical', 'Low Profile'];
const STEM_MATERIALS = ['POM', 'Modified POM', 'UPE', 'UHMWPE', 'LY', 'POK', 'MMD', 'Blend / Proprietary', 'Other'];
const TOP_HOUSING = ['Polycarbonate (PC)', 'Nylon', 'POM', 'UHMWPE', 'Blend / Proprietary', 'Other'];
const BOTTOM_HOUSING = ['Nylon', 'Polycarbonate (PC)', 'POM', 'PA66', 'Blend / Proprietary', 'Other'];
const SPRING_TYPES = ['Standard', 'Long', 'Progressive', 'Symmetric', 'Two-Stage (Dual Stage)', 'Three-Stage', 'Slow Curve'];
const KEYCAP_MATERIALS = ['None', 'ABS', 'PBT', 'POM', 'PC'];
const KEYCAP_PROFILES = ['OEM', 'Cherry', 'MDA', 'SA', 'MT3', 'KAT', 'ASA', 'XDA', 'DSA', 'KAM', 'G20', 'MBK'];
const KEYCAP_LEGEND_TYPE = ['Double-Shot', 'Dye-Sublimation', 'Reverse Dye-Sub', 'Laser Etching / Engraving', 'Pad Printing'];
const KEYCAP_LEGEND_PLACEMENT = ['Top-Printed', 'Side-Printed', 'Blank', 'Top Shine-Through', 'Side Shine-Through', 'Pudding'];
const ACCESSORIES = ['USB Cable', 'Dust Cover', 'Carry Case', 'Keycap Puller', 'Switch Puller', 'Wrist Rest', 'Strap'];

interface KeyboardSpecData {
  layout?: string | null; keyboardStyle?: string[] | null; caseMaterial?: string | null;
  surfaceFinish?: string[] | null; colors?: string[] | null; weight?: number | null; lengthMm?: number | null;
  widthMm?: number | null; heightMm?: number | null; typingAngle?: number | null;
  mountingStyle?: string[] | null; plateMaterial?: string[] | null; stabilizerCompat?: string[] | null;
  stabilizerLayout?: string[] | null; foamMaterial?: string[] | null; foamPlacement?: string[] | null; flexCuts?: boolean;
  pcbType?: string[] | null; pcbThickness?: number | null; pollingRate?: number | null;
  nkro?: boolean; batteryCapacity?: number | null;
  connectivity?: string[] | null; detachableCable?: boolean; firmware?: string[] | null;
  lighting?: string | null; ledOrientation?: string | null; perKeyRgb?: boolean;
  switchesIncluded?: boolean; switchCompat?: string[] | null; switchType?: string[] | null;
  factoryLubed?: boolean; handLubed?: boolean; factoryFilmed?: boolean; breakInProgress?: boolean;
  switchBrand?: string[] | null; switchModel?: string[] | null;
  switchOpForce?: number | null; switchBottomOut?: number | null; switchPreTravel?: number | null;
  switchTotalTravel?: number | null; switchSpringWeight?: number | null; switchSpringLength?: number | null;
  switchRatedLifetime?: number | null;
  switchStemMaterial?: string | null; switchTopHousing?: string | null; switchBottomHousing?: string | null;
  switchSpringType?: string | null;
  switchLongPole?: boolean; switchLedDiffuser?: boolean; switchDustproofStem?: boolean; switchLightPipe?: boolean;
  keycapMaterial?: string[] | null; keycapProfile?: string | null;
  keycapLegendType?: string[] | null; keycapLegendPlacement?: string[] | null;
  keycapsIncluded?: boolean;
  includedAccessories?: string[] | null; additionalAccessories?: string | null;
  specialFeatures?: string | null;
}

interface Props {
  spec?: KeyboardSpecData | null;
  brands?: { id: string; name: string }[];
  onChange: () => void;
  onImageUpload?: (file: File) => void;
}

export function KeyboardSpecForm({ spec, brands, onChange, onImageUpload }: Props) {
  const [imageUrl, setImageUrl] = useState('');
  const [imageMode, setImageMode] = useState<'url' | 'upload'>('url');
  const [uploading, setUploading] = useState(false);

  const [name, setName] = useState('');
  const [brandId, setBrandId] = useState('');
  const [description, setDescription] = useState('');
  const [layout, setLayout] = useState(spec?.layout ?? '');
  const [keyboardStyle, setKeyboardStyle] = useState<string[]>(spec?.keyboardStyle ?? []);
  const [caseMaterial, setCaseMaterial] = useState(spec?.caseMaterial ?? '');
  const [surfaceFinish, setSurfaceFinish] = useState<string[]>(spec?.surfaceFinish ?? []);
  const [colors, setColors] = useState<string[]>(spec?.colors ?? []);
  const [weight, setWeight] = useState(String(spec?.weight ?? ''));
  const [lengthMm, setLengthMm] = useState(String(spec?.lengthMm ?? ''));
  const [widthMm, setWidthMm] = useState(String(spec?.widthMm ?? ''));
  const [heightMm, setHeightMm] = useState(String(spec?.heightMm ?? ''));
  const [typingAngle, setTypingAngle] = useState(String(spec?.typingAngle ?? ''));
  const [mountingStyle, setMountingStyle] = useState<string[]>(spec?.mountingStyle ?? []);
  const [plateMaterial, setPlateMaterial] = useState<string[]>(spec?.plateMaterial ?? []);
  const [stabilizerCompat, setStabilizerCompat] = useState<string[]>(spec?.stabilizerCompat ?? []);
  const [stabilizerLayout, setStabilizerLayout] = useState<string[]>(spec?.stabilizerLayout ?? []);
  const [foamMaterial, setFoamMaterial] = useState<string[]>(spec?.foamMaterial ?? []);
  const [foamPlacement, setFoamPlacement] = useState<string[]>(spec?.foamPlacement ?? []);
  const [flexCuts, setFlexCuts] = useState(spec?.flexCuts ?? false);
  const [pcbType, setPcbType] = useState<string[]>(spec?.pcbType ?? []);
  const [pcbThickness, setPcbThickness] = useState(String(spec?.pcbThickness ?? ''));
  const [pollingRate, setPollingRate] = useState(String(spec?.pollingRate ?? ''));
  const [nkro, setNkro] = useState(spec?.nkro ?? false);
  const [batteryCapacity, setBatteryCapacity] = useState(String(spec?.batteryCapacity ?? ''));
  const [connectivity, setConnectivity] = useState<string[]>(spec?.connectivity ?? []);
  const [detachableCable, setDetachableCable] = useState(spec?.detachableCable ?? false);
  const [firmware, setFirmware] = useState<string[]>(spec?.firmware ?? []);
  const [lighting, setLighting] = useState(spec?.lighting ?? '');
  const [ledOrientation, setLedOrientation] = useState(spec?.ledOrientation ?? '');
  const [perKeyRgb, setPerKeyRgb] = useState(spec?.perKeyRgb ?? false);
  const [switchesIncluded, setSwitchesIncluded] = useState(spec?.switchesIncluded ?? false);
  const [switchCompat, setSwitchCompat] = useState<string[]>(spec?.switchCompat ?? []);
  const [switchType, setSwitchType] = useState<string[]>(spec?.switchType ?? []);
  const [factoryLubed, setFactoryLubed] = useState(spec?.factoryLubed ?? false);
  const [handLubed, setHandLubed] = useState(spec?.handLubed ?? false);
  const [factoryFilmed, setFactoryFilmed] = useState(spec?.factoryFilmed ?? false);
  const [breakInProgress, setBreakInProgress] = useState(spec?.breakInProgress ?? false);
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
  const [keycapMaterial, setKeycapMaterial] = useState<string[]>(spec?.keycapMaterial ?? []);
  const [keycapProfile, setKeycapProfile] = useState(spec?.keycapProfile ?? '');
  const [keycapLegendType, setKeycapLegendType] = useState<string[]>(spec?.keycapLegendType ?? []);
  const [keycapLegendPlacement, setKeycapLegendPlacement] = useState<string[]>(spec?.keycapLegendPlacement ?? []);
  const [keycapsIncluded, setKeycapsIncluded] = useState(spec?.keycapsIncluded ?? false);
  const [includedAccessories, setIncludedAccessories] = useState<string[]>(spec?.includedAccessories ?? []);
  const [additionalAccessories, setAdditionalAccessories] = useState(spec?.additionalAccessories ?? '');
  const [specialFeatures, setSpecialFeatures] = useState(spec?.specialFeatures ?? '');

  const markChange = useCallback(() => onChange(), [onChange]);

  async function handleLocalImageUpload(file: File) {
    if (onImageUpload) { onImageUpload(file); return; }
    setUploading(true);
    try {
      const fd = new FormData(); fd.append('file', file); fd.append('dir', 'products');
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.url) { setImageUrl(data.url); markChange(); }
    } catch {}
    setUploading(false);
  }

  return (
    <>
      {/* Basic Information */}
      <div id="pe-section-basic" className="kb-section">
        <div className="kb-section-body">
          <div className="kb-pair-grid">
            <Field label="Keyboard Name *">
              <input name="name" required value={name} onChange={(e) => { setName(e.target.value); markChange(); }} className="kb-input" placeholder="e.g. Rainy75, Wooting 60HE" />
            </Field>
            <Field label="Brand">
              <select name="brandId" value={brandId} onChange={(e) => { setBrandId(e.target.value); markChange(); }} className="kb-input">
                <option value="">— No Brand —</option>
                {brands?.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Short Description" wide>
            <textarea name="description" rows={3} value={description} onChange={(e) => { setDescription(e.target.value); markChange(); }} className="kb-input kb-textarea" placeholder="Brief overview of the keyboard's key features and selling points..." maxLength={500} />
            <div className="kb-char-count">{description.length}/500</div>
          </Field>
        </div>
      </div>

      {/* Product Image */}
      <div id="pe-section-images" className="kb-section">
        <div className="kb-section-body">
          <div className="kb-image-tabs">
            <button type="button" className={`kb-image-tab ${imageMode === 'url' ? 'active' : ''}`} onClick={() => setImageMode('url')}>Image URL</button>
            <button type="button" className={`kb-image-tab ${imageMode === 'upload' ? 'active' : ''}`} onClick={() => setImageMode('upload')}>Upload Image</button>
          </div>
          {imageMode === 'url' ? (
            <Field label="Direct Image URL">
              <input type="url" name="imageUrl" value={imageUrl} onChange={(e) => { setImageUrl(e.target.value); markChange(); }} className="kb-input" placeholder="https://example.com/keyboard.jpg" />
              <div className="kb-field-hint">Accepts .jpg, .png, .webp, .jpeg, .avif</div>
            </Field>
          ) : (
            <div
              className={`kb-dropzone ${uploading ? 'uploading' : ''}`}
              onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); e.currentTarget.classList.add('dragover'); }}
              onDragLeave={(e) => { e.currentTarget.classList.remove('dragover'); }}
              onDrop={(e) => {
                e.preventDefault(); e.stopPropagation();
                e.currentTarget.classList.remove('dragover');
                const file = e.dataTransfer.files?.[0];
                if (file) handleLocalImageUpload(file);
              }}
            >
              <input type="file" accept=".jpg,.jpeg,.png,.webp,.avif" className="kb-dropzone-input" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleLocalImageUpload(f); }} />
              {uploading ? (
                <div className="kb-dropzone-text">Uploading...</div>
              ) : (
                <>
                  <div className="kb-dropzone-icon">⬆</div>
                  <div className="kb-dropzone-text">Drag & drop an image here, or click to browse</div>
                </>
              )}
              <div className="kb-dropzone-hint">Max 5 MB · JPG, PNG, WebP, AVIF</div>
            </div>
          )}
          {imageUrl && (
            <div className="kb-image-preview-area">
              <img src={imageUrl} alt="Preview" className="kb-image-preview-img" />
              <div className="kb-image-preview-actions">
                <button type="button" className="btn-secondary btn-sm" onClick={() => { setImageUrl(''); markChange(); }}>Remove</button>
                <button type="button" className="btn-secondary btn-sm" onClick={() => { const input = document.createElement('input'); input.type = 'file'; input.accept = '.jpg,.jpeg,.png,.webp,.avif'; input.onchange = (e) => { const f = (e.target as HTMLInputElement).files?.[0]; if (f) handleLocalImageUpload(f); }; input.click(); }}>Replace</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Layout & Build */}
      <div id="pe-section-layout" className="kb-section">
        <div className="kb-section-body">
          <div className="kb-pair-grid">
            <Field label="Layout">
              <select name="layout" value={layout} onChange={(e) => { setLayout(e.target.value); markChange(); }} className="kb-input">
                <option value="">— Select —</option>
                {LAYOUTS.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </Field>
            <Field label="Case Material">
              <select name="caseMaterial" value={caseMaterial} onChange={(e) => { setCaseMaterial(e.target.value); markChange(); }} className="kb-input">
                <option value="">— Select —</option>
                {CASE_MATERIALS.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </Field>
          </div>
          <div className="kb-pair-grid">
            <Field label="Surface Finish">
              <ChipSelect name="surfaceFinish" options={SURFACE_FINISHES} value={surfaceFinish} onChange={(v) => { setSurfaceFinish(v); markChange(); }} />
            </Field>
            <Field label="Typing Angle">
              <div className="kb-input-with-unit">
                <input type="number" name="typingAngle" value={typingAngle} onChange={(e) => { setTypingAngle(e.target.value); markChange(); }} className="kb-input" min={0} max={30} placeholder="0" />
                <span className="kb-unit">deg</span>
              </div>
            </Field>
          </div>
          <div className="kb-pair-grid">
            <Field label="Weight">
              <div className="kb-input-with-unit">
                <input type="number" name="weight" value={weight} onChange={(e) => { setWeight(e.target.value); markChange(); }} className="kb-input" min={0} placeholder="0" />
                <span className="kb-unit">g</span>
              </div>
            </Field>
            <Field label="Keyboard Style">
              <ChipSelect name="keyboardStyle" options={STYLES} value={keyboardStyle} onChange={(v) => { setKeyboardStyle(v); markChange(); }} />
            </Field>
          </div>
          <Field label="Dimensions">
            <div className="kb-dim-grid">
              <div>
                <div className="kb-field-label" style={{ marginBottom: 4 }}>Length</div>
                <div className="kb-input-with-unit">
                  <input type="number" name="lengthMm" value={lengthMm} onChange={(e) => { setLengthMm(e.target.value); markChange(); }} className="kb-input" min={0} placeholder="0" />
                  <span className="kb-unit">mm</span>
                </div>
              </div>
              <div>
                <div className="kb-field-label" style={{ marginBottom: 4 }}>Width</div>
                <div className="kb-input-with-unit">
                  <input type="number" name="widthMm" value={widthMm} onChange={(e) => { setWidthMm(e.target.value); markChange(); }} className="kb-input" min={0} placeholder="0" />
                  <span className="kb-unit">mm</span>
                </div>
              </div>
              <div>
                <div className="kb-field-label" style={{ marginBottom: 4 }}>Height</div>
                <div className="kb-input-with-unit">
                  <input type="number" name="heightMm" value={heightMm} onChange={(e) => { setHeightMm(e.target.value); markChange(); }} className="kb-input" min={0} placeholder="0" />
                  <span className="kb-unit">mm</span>
                </div>
              </div>
            </div>
          </Field>
          <Field label="Color Options" wide>
            <textarea name="colors" rows={3} value={colors.join('\n')} onChange={(e) => { setColors(e.target.value.split('\n').map((l) => l.trim()).filter(Boolean)); markChange(); }} className="kb-input kb-textarea" placeholder={"Black\nWhite\nNavy Blue"} />
            <div className="kb-char-count">{colors.length} color{colors.length !== 1 ? 's' : ''}</div>
          </Field>
        </div>
      </div>

      {/* Mounting */}
      <div id="pe-section-mounting" className="kb-section">
        <div className="kb-section-body">
          <Field label="Mounting Style">
            <div className="kb-chip-container">
              <ChipSelect name="mountingStyle" options={MOUNTING_STYLES} value={mountingStyle} onChange={(v) => { setMountingStyle(v); markChange(); }} />
            </div>
          </Field>
          <Field label="Plate Material">
            <div className="kb-chip-container">
              <ChipSelect name="plateMaterial" options={PLATE_MATERIALS} value={plateMaterial} onChange={(v) => { setPlateMaterial(v); markChange(); }} />
            </div>
          </Field>
          <div className="kb-pair-grid">
            <Field label="Stabilizer Compatibility">
              <ChipSelect name="stabilizerCompat" options={STABILIZERS} value={stabilizerCompat} onChange={(v) => { setStabilizerCompat(v); markChange(); }} />
            </Field>
            <Field label="Stabilizer Layout">
              <ChipSelect name="stabilizerLayout" options={STABILIZER_LAYOUTS} value={stabilizerLayout} onChange={(v) => { setStabilizerLayout(v); markChange(); }} />
            </Field>
          </div>
          <Field label="Foam Material">
            <ChipSelect name="foamMaterial" options={FOAM_MATERIALS} value={foamMaterial} onChange={(v) => { setFoamMaterial(v); markChange(); }} />
          </Field>
          <Field label="Foam Placement">
            <div className="kb-chip-container">
              <ChipSelect name="foamPlacement" options={FOAM_PLACEMENTS} value={foamPlacement} onChange={(v) => { setFoamPlacement(v); markChange(); }} />
            </div>
          </Field>
          <Toggle label="Flex Cuts" name="flexCuts" checked={flexCuts} onChange={(v) => { setFlexCuts(v); markChange(); }} />
        </div>
      </div>

      {/* PCB */}
      <div id="pe-section-pcb" className="kb-section">
        <div className="kb-section-body">
          <Field label="PCB Type">
            <div className="kb-chip-container">
              <ChipSelect name="pcbType" options={PCB_TYPES} value={pcbType} onChange={(v) => { setPcbType(v); markChange(); }} />
            </div>
          </Field>
          <div className="kb-pair-grid">
            <Field label="PCB Thickness">
              <div className="kb-input-with-unit">
                <input type="number" name="pcbThickness" value={pcbThickness} onChange={(e) => { setPcbThickness(e.target.value); markChange(); }} className="kb-input" min={0} step={0.1} placeholder="0" />
                <span className="kb-unit">mm</span>
              </div>
            </Field>
            <Field label="Polling Rate">
              <div className="kb-input-with-unit">
                <input type="number" name="pollingRate" value={pollingRate} onChange={(e) => { setPollingRate(e.target.value); markChange(); }} className="kb-input" min={0} placeholder="0" />
                <span className="kb-unit">Hz</span>
              </div>
            </Field>
          </div>
          <Field label="Battery Capacity">
            <div className="kb-input-with-unit" style={{ maxWidth: 520 }}>
              <input type="number" name="batteryCapacity" value={batteryCapacity} onChange={(e) => { setBatteryCapacity(e.target.value); markChange(); }} className="kb-input" min={0} placeholder="0" />
              <span className="kb-unit">mAh</span>
            </div>
          </Field>
          <Toggle label="N-Key Rollover (NKRO)" name="nkro" checked={nkro} onChange={(v) => { setNkro(v); markChange(); }} />
        </div>
      </div>

      {/* Connectivity */}
      <div id="pe-section-connectivity" className="kb-section">
        <div className="kb-section-body">
          <Field label="Connectivity">
            <div className="kb-chip-container">
              <ChipSelect name="connectivity" options={CONNECTIVITY} value={connectivity} onChange={(v) => { setConnectivity(v); markChange(); }} />
            </div>
          </Field>
          <Toggle label="Detachable Cable" name="detachableCable" checked={detachableCable} onChange={(v) => { setDetachableCable(v); markChange(); }} />
          <Field label="Firmware">
            <div className="kb-chip-container">
              <ChipSelect name="firmware" options={FIRMWARE} value={firmware} onChange={(v) => { setFirmware(v); markChange(); }} />
            </div>
          </Field>
        </div>
      </div>

      {/* Lighting */}
      <div id="pe-section-lighting" className="kb-section">
        <div className="kb-section-body">
          <div className="kb-pair-grid">
            <Field label="Lighting">
              <select name="lighting" value={lighting} onChange={(e) => { setLighting(e.target.value); markChange(); }} className="kb-input">
                <option value="">— Select —</option>
                {LIGHTING_OPTS.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </Field>
            <Field label="LED Orientation">
              <select name="ledOrientation" value={ledOrientation} onChange={(e) => { setLedOrientation(e.target.value); markChange(); }} className="kb-input">
                <option value="">— Select —</option>
                {LED_ORIENTATION.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </Field>
          </div>
          <Toggle label="Per-Key RGB" name="perKeyRgb" checked={perKeyRgb} onChange={(v) => { setPerKeyRgb(v); markChange(); }} />
        </div>
      </div>

      {/* Switches */}
      <div id="pe-section-switch" className="kb-section">
        <div className="kb-section-body">
          <div className="kb-subgroup-label">Included</div>
          <div className="kb-pair-grid">
            <Toggle label="Switches Included" name="switchesIncluded" checked={switchesIncluded} onChange={(v) => { setSwitchesIncluded(v); markChange(); }} />
            <Toggle label="Factory Lubed" name="factoryLubed" checked={factoryLubed} onChange={(v) => { setFactoryLubed(v); markChange(); }} />
          </div>
          <div className="kb-pair-grid">
            <Toggle label="Hand Lubed" name="handLubed" checked={handLubed} onChange={(v) => { setHandLubed(v); markChange(); }} />
            <Toggle label="Factory Filmed" name="factoryFilmed" checked={factoryFilmed} onChange={(v) => { setFactoryFilmed(v); markChange(); }} />
          </div>
          <Toggle label="Break-in Completed" name="breakInProgress" checked={breakInProgress} onChange={(v) => { setBreakInProgress(v); markChange(); }} />

          <div className="kb-divider" />

          <div className="kb-subgroup-label">Compatibility</div>
          <Field label="Socket Compatibility">
            <div className="kb-chip-container">
              <ChipSelect name="switchCompat" options={SWITCH_COMPAT} value={switchCompat} onChange={(v) => { setSwitchCompat(v); markChange(); }} />
            </div>
          </Field>

          <div className="kb-divider" />

          <div className="kb-subgroup-label">Switch Type</div>
          <Field label="Type">
            <div className="kb-chip-container">
              <ChipSelect name="switchType" options={SWITCH_TYPE} value={switchType} onChange={(v) => { setSwitchType(v); markChange(); }} />
            </div>
          </Field>

          <div className="kb-divider" />

          <div className="kb-pair-grid">
            <TagInput label="Switch Brands" value={switchBrand} onChange={(v) => { setSwitchBrand(v); markChange(); }} placeholder="+ Add Brand" name="switchBrand" />
            <TagInput label="Switch Models" value={switchModel} onChange={(v) => { setSwitchModel(v); markChange(); }} placeholder="+ Add Model" name="switchModel" />
          </div>

          <div className="kb-divider" />

          <div className="kb-subgroup-label">Specifications</div>
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

          <div className="kb-divider" />

          <div className="kb-subgroup-label">Materials</div>
          <div className="kb-pair-grid">
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

          <div className="kb-divider" />

          <div className="kb-subgroup-label">Spring</div>
          <Field label="Spring Type">
            <select name="switchSpringType" value={switchSpringType} onChange={(e) => { setSwitchSpringType(e.target.value); markChange(); }} className="kb-input">
              <option value="">— Select —</option>
              {SPRING_TYPES.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </Field>

          <div className="kb-divider" />

          <div className="kb-subgroup-label">Additional Features</div>
          <div className="kb-pair-grid">
            <Toggle label="Long Pole" name="switchLongPole" checked={switchLongPole} onChange={(v) => { setSwitchLongPole(v); markChange(); }} />
            <Toggle label="LED Diffuser" name="switchLedDiffuser" checked={switchLedDiffuser} onChange={(v) => { setSwitchLedDiffuser(v); markChange(); }} />
          </div>
          <div className="kb-pair-grid">
            <Toggle label="Dustproof Stem" name="switchDustproofStem" checked={switchDustproofStem} onChange={(v) => { setSwitchDustproofStem(v); markChange(); }} />
            <Toggle label="Light Pipe" name="switchLightPipe" checked={switchLightPipe} onChange={(v) => { setSwitchLightPipe(v); markChange(); }} />
          </div>
        </div>
      </div>

      {/* Keycaps */}
      <div id="pe-section-keycaps" className="kb-section">
        <div className="kb-section-body">
          <Toggle label="Keycaps Included" name="keycapsIncluded" checked={keycapsIncluded} onChange={(v) => { setKeycapsIncluded(v); markChange(); }} />
          <div className="kb-pair-grid">
            <Field label="Keycap Material">
              <ChipSelect name="keycapMaterial" options={KEYCAP_MATERIALS} value={keycapMaterial} onChange={(v) => { setKeycapMaterial(v); markChange(); }} />
            </Field>
            <Field label="Keycap Profile">
              <select name="keycapProfile" value={keycapProfile} onChange={(e) => { setKeycapProfile(e.target.value); markChange(); }} className="kb-input">
                <option value="">— Select —</option>
                {KEYCAP_PROFILES.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Legend Type">
            <div className="kb-chip-container">
              <ChipSelect name="keycapLegendType" options={KEYCAP_LEGEND_TYPE} value={keycapLegendType} onChange={(v) => { setKeycapLegendType(v); markChange(); }} />
            </div>
          </Field>
          <Field label="Legend Placement & Visibility">
            <div className="kb-chip-container">
              <ChipSelect name="keycapLegendPlacement" options={KEYCAP_LEGEND_PLACEMENT} value={keycapLegendPlacement} onChange={(v) => { setKeycapLegendPlacement(v); markChange(); }} />
            </div>
          </Field>
        </div>
      </div>

      {/* Accessories */}
      <div id="pe-section-features" className="kb-section">
        <div className="kb-section-body">
          <Field label="Included Accessories">
            <div className="kb-chip-container">
              <ChipSelect name="includedAccessories" options={ACCESSORIES} value={includedAccessories} onChange={(v) => { setIncludedAccessories(v); markChange(); }} />
            </div>
          </Field>
          <Field label="Additional Accessories" wide>
            <input name="additionalAccessories" value={additionalAccessories} onChange={(e) => { setAdditionalAccessories(e.target.value); markChange(); }} className="kb-input" placeholder="Any other included accessories..." />
          </Field>
          <Field label="Special Features" wide>
            <textarea name="specialFeatures" rows={4} value={specialFeatures} onChange={(e) => { setSpecialFeatures(e.target.value); markChange(); }} className="kb-input kb-textarea" placeholder="Unique features, technologies, or standout characteristics..." />
          </Field>
        </div>
      </div>
    </>
  );
}
