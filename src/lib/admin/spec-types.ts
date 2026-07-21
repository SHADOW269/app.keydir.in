export interface Brand {
  id: string;
  name: string;
}

export interface VendorOption {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  brandId: string | null;
  productType: string;
  image: string | null;
  description: string | null;
  longDescription?: string | null;
  sku?: string | null;
  tags?: string[] | null;
  releaseDate?: string | null;
  status?: string;
  featured?: boolean;
  metaTitle?: string | null;
  metaDescription?: string | null;
  ogImage?: string | null;
  createdAt?: string | Date;
}

export interface ProductImage {
  id?: string;
  url: string;
  alt?: string;
  sortOrder: number;
  isPrimary: boolean;
}

export function serializeProduct(product: { releaseDate: Date | null; createdAt: Date; [key: string]: unknown }): Product {
  return {
    ...product,
    releaseDate: product.releaseDate ? product.releaseDate.toISOString().split('T')[0] : null,
    createdAt: product.createdAt,
  } as Product;
}

export function castJsonField<T>(val: unknown): T | null {
  if (val === null || val === undefined) return null;
  return val as T;
}

export function castJsonArray(val: unknown): string[] | null {
  if (val === null || val === undefined) return null;
  return val as string[];
}

export interface KeyboardSpecData {
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

export interface SwitchSpecData {
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

export interface KeycapSpecData {
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

export interface MouseSpecData {
  mouseConnection?: string[] | null;
  mouseSensor?: string | null;
  mouseDpi?: number | null;
  mousePollingRate?: string[] | null;
  mouseMaxIps?: number | null;
  mouseMaxAccel?: number | null;
  mouseLod?: string | null;
  mouseWeight?: number | null;
  mouseShape?: string | null;
  mouseHandOrientation?: string | null;
  mouseSize?: string | null;
  mouseDimensionsLength?: number | null;
  mouseDimensionsWidth?: number | null;
  mouseDimensionsHeight?: number | null;
  mouseSwitches?: string | null;
  mouseEncoder?: string | null;
  mouseButtons?: number | null;
  mouseSideButtons?: number | null;
  mouseScrollWheel?: string | null;
  mouseBattery?: number | null;
  mouseBatteryLife?: string | null;
  mouseChargingPort?: string | null;
  mouseFeet?: string | null;
  mouseRgb?: boolean;
  mouseSoftwareRequired?: boolean;
  mouseOnboardMemory?: boolean;
  mouseShellMaterial?: string | null;
  mouseGripType?: string[] | null;
  mouseColor?: string | null;
  mouseCompatibility?: string[] | null;
  mouseAccessories?: string[] | null;
  mouseAccessoriesOther?: string | null;
  mouseWarranty?: string | null;
}
