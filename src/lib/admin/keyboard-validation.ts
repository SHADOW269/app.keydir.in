export interface KeyboardProgressData {
  name: string;
  description: string;
  brandId: string;
  imageUrl: string;

  layout: string;
  keyboardStyle: string[];
  caseMaterial: string;
  surfaceFinish: string[];
  colors: string[];
  weight: string;
  lengthMm: string;
  widthMm: string;
  heightMm: string;
  typingAngle: string;

  mountingStyle: string[];
  plateMaterial: string[];
  stabilizerCompat: string[];
  stabilizerLayout: string[];
  foamMaterial: string[];
  foamPlacement: string[];
  flexCuts: boolean;

  pcbType: string[];
  pcbThickness: string;
  pollingRate: string;
  nkro: boolean;
  batteryCapacity: string;

  connectivity: string[];
  detachableCable: boolean;
  firmware: string[];

  lighting: string;
  ledOrientation: string;
  perKeyRgb: boolean;

  switchesIncluded: boolean;
  switchCompat: string[];
  switchType: string[];
  factoryLubed: boolean;
  handLubed: boolean;
  factoryFilmed: boolean;
  breakInProgress: boolean;
  switchBrand: string[];
  switchModel: string[];
  switchOpForce: string;
  switchBottomOut: string;
  switchPreTravel: string;
  switchTotalTravel: string;
  switchSpringWeight: string;
  switchSpringLength: string;
  switchRatedLifetime: string;
  switchStemMaterial: string;
  switchTopHousing: string;
  switchBottomHousing: string;
  switchSpringType: string;
  switchLongPole: boolean;
  switchLedDiffuser: boolean;
  switchDustproofStem: boolean;
  switchLightPipe: boolean;

  keycapMaterial: string[];
  keycapProfile: string;
  keycapLegendType: string[];
  keycapLegendPlacement: string[];

  includedAccessories: string[];
  additionalAccessories: string;
  specialFeatures: string;
}

export interface SectionProgress {
  id: string;
  completed: boolean;
  current: number;
  total: number;
}

function has(v: unknown): boolean {
  if (typeof v === 'string') return v.trim().length > 0;
  if (Array.isArray(v)) return v.length > 0;
  if (typeof v === 'boolean') return true;
  return false;
}

export function getKeyboardSectionProgress(d: KeyboardProgressData): SectionProgress[] {
  return [
    {
      id: 'basic',
      current: [d.name, d.description, d.brandId, d.imageUrl].filter(has).length,
      total: 4,
      completed: false,
    },
    {
      id: 'image',
      current: has(d.imageUrl) ? 1 : 0,
      total: 1,
      completed: false,
    },
    {
      id: 'layout',
      current: [
        d.layout, d.keyboardStyle, d.caseMaterial, d.surfaceFinish, d.colors,
        d.weight, d.lengthMm, d.widthMm, d.heightMm, d.typingAngle,
      ].filter(has).length,
      total: 10,
      completed: false,
    },
    {
      id: 'mounting',
      current: [
        d.mountingStyle, d.plateMaterial, d.stabilizerCompat, d.stabilizerLayout,
        d.foamMaterial, d.foamPlacement, d.flexCuts,
      ].filter(has).length,
      total: 7,
      completed: false,
    },
    {
      id: 'pcb',
      current: [
        d.pcbType, d.pcbThickness, d.pollingRate, d.nkro, d.batteryCapacity,
      ].filter(has).length,
      total: 5,
      completed: false,
    },
    {
      id: 'connectivity',
      current: [d.connectivity, d.detachableCable, d.firmware].filter(has).length,
      total: 3,
      completed: false,
    },
    {
      id: 'lighting',
      current: [d.lighting, d.ledOrientation, d.perKeyRgb].filter(has).length,
      total: 3,
      completed: false,
    },
    {
      id: 'switch',
      current: [
        d.switchesIncluded, d.factoryLubed, d.handLubed, d.factoryFilmed, d.breakInProgress,
        d.switchCompat, d.switchType, d.switchBrand, d.switchModel,
      ].filter(has).length,
      total: 9,
      completed: false,
    },
    {
      id: 'keycaps',
      current: [
        d.keycapMaterial, d.keycapProfile, d.keycapLegendType, d.keycapLegendPlacement,
      ].filter(has).length,
      total: 4,
      completed: false,
    },
    {
      id: 'features',
      current: [d.includedAccessories, d.additionalAccessories, d.specialFeatures].filter(has).length,
      total: 3,
      completed: false,
    },
  ].map((s) => ({ ...s, completed: s.total > 0 && s.current === s.total }));
}
