import type { SpecGroup, SpecRow } from './compare-types';

function json(v: unknown): string[] {
  return Array.isArray(v) ? v : [];
}

export interface FormattedSpec {
  display: string;
  lines: string[];
  isMulti: boolean;
  isBool: boolean;
  boolVal: boolean | null;
}

export function formatSpecValue(spec: Record<string, unknown>, key: string, type: SpecRow['type']): FormattedSpec {
  const v = spec[key];
  if (v === null || v === undefined) return { display: '—', lines: ['—'], isMulti: false, isBool: false, boolVal: null };
  switch (type) {
    case 'string':
      if (typeof v !== 'string' || !v.trim()) return { display: '—', lines: ['—'], isMulti: false, isBool: false, boolVal: null };
      return { display: v, lines: [v], isMulti: false, isBool: false, boolVal: null };
    case 'string[]': {
      const arr = json(v).filter(Boolean);
      return { display: arr.join('\n'), lines: arr.length ? arr : ['—'], isMulti: arr.length > 1, isBool: false, boolVal: null };
    }
    case 'boolean':
      return { display: v ? 'Yes' : 'No', lines: [v ? 'Yes' : 'No'], isMulti: false, isBool: true, boolVal: !!v };
    case 'number':
      return { display: typeof v === 'number' ? String(v) : '—', lines: [typeof v === 'number' ? String(v) : '—'], isMulti: false, isBool: false, boolVal: null };
    case 'number_g':
      return { display: typeof v === 'number' ? `${v}g` : '—', lines: [typeof v === 'number' ? `${v}g` : '—'], isMulti: false, isBool: false, boolVal: null };
    case 'number_mm':
      return { display: typeof v === 'number' ? `${v}mm` : '—', lines: [typeof v === 'number' ? `${v}mm` : '—'], isMulti: false, isBool: false, boolVal: null };
    case 'number_mAh':
      return { display: typeof v === 'number' ? `${v}mAh` : '—', lines: [typeof v === 'number' ? `${v}mAh` : '—'], isMulti: false, isBool: false, boolVal: null };
    case 'number_Hz':
      return { display: typeof v === 'number' ? `${v}Hz` : '—', lines: [typeof v === 'number' ? `${v}Hz` : '—'], isMulti: false, isBool: false, boolVal: null };
    case 'number_deg':
      return { display: typeof v === 'number' ? `${v}°` : '—', lines: [typeof v === 'number' ? `${v}°` : '—'], isMulti: false, isBool: false, boolVal: null };
    case 'number_M':
      return { display: typeof v === 'number' ? `${v} Million` : '—', lines: [typeof v === 'number' ? `${v} Million` : '—'], isMulti: false, isBool: false, boolVal: null };
  }
}

function normalize(s: string): string {
  return s.replace(/\s+/g, ' ').trim().toLowerCase();
}

export function allSame(specs: Record<string, unknown>[], row: SpecRow): boolean {
  if (specs.length < 2) return true;
  const first = formatSpecValue(specs[0], row.key, row.type);
  return specs.every((s) => {
    const cur = formatSpecValue(s, row.key, row.type);
    return normalize(first.display) === normalize(cur.display);
  });
}

export const KEYBOARD_SPEC_GROUPS: SpecGroup[] = [
  {
    title: 'Layout & Build',
    rows: [
      { label: 'Layout', key: 'layout', type: 'string' },
      { label: 'Keyboard Style', key: 'keyboardStyle', type: 'string[]' },
      { label: 'Case Material', key: 'caseMaterial', type: 'string' },
      { label: 'Surface Finish', key: 'surfaceFinish', type: 'string[]' },
      { label: 'Weight', key: 'weight', type: 'number_g' },
      { label: 'Typing Angle', key: 'typingAngle', type: 'number_deg' },
      { label: 'Length', key: 'lengthMm', type: 'number_mm' },
      { label: 'Width', key: 'widthMm', type: 'number_mm' },
      { label: 'Height', key: 'heightMm', type: 'number_mm' },
      { label: 'Color Options', key: 'colors', type: 'string[]' },
    ],
  },
  {
    title: 'Connectivity',
    rows: [
      { label: 'Connectivity', key: 'connectivity', type: 'string[]' },
      { label: 'Detachable Cable', key: 'detachableCable', type: 'boolean' },
      { label: 'Firmware', key: 'firmware', type: 'string[]' },
    ],
  },
  {
    title: 'Switches',
    collapsible: true,
    rows: [
      { label: 'Switches Included', key: 'switchesIncluded', type: 'boolean' },
      { label: 'Factory Lubed', key: 'factoryLubed', type: 'boolean' },
      { label: 'Hand Lubed', key: 'handLubed', type: 'boolean' },
      { label: 'Factory Filmed', key: 'factoryFilmed', type: 'boolean' },
      { label: 'Break-in Completed', key: 'breakInProgress', type: 'boolean' },
      { label: 'Socket Compatibility', key: 'switchCompat', type: 'string[]' },
      { label: 'Switch Type', key: 'switchType', type: 'string[]' },
      { label: 'Switch Brands', key: 'switchBrand', type: 'string[]' },
      { label: 'Switch Models', key: 'switchModel', type: 'string[]' },
      { label: 'Operating Force', key: 'switchOpForce', type: 'number_g' },
      { label: 'Bottom-out Force', key: 'switchBottomOut', type: 'number_g' },
      { label: 'Pre-Travel', key: 'switchPreTravel', type: 'number_mm' },
      { label: 'Total Travel', key: 'switchTotalTravel', type: 'number_mm' },
      { label: 'Spring Weight', key: 'switchSpringWeight', type: 'number_g' },
      { label: 'Spring Length', key: 'switchSpringLength', type: 'number_mm' },
      { label: 'Rated Lifetime', key: 'switchRatedLifetime', type: 'number_M' },
      { label: 'Stem Material', key: 'switchStemMaterial', type: 'string' },
      { label: 'Top Housing', key: 'switchTopHousing', type: 'string' },
      { label: 'Bottom Housing', key: 'switchBottomHousing', type: 'string' },
      { label: 'Spring Type', key: 'switchSpringType', type: 'string' },
      { label: 'Long Pole', key: 'switchLongPole', type: 'boolean' },
      { label: 'LED Diffuser', key: 'switchLedDiffuser', type: 'boolean' },
      { label: 'Dustproof Stem', key: 'switchDustproofStem', type: 'boolean' },
      { label: 'Light Pipe', key: 'switchLightPipe', type: 'boolean' },
    ],
  },
  {
    title: 'Keycaps',
    rows: [
      { label: 'Keycaps Included', key: 'keycapsIncluded', type: 'boolean' },
      { label: 'Keycap Material', key: 'keycapMaterial', type: 'string[]' },
      { label: 'Keycap Profile', key: 'keycapProfile', type: 'string' },
      { label: 'Legend Type', key: 'keycapLegendType', type: 'string[]' },
      { label: 'Legend Placement & Visibility', key: 'keycapLegendPlacement', type: 'string[]' },
    ],
  },
  {
    title: 'Mounting',
    rows: [
      { label: 'Mounting Style', key: 'mountingStyle', type: 'string[]' },
      { label: 'Plate Material', key: 'plateMaterial', type: 'string[]' },
      { label: 'Stabilizer Compatibility', key: 'stabilizerCompat', type: 'string[]' },
      { label: 'Stabilizer Layout', key: 'stabilizerLayout', type: 'string[]' },
      { label: 'Foam Material', key: 'foamMaterial', type: 'string[]' },
      { label: 'Foam Placement', key: 'foamPlacement', type: 'string[]' },
      { label: 'Flex Cuts', key: 'flexCuts', type: 'boolean' },
    ],
  },
  {
    title: 'PCB',
    rows: [
      { label: 'PCB Type', key: 'pcbType', type: 'string[]' },
      { label: 'PCB Thickness', key: 'pcbThickness', type: 'number_mm' },
      { label: 'Polling Rate', key: 'pollingRate', type: 'number_Hz' },
      { label: 'Battery Capacity', key: 'batteryCapacity', type: 'number_mAh' },
      { label: 'N-Key Rollover (NKRO)', key: 'nkro', type: 'boolean' },
    ],
  },
  {
    title: 'Lighting',
    rows: [
      { label: 'Lighting', key: 'lighting', type: 'string' },
      { label: 'LED Orientation', key: 'ledOrientation', type: 'string' },
      { label: 'Per-Key RGB', key: 'perKeyRgb', type: 'boolean' },
    ],
  },
  {
    title: 'Accessories & Features',
    rows: [
      { label: 'Included Accessories', key: 'includedAccessories', type: 'string[]' },
      { label: 'Additional Accessories', key: 'additionalAccessories', type: 'string' },
      { label: 'Special Features', key: 'specialFeatures', type: 'string' },
    ],
  },
];

export const MOUSE_SPEC_GROUPS: SpecGroup[] = [
  {
    title: 'Connection & Sensor',
    rows: [
      { label: 'Connection', key: 'mouseConnection', type: 'string[]' },
      { label: 'Sensor', key: 'mouseSensor', type: 'string' },
      { label: 'DPI', key: 'mouseDpi', type: 'number' },
    ],
  },
  {
    title: 'Performance',
    rows: [
      { label: 'Polling Rate', key: 'mousePollingRate', type: 'string[]' },
      { label: 'Max IPS', key: 'mouseMaxIps', type: 'number' },
      { label: 'Max Acceleration', key: 'mouseMaxAccel', type: 'number' },
      { label: 'Lift-off Distance', key: 'mouseLod', type: 'string' },
    ],
  },
  {
    title: 'Physical',
    rows: [
      { label: 'Weight', key: 'mouseWeight', type: 'number_g' },
      { label: 'Shape', key: 'mouseShape', type: 'string' },
      { label: 'Hand Orientation', key: 'mouseHandOrientation', type: 'string' },
      { label: 'Size', key: 'mouseSize', type: 'string' },
      { label: 'Length', key: 'mouseDimensionsLength', type: 'number_mm' },
      { label: 'Width', key: 'mouseDimensionsWidth', type: 'number_mm' },
      { label: 'Height', key: 'mouseDimensionsHeight', type: 'number_mm' },
    ],
  },
  {
    title: 'Switches & Input',
    rows: [
      { label: 'Switches', key: 'mouseSwitches', type: 'string' },
      { label: 'Encoder', key: 'mouseEncoder', type: 'string' },
      { label: 'Buttons', key: 'mouseButtons', type: 'number' },
      { label: 'Side Buttons', key: 'mouseSideButtons', type: 'number' },
      { label: 'Scroll Wheel', key: 'mouseScrollWheel', type: 'string' },
    ],
  },
  {
    title: 'Power',
    rows: [
      { label: 'Battery', key: 'mouseBattery', type: 'number_mAh' },
      { label: 'Battery Life', key: 'mouseBatteryLife', type: 'string' },
      { label: 'Charging Port', key: 'mouseChargingPort', type: 'string' },
    ],
  },
  {
    title: 'Build & Features',
    rows: [
      { label: 'Feet', key: 'mouseFeet', type: 'string' },
      { label: 'RGB', key: 'mouseRgb', type: 'boolean' },
      { label: 'Software Required', key: 'mouseSoftwareRequired', type: 'boolean' },
      { label: 'Onboard Memory', key: 'mouseOnboardMemory', type: 'boolean' },
      { label: 'Shell Material', key: 'mouseShellMaterial', type: 'string' },
      { label: 'Grip Type', key: 'mouseGripType', type: 'string[]' },
      { label: 'Color', key: 'mouseColor', type: 'string' },
    ],
  },
  {
    title: 'Compatibility',
    rows: [
      { label: 'Compatibility', key: 'mouseCompatibility', type: 'string[]' },
    ],
  },
  {
    title: 'Included',
    rows: [
      { label: 'Accessories', key: 'mouseAccessories', type: 'string[]' },
      { label: 'Other Accessories', key: 'mouseAccessoriesOther', type: 'string' },
    ],
  },
  {
    title: 'Warranty',
    rows: [
      { label: 'Warranty', key: 'mouseWarranty', type: 'string' },
    ],
  },
];
