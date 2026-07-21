'use client';

import { useState } from 'react';
import { CollapsibleCard } from './collapsible-card';
import { ChipSelect, Toggle, Field } from './form-primitives';
import type { MouseSpecData } from '@/lib/admin/spec-types';

const CONNECTION = ['Wired', 'Wireless 2.4GHz', 'Bluetooth', 'Tri-Mode'];
const SENSORS = ['PixArt PAW3395', 'PAW3950', 'PAW3370', 'PAW3311', 'HERO 25K', 'HERO 2', 'Focus Pro 30K', 'Focus Pro 35K', 'Other'];
const POLLING_RATES = ['125Hz', '250Hz', '500Hz', '1000Hz', '2000Hz', '4000Hz', '8000Hz'];
const SHAPES = ['Symmetrical', 'Ergonomic'];
const HAND_ORIENTATION = ['Right-handed', 'Left-handed', 'Ambidextrous'];
const SIZES = ['Small', 'Medium', 'Large'];
const SWITCHES = ['Omron', 'Huano Blue Shell Pink Dot', 'Huano Transparent Blue Shell Pink Dot', 'TTC Gold', 'Kailh GM 8.0', 'Optical', 'Magnetic', 'Other'];
const CHARGING_PORTS = ['USB-C', 'Micro USB', 'Magnetic Dock', 'None'];
const FEET = ['PTFE', 'Glass', 'Hybrid'];
const GRIP_TYPES = ['Palm', 'Claw', 'Fingertip'];
const COMPATIBILITY = ['Windows', 'macOS', 'Linux', 'Android', 'PlayStation', 'Xbox'];
const ACCESSORIES = ['USB Cable', '8K Dongle', '4K Dongle', 'Wireless Receiver', 'USB Adapter', 'Grip Tape', 'Extra Skates', 'Carry Pouch', 'Manual', 'Other'];

interface Props {
  spec?: MouseSpecData | null;
  onChange?: () => void;
}

export function MouseSpecForm({ spec, onChange }: Props) {
  const markChange = () => onChange?.();

  const [mouseConnection, setMouseConnection] = useState<string[]>(spec?.mouseConnection ?? []);
  const [mouseSensor, setMouseSensor] = useState(spec?.mouseSensor ?? '');
  const [mouseDpi, setMouseDpi] = useState(String(spec?.mouseDpi ?? ''));
  const [mousePollingRate, setMousePollingRate] = useState<string[]>(spec?.mousePollingRate ?? []);
  const [mouseWeight, setMouseWeight] = useState(String(spec?.mouseWeight ?? ''));
  const [mouseShape, setMouseShape] = useState(spec?.mouseShape ?? '');
  const [mouseHandOrientation, setMouseHandOrientation] = useState(spec?.mouseHandOrientation ?? '');
  const [mouseSize, setMouseSize] = useState(spec?.mouseSize ?? '');
  const [mouseSwitches, setMouseSwitches] = useState(spec?.mouseSwitches ?? '');
  const [mouseEncoder, setMouseEncoder] = useState(spec?.mouseEncoder ?? '');
  const [mouseButtons, setMouseButtons] = useState(String(spec?.mouseButtons ?? ''));
  const [mouseSideButtons, setMouseSideButtons] = useState(String(spec?.mouseSideButtons ?? ''));
  const [mouseScrollWheel, setMouseScrollWheel] = useState(spec?.mouseScrollWheel ?? '');
  const [mouseBattery, setMouseBattery] = useState(String(spec?.mouseBattery ?? ''));
  const [mouseBatteryLife, setMouseBatteryLife] = useState(spec?.mouseBatteryLife ?? '');
  const [mouseChargingPort, setMouseChargingPort] = useState(spec?.mouseChargingPort ?? '');
  const [mouseFeet, setMouseFeet] = useState(spec?.mouseFeet ?? '');
  const [mouseRgb, setMouseRgb] = useState(spec?.mouseRgb ?? false);
  const [mouseSoftwareRequired, setMouseSoftwareRequired] = useState(spec?.mouseSoftwareRequired ?? false);
  const [mouseOnboardMemory, setMouseOnboardMemory] = useState(spec?.mouseOnboardMemory ?? false);
  const [mouseLod, setMouseLod] = useState(spec?.mouseLod ?? '');
  const [mouseMaxIps, setMouseMaxIps] = useState(String(spec?.mouseMaxIps ?? ''));
  const [mouseMaxAccel, setMouseMaxAccel] = useState(String(spec?.mouseMaxAccel ?? ''));
  const [mouseDimensionsLength, setMouseDimensionsLength] = useState(String(spec?.mouseDimensionsLength ?? ''));
  const [mouseDimensionsWidth, setMouseDimensionsWidth] = useState(String(spec?.mouseDimensionsWidth ?? ''));
  const [mouseDimensionsHeight, setMouseDimensionsHeight] = useState(String(spec?.mouseDimensionsHeight ?? ''));
  const [mouseShellMaterial, setMouseShellMaterial] = useState(spec?.mouseShellMaterial ?? '');
  const [mouseGripType, setMouseGripType] = useState<string[]>(spec?.mouseGripType ?? []);
  const [mouseColor, setMouseColor] = useState(spec?.mouseColor ?? '');
  const [mouseCompatibility, setMouseCompatibility] = useState<string[]>(spec?.mouseCompatibility ?? []);
  const [mouseAccessories, setMouseAccessories] = useState<string[]>(spec?.mouseAccessories ?? []);
  const [mouseAccessoriesOther, setMouseAccessoriesOther] = useState(spec?.mouseAccessoriesOther ?? '');
  const [mouseWarranty, setMouseWarranty] = useState(spec?.mouseWarranty ?? '');

  return (
    <>
      {/* 1. Connection */}
      <CollapsibleCard title="Connection" icon="📡" id="mo-card-connection">
        <Field label="Connection Type">
          <div className="kb-chip-container">
            <ChipSelect name="mouseConnection" options={CONNECTION} value={mouseConnection} onChange={(v) => { setMouseConnection(v); markChange(); }} />
          </div>
        </Field>
        <Field label="Charging Port">
          <select name="mouseChargingPort" value={mouseChargingPort} onChange={(e) => { setMouseChargingPort(e.target.value); markChange(); }} className="kb-input">
            <option value="">— Select —</option>
            {CHARGING_PORTS.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </Field>
      </CollapsibleCard>

      {/* 2. Sensor & Performance */}
      <CollapsibleCard title="Sensor & Performance" icon="🎯" id="mo-card-sensor">
        <Field label="Sensor">
          <select name="mouseSensor" value={mouseSensor} onChange={(e) => { setMouseSensor(e.target.value); markChange(); }} className="kb-input">
            <option value="">— Select —</option>
            {SENSORS.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </Field>
        <div className="kb-pair-grid">
          <Field label="DPI">
            <input type="number" name="mouseDpi" value={mouseDpi} onChange={(e) => { setMouseDpi(e.target.value); markChange(); }} className="kb-input" placeholder="e.g. 26000" />
          </Field>
          <Field label="Polling Rate">
            <div className="kb-chip-container">
              <ChipSelect name="mousePollingRate" options={POLLING_RATES} value={mousePollingRate} onChange={(v) => { setMousePollingRate(v); markChange(); }} />
            </div>
          </Field>
        </div>
        <div className="kb-pair-grid">
          <Field label="Max IPS">
            <input type="number" name="mouseMaxIps" value={mouseMaxIps} onChange={(e) => { setMouseMaxIps(e.target.value); markChange(); }} className="kb-input" placeholder="e.g. 750" />
          </Field>
          <Field label="Max Acceleration (G)">
            <input type="number" name="mouseMaxAccel" value={mouseMaxAccel} onChange={(e) => { setMouseMaxAccel(e.target.value); markChange(); }} className="kb-input" placeholder="e.g. 50" />
          </Field>
        </div>
        <Field label="Lift-Off Distance">
          <input name="mouseLod" value={mouseLod} onChange={(e) => { setMouseLod(e.target.value); markChange(); }} className="kb-input" placeholder="e.g. 1mm, Adjustable" />
        </Field>
      </CollapsibleCard>

      {/* 3. Physical */}
      <CollapsibleCard title="Physical" icon="📏" id="mo-card-physical">
        <div className="kb-pair-grid">
          <Field label="Weight (g)">
            <input type="number" name="mouseWeight" value={mouseWeight} onChange={(e) => { setMouseWeight(e.target.value); markChange(); }} className="kb-input" placeholder="e.g. 58" />
          </Field>
          <Field label="Shape">
            <select name="mouseShape" value={mouseShape} onChange={(e) => { setMouseShape(e.target.value); markChange(); }} className="kb-input">
              <option value="">— Select —</option>
              {SHAPES.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </Field>
        </div>
        <div className="kb-pair-grid">
          <Field label="Hand Orientation">
            <select name="mouseHandOrientation" value={mouseHandOrientation} onChange={(e) => { setMouseHandOrientation(e.target.value); markChange(); }} className="kb-input">
              <option value="">— Select —</option>
              {HAND_ORIENTATION.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </Field>
          <Field label="Size">
            <select name="mouseSize" value={mouseSize} onChange={(e) => { setMouseSize(e.target.value); markChange(); }} className="kb-input">
              <option value="">— Select —</option>
              {SIZES.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </Field>
        </div>
        <Field label="Dimensions (mm)">
          <div className="kb-dim-grid">
            <div>
              <div className="kb-field-label" style={{ marginBottom: 4 }}>Length</div>
              <input type="number" name="mouseDimensionsLength" value={mouseDimensionsLength} onChange={(e) => { setMouseDimensionsLength(e.target.value); markChange(); }} className="kb-input" placeholder="120" />
            </div>
            <div>
              <div className="kb-field-label" style={{ marginBottom: 4 }}>Width</div>
              <input type="number" name="mouseDimensionsWidth" value={mouseDimensionsWidth} onChange={(e) => { setMouseDimensionsWidth(e.target.value); markChange(); }} className="kb-input" placeholder="60" />
            </div>
            <div>
              <div className="kb-field-label" style={{ marginBottom: 4 }}>Height</div>
              <input type="number" name="mouseDimensionsHeight" value={mouseDimensionsHeight} onChange={(e) => { setMouseDimensionsHeight(e.target.value); markChange(); }} className="kb-input" placeholder="40" />
            </div>
          </div>
        </Field>
        <div className="kb-pair-grid">
          <Field label="Shell Material">
            <input name="mouseShellMaterial" value={mouseShellMaterial} onChange={(e) => { setMouseShellMaterial(e.target.value); markChange(); }} className="kb-input" placeholder="e.g. ABS, PC, Magnesium" />
          </Field>
          <Field label="Color">
            <input name="mouseColor" value={mouseColor} onChange={(e) => { setMouseColor(e.target.value); markChange(); }} className="kb-input" placeholder="e.g. Black, White" />
          </Field>
        </div>
      </CollapsibleCard>

      {/* 4. Switches & Input */}
      <CollapsibleCard title="Switches & Input" icon="🔘" id="mo-card-switches" defaultOpen={false}>
        <div className="kb-pair-grid">
          <Field label="Switches">
            <select name="mouseSwitches" value={mouseSwitches} onChange={(e) => { setMouseSwitches(e.target.value); markChange(); }} className="kb-input">
              <option value="">— Select —</option>
              {SWITCHES.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </Field>
          <Field label="Encoder">
            <input name="mouseEncoder" value={mouseEncoder} onChange={(e) => { setMouseEncoder(e.target.value); markChange(); }} className="kb-input" placeholder="e.g. Alps, TTC, Kailh" />
          </Field>
        </div>
        <div className="kb-pair-grid">
          <Field label="Buttons">
            <input type="number" name="mouseButtons" value={mouseButtons} onChange={(e) => { setMouseButtons(e.target.value); markChange(); }} className="kb-input" placeholder="e.g. 5" />
          </Field>
          <Field label="Side Buttons">
            <input type="number" name="mouseSideButtons" value={mouseSideButtons} onChange={(e) => { setMouseSideButtons(e.target.value); markChange(); }} className="kb-input" placeholder="e.g. 2" />
          </Field>
        </div>
        <Field label="Scroll Wheel">
          <input name="mouseScrollWheel" value={mouseScrollWheel} onChange={(e) => { setMouseScrollWheel(e.target.value); markChange(); }} className="kb-input" placeholder="e.g. Optical, Mechanical, Smooth" />
        </Field>
        <Field label="Grip Type">
          <div className="kb-chip-container">
            <ChipSelect name="mouseGripType" options={GRIP_TYPES} value={mouseGripType} onChange={(v) => { setMouseGripType(v); markChange(); }} />
          </div>
        </Field>
      </CollapsibleCard>

      {/* 5. Power */}
      <CollapsibleCard title="Power" icon="🔋" id="mo-card-power" defaultOpen={false}>
        <div className="kb-pair-grid">
          <Field label="Battery (mAh)">
            <input type="number" name="mouseBattery" value={mouseBattery} onChange={(e) => { setMouseBattery(e.target.value); markChange(); }} className="kb-input" placeholder="e.g. 500" />
          </Field>
          <Field label="Battery Life">
            <input name="mouseBatteryLife" value={mouseBatteryLife} onChange={(e) => { setMouseBatteryLife(e.target.value); markChange(); }} className="kb-input" placeholder="e.g. 80 hours" />
          </Field>
        </div>
      </CollapsibleCard>

      {/* 6. Features */}
      <CollapsibleCard title="Features" icon="✨" id="mo-card-features" defaultOpen={false}>
        <Field label="Feet">
          <select name="mouseFeet" value={mouseFeet} onChange={(e) => { setMouseFeet(e.target.value); markChange(); }} className="kb-input">
            <option value="">— Select —</option>
            {FEET.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </Field>
        <div className="kb-pair-grid">
          <Toggle label="RGB" name="mouseRgb" checked={mouseRgb} onChange={(v) => { setMouseRgb(v); markChange(); }} />
          <Toggle label="Software Required" name="mouseSoftwareRequired" checked={mouseSoftwareRequired} onChange={(v) => { setMouseSoftwareRequired(v); markChange(); }} />
        </div>
        <Toggle label="Onboard Memory" name="mouseOnboardMemory" checked={mouseOnboardMemory} onChange={(v) => { setMouseOnboardMemory(v); markChange(); }} />
      </CollapsibleCard>

      {/* 7. Compatibility */}
      <CollapsibleCard title="Compatibility" icon="💻" id="mo-card-compat" defaultOpen={false}>
        <Field label="Platform Compatibility">
          <div className="kb-chip-container">
            <ChipSelect name="mouseCompatibility" options={COMPATIBILITY} value={mouseCompatibility} onChange={(v) => { setMouseCompatibility(v); markChange(); }} />
          </div>
        </Field>
      </CollapsibleCard>

      {/* 8. Included Accessories */}
      <CollapsibleCard title="Included Accessories" icon="📦" id="mo-card-accessories" defaultOpen={false}>
        <Field label="Accessories">
          <div className="kb-chip-container">
            <ChipSelect name="mouseAccessories" options={ACCESSORIES} value={mouseAccessories} onChange={(v) => { setMouseAccessories(v); markChange(); }} />
          </div>
        </Field>
        {mouseAccessories.includes('Other') && (
          <Field label="Other Accessories">
            <input name="mouseAccessoriesOther" value={mouseAccessoriesOther} onChange={(e) => { setMouseAccessoriesOther(e.target.value); markChange(); }} className="kb-input" placeholder="Describe other included accessories" />
          </Field>
        )}
        <Field label="Warranty">
          <input name="mouseWarranty" value={mouseWarranty} onChange={(e) => { setMouseWarranty(e.target.value); markChange(); }} className="kb-input" placeholder="e.g. 2 Years" />
        </Field>
      </CollapsibleCard>
    </>
  );
}
