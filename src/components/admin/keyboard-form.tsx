'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/navbar';
import { useRouter } from 'next/navigation';
import { createProduct, updateProduct, deleteProduct, deleteVendorProduct, createVendorProduct, updateVendorStatus, checkVendorProduct, upsertKeyboardSpec, scrapeVendorProduct, clearManualOverride, upsertVendorVariants } from '@/lib/admin/actions';
import { getKeyboardSectionProgress } from '@/lib/admin/keyboard-validation';

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

interface Brand { id: string; name: string; }
interface Vendor { id: string; name: string; }
interface Product {
  id: string;
  name: string;
  slug: string;
  brandId: string | null;
  productType: string;
  image: string | null;
  description: string | null;
  createdAt?: Date;
}
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
interface ExistingVendorProduct {
  id: string; vendorId: string; vendorUrl: string; shippingCost: number; affiliateLink: string | null;
  price: number; stockStatus: string; lastChecked: Date | null; lastManualUpdate: Date | null;
  updatedBy: string | null; source: string;
  availability?: string; scrapeStatus?: string; scrapeError?: string | null;
  lastSuccessfulAt?: Date | null; scraperVersion?: string | null;
  lastHttpStatus?: number | null; responseTimeMs?: number | null;
  manualOverride?: boolean;
  shippingIncluded?: boolean;
  coupons?: ExistingCoupon[];
  variants?: ExistingVariant[];
}
interface ExistingVariant {
  id: string; name: string; color: string[] | null; switches: string[] | null; keycaps: string[] | null;
  price: number; stockStatus: string; variantUrl: string | null; sku: string | null; isDefault: boolean;
}
interface ExistingCoupon {
  id: string; code: string; discountType: string; discountValue: number | null;
  minimumOrderAmount: number | null; expiryDate: Date | null; couponUrl: string | null;
  description: string | null; enabled: boolean;
}
interface Props {
  product?: Product; keyboardSpec?: KeyboardSpecData | null;
  brands: Brand[]; vendors: Vendor[];
  existingVendorProducts?: ExistingVendorProduct[]; fixedProductType?: string;
}
interface CouponEntry {
  id?: string;
  code: string;
  discountType: 'percentage' | 'flat' | 'free_shipping';
  discountValue: number;
  minimumOrderAmount: number;
  expiryDate: string;
  couponUrl: string;
  description: string;
  enabled: boolean;
  collapsed: boolean;
}
interface VendorEntry {
  id?: string; vendorId: string; vendorUrl: string; shippingCost: number; affiliateLink: string;
  price: number; stockStatus: string;
  shippingIncluded: boolean;
  coupons: CouponEntry[];
  variants: VariantEntry[];
}
interface VariantEntry {
  id?: string; name: string; color: string[]; switches: string[]; keycaps: string[];
  price: number; stockStatus: string; variantUrl: string; sku: string; isDefault: boolean;
}

const SECTION_META: Record<string, { icon: string; label: string; subtitle: string }> = {
  basic:        { icon: '📝', label: 'Basic Information', subtitle: 'Product identity and images' },
  image:        { icon: '🖼', label: 'Product Image', subtitle: 'Primary product media' },
  layout:       { icon: '📐', label: 'Layout & Build', subtitle: 'Physical construction' },
  mounting:     { icon: '🔩', label: 'Mounting', subtitle: 'Internal structure and dampening' },
  pcb:          { icon: '🧩', label: 'PCB', subtitle: 'Internal electronics' },
  connectivity: { icon: '📡', label: 'Connectivity', subtitle: 'Wired and wireless options' },
  lighting:     { icon: '💡', label: 'Lighting', subtitle: 'RGB configuration' },
  switch:       { icon: '⌨', label: 'Switches', subtitle: 'Switch details and specifications' },
  keycaps:      { icon: '🎨', label: 'Keycaps', subtitle: 'Material and legend specs' },
  features:     { icon: '🎁', label: 'Accessories', subtitle: 'Included extras' },
  vendors:      { icon: '🏪', label: 'Vendors', subtitle: 'Retail sources' },
};

const SECTION_IDS = Object.keys(SECTION_META);

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

function TagInput({ label, value, onChange, placeholder }: { label: string; value: string[]; onChange: (v: string[]) => void; placeholder?: string }) {
  const [input, setInput] = useState('');
  const add = () => {
    const trimmed = input.trim();
    if (trimmed && !value.includes(trimmed)) { onChange([...value, trimmed]); setInput(''); }
  };
  return (
    <div className="kb-tag-input-wrap">
      <label className="kb-field-label">{label}</label>
      <div className="kb-tag-chips">
        {value.map((tag) => (
          <span key={tag} className="kb-tag-chip">
            {tag}
            <button type="button" className="kb-tag-remove" onClick={() => onChange(value.filter((t) => t !== tag))}>×</button>
          </span>
        ))}
        <input
          type="text"
          className="kb-tag-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(); } }}
          onBlur={add}
          placeholder={placeholder || `+ Add ${label}`}
        />
      </div>
    </div>
  );
}

function Field({ label, children, wide }: { label: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className={`kb-field ${wide ? 'full-width' : ''}`}>
      <label className="kb-field-label">{label}</label>
      {children}
    </div>
  );
}

export function KeyboardForm({
  product, keyboardSpec, brands, vendors,
  existingVendorProducts = [], fixedProductType,
}: Props) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [imageUrl, setImageUrl] = useState(product?.image ?? '');
  const [imageMode, setImageMode] = useState<'url' | 'upload'>('url');
  const [uploading, setUploading] = useState(false);
  const [activeSection, setActiveSection] = useState('basic');

  const productType = fixedProductType || product?.productType || 'keyboards';
  const isEdit = !!product;

  const [vendorEntries, setVendorEntries] = useState<VendorEntry[]>(() =>
    existingVendorProducts.map((vp) => ({
      id: vp.id, vendorId: vp.vendorId, vendorUrl: vp.vendorUrl, shippingCost: vp.shippingCost,
      affiliateLink: vp.affiliateLink ?? '', price: vp.price, stockStatus: vp.stockStatus,
      shippingIncluded: vp.shippingCost === 0,
      coupons: (vp.coupons ?? []).map((c) => ({
        id: c.id, code: c.code, discountType: c.discountType as CouponEntry['discountType'],
        discountValue: c.discountValue ?? 0, minimumOrderAmount: c.minimumOrderAmount ?? 0,
        expiryDate: c.expiryDate ? new Date(c.expiryDate).toISOString().slice(0, 10) : '',
        couponUrl: c.couponUrl || '', description: c.description || '', enabled: c.enabled, collapsed: true,
      })),
      variants: (vp.variants ?? []).map((v) => ({
        id: v.id, name: v.name, color: v.color ?? [], switches: v.switches ?? [], keycaps: v.keycaps ?? [],
        price: v.price, stockStatus: v.stockStatus, variantUrl: v.variantUrl ?? '', sku: v.sku ?? '', isDefault: v.isDefault,
      })),
    }))
  );
  const [vendorChecking, setVendorChecking] = useState<Record<number, boolean>>({});
  const [vendorCheckResult, setVendorCheckResult] = useState<Record<number, { ok: boolean; message: string; currentPrice?: number; currentStatus?: string; lastChecked?: string | null; scrapedPrice?: number; scrapedAvailability?: string; scraperVersion?: string } | null>>({});
  const [vendorUpdating, setVendorUpdating] = useState<Record<number, boolean>>({});
  const [vendorScraping, setVendorScraping] = useState<Record<number, boolean>>({});
  const [vendorClearing, setVendorClearing] = useState<Record<number, boolean>>({});

  // Form fields
  const [name, setName] = useState(product?.name ?? '');
  const [brandId, setBrandId] = useState(product?.brandId ?? '');
  const [description, setDescription] = useState(product?.description ?? '');
  const [layout, setLayout] = useState(keyboardSpec?.layout ?? '');
  const [keyboardStyle, setKeyboardStyle] = useState<string[]>(keyboardSpec?.keyboardStyle ?? []);
  const [caseMaterial, setCaseMaterial] = useState(keyboardSpec?.caseMaterial ?? '');
  const [surfaceFinish, setSurfaceFinish] = useState<string[]>(keyboardSpec?.surfaceFinish ?? []);
  const [colors, setColors] = useState<string[]>(keyboardSpec?.colors ?? []);
  const [weight, setWeight] = useState(String(keyboardSpec?.weight ?? ''));
  const [lengthMm, setLengthMm] = useState(String(keyboardSpec?.lengthMm ?? ''));
  const [widthMm, setWidthMm] = useState(String(keyboardSpec?.widthMm ?? ''));
  const [heightMm, setHeightMm] = useState(String(keyboardSpec?.heightMm ?? ''));
  const [typingAngle, setTypingAngle] = useState(String(keyboardSpec?.typingAngle ?? ''));
  const [mountingStyle, setMountingStyle] = useState<string[]>(keyboardSpec?.mountingStyle ?? []);
  const [plateMaterial, setPlateMaterial] = useState<string[]>(keyboardSpec?.plateMaterial ?? []);
  const [stabilizerCompat, setStabilizerCompat] = useState<string[]>(keyboardSpec?.stabilizerCompat ?? []);
  const [stabilizerLayout, setStabilizerLayout] = useState<string[]>(keyboardSpec?.stabilizerLayout ?? []);
  const [foamMaterial, setFoamMaterial] = useState<string[]>(keyboardSpec?.foamMaterial ?? []);
  const [foamPlacement, setFoamPlacement] = useState<string[]>(keyboardSpec?.foamPlacement ?? []);
  const [flexCuts, setFlexCuts] = useState(keyboardSpec?.flexCuts ?? false);
  const [pcbType, setPcbType] = useState<string[]>(keyboardSpec?.pcbType ?? []);
  const [pcbThickness, setPcbThickness] = useState(String(keyboardSpec?.pcbThickness ?? ''));
  const [pollingRate, setPollingRate] = useState(String(keyboardSpec?.pollingRate ?? ''));
  const [nkro, setNkro] = useState(keyboardSpec?.nkro ?? false);
  const [batteryCapacity, setBatteryCapacity] = useState(String(keyboardSpec?.batteryCapacity ?? ''));
  const [connectivity, setConnectivity] = useState<string[]>(keyboardSpec?.connectivity ?? []);
  const [detachableCable, setDetachableCable] = useState(keyboardSpec?.detachableCable ?? false);
  const [firmware, setFirmware] = useState<string[]>(keyboardSpec?.firmware ?? []);
  const [lighting, setLighting] = useState(keyboardSpec?.lighting ?? '');
  const [ledOrientation, setLedOrientation] = useState(keyboardSpec?.ledOrientation ?? '');
  const [perKeyRgb, setPerKeyRgb] = useState(keyboardSpec?.perKeyRgb ?? false);
  const [switchesIncluded, setSwitchesIncluded] = useState(keyboardSpec?.switchesIncluded ?? false);
  const [switchCompat, setSwitchCompat] = useState<string[]>(keyboardSpec?.switchCompat ?? []);
  const [switchType, setSwitchType] = useState<string[]>(keyboardSpec?.switchType ?? []);
  const [factoryLubed, setFactoryLubed] = useState(keyboardSpec?.factoryLubed ?? false);
  const [handLubed, setHandLubed] = useState(keyboardSpec?.handLubed ?? false);
  const [factoryFilmed, setFactoryFilmed] = useState(keyboardSpec?.factoryFilmed ?? false);
  const [breakInProgress, setBreakInProgress] = useState(keyboardSpec?.breakInProgress ?? false);
  const [switchBrand, setSwitchBrand] = useState<string[]>(keyboardSpec?.switchBrand ?? []);
  const [switchModel, setSwitchModel] = useState<string[]>(keyboardSpec?.switchModel ?? []);
  const [switchOpForce, setSwitchOpForce] = useState(String(keyboardSpec?.switchOpForce ?? ''));
  const [switchBottomOut, setSwitchBottomOut] = useState(String(keyboardSpec?.switchBottomOut ?? ''));
  const [switchPreTravel, setSwitchPreTravel] = useState(String(keyboardSpec?.switchPreTravel ?? ''));
  const [switchTotalTravel, setSwitchTotalTravel] = useState(String(keyboardSpec?.switchTotalTravel ?? ''));
  const [switchSpringWeight, setSwitchSpringWeight] = useState(String(keyboardSpec?.switchSpringWeight ?? ''));
  const [switchSpringLength, setSwitchSpringLength] = useState(String(keyboardSpec?.switchSpringLength ?? ''));
  const [switchRatedLifetime, setSwitchRatedLifetime] = useState(String(keyboardSpec?.switchRatedLifetime ?? ''));
  const [switchStemMaterial, setSwitchStemMaterial] = useState(keyboardSpec?.switchStemMaterial ?? '');
  const [switchTopHousing, setSwitchTopHousing] = useState(keyboardSpec?.switchTopHousing ?? '');
  const [switchBottomHousing, setSwitchBottomHousing] = useState(keyboardSpec?.switchBottomHousing ?? '');
  const [switchSpringType, setSwitchSpringType] = useState(keyboardSpec?.switchSpringType ?? '');
  const [switchLongPole, setSwitchLongPole] = useState(keyboardSpec?.switchLongPole ?? false);
  const [switchLedDiffuser, setSwitchLedDiffuser] = useState(keyboardSpec?.switchLedDiffuser ?? false);
  const [switchDustproofStem, setSwitchDustproofStem] = useState(keyboardSpec?.switchDustproofStem ?? false);
  const [switchLightPipe, setSwitchLightPipe] = useState(keyboardSpec?.switchLightPipe ?? false);
  const [keycapMaterial, setKeycapMaterial] = useState<string[]>(keyboardSpec?.keycapMaterial ?? []);
  const [keycapProfile, setKeycapProfile] = useState(keyboardSpec?.keycapProfile ?? '');
  const [keycapLegendType, setKeycapLegendType] = useState<string[]>(keyboardSpec?.keycapLegendType ?? []);
  const [keycapLegendPlacement, setKeycapLegendPlacement] = useState<string[]>(keyboardSpec?.keycapLegendPlacement ?? []);
  const [keycapsIncluded, setKeycapsIncluded] = useState(keyboardSpec?.keycapsIncluded ?? false);
  const [includedAccessories, setIncludedAccessories] = useState<string[]>(keyboardSpec?.includedAccessories ?? []);
  const [additionalAccessories, setAdditionalAccessories] = useState(keyboardSpec?.additionalAccessories ?? '');
  const [specialFeatures, setSpecialFeatures] = useState(keyboardSpec?.specialFeatures ?? '');

  const markChange = useCallback(() => setHasChanges(true), []);

  // Scroll tracking
  useEffect(() => {
    const sectionEls = SECTION_IDS.map((id) => document.getElementById(`kb-section-${id}`)).filter(Boolean) as HTMLElement[];
    if (!sectionEls.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) setActiveSection(visible[0].target.id.replace('kb-section-', ''));
      },
      { rootMargin: '-20% 0px -60% 0px', threshold: 0 }
    );
    sectionEls.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Before unload
  useEffect(() => {
    if (!hasChanges) return;
    const h = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener('beforeunload', h);
    return () => window.removeEventListener('beforeunload', h);
  }, [hasChanges]);

  // Completion tracking via validation utility
  const sectionProgress = getKeyboardSectionProgress({
    name, description, brandId, imageUrl,
    layout, keyboardStyle, caseMaterial, surfaceFinish, colors,
    weight, lengthMm, widthMm, heightMm, typingAngle,
    mountingStyle, plateMaterial, stabilizerCompat, stabilizerLayout, foamMaterial, foamPlacement, flexCuts,
    pcbType, pcbThickness, pollingRate, nkro, batteryCapacity,
    connectivity, detachableCable, firmware,
    lighting, ledOrientation, perKeyRgb,
    switchesIncluded, switchCompat, switchType, factoryLubed, handLubed, factoryFilmed, breakInProgress,
    switchBrand, switchModel, switchOpForce, switchBottomOut, switchPreTravel, switchTotalTravel,
    switchSpringWeight, switchSpringLength, switchRatedLifetime,
    switchStemMaterial, switchTopHousing, switchBottomHousing, switchSpringType,
    switchLongPole, switchLedDiffuser, switchDustproofStem, switchLightPipe,
    keycapMaterial, keycapProfile, keycapLegendType, keycapLegendPlacement,
    includedAccessories, additionalAccessories, specialFeatures,
    vendorEntries,
  });
  const progressMap = Object.fromEntries(sectionProgress.map((s) => [s.id, s]));

  function scrollToSection(id: string) {
    document.getElementById(`kb-section-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const form = new FormData(formRef.current!);
    form.set('image', imageUrl);
    form.set('productType', productType);
    let productId = product?.id;
    if (isEdit) {
      const result = await updateProduct(product!.id, form);
      if (result?.error) { setError(result.error); setPending(false); return; }
    } else {
      const result = await createProduct(form);
      if (result?.error) { setError(result.error); setPending(false); return; }
      productId = result.id;
    }
    if (productId) {
      await upsertKeyboardSpec(productId, {
        layout, keyboardStyle, caseMaterial, surfaceFinish, colors,
        weight: weight ? parseInt(weight) : null, lengthMm: lengthMm ? parseInt(lengthMm) : null,
        widthMm: widthMm ? parseInt(widthMm) : null, heightMm: heightMm ? parseInt(heightMm) : null,
        typingAngle: typingAngle ? parseInt(typingAngle) : null,
        mountingStyle, plateMaterial, stabilizerCompat, stabilizerLayout, foamMaterial, foamPlacement, flexCuts,
        pcbType, pcbThickness: pcbThickness ? parseFloat(pcbThickness) : null,
        pollingRate: pollingRate ? parseInt(pollingRate) : null, nkro,
        batteryCapacity: batteryCapacity ? parseInt(batteryCapacity) : null,
        connectivity, detachableCable, firmware, lighting, ledOrientation, perKeyRgb,
        switchesIncluded, switchCompat, switchType, factoryLubed, handLubed, factoryFilmed, breakInProgress,
        switchBrand, switchModel,
        switchOpForce: switchOpForce ? parseFloat(switchOpForce) : null,
        switchBottomOut: switchBottomOut ? parseFloat(switchBottomOut) : null,
        switchPreTravel: switchPreTravel ? parseFloat(switchPreTravel) : null,
        switchTotalTravel: switchTotalTravel ? parseFloat(switchTotalTravel) : null,
        switchSpringWeight: switchSpringWeight ? parseFloat(switchSpringWeight) : null,
        switchSpringLength: switchSpringLength ? parseFloat(switchSpringLength) : null,
        switchRatedLifetime: switchRatedLifetime ? parseInt(switchRatedLifetime) : null,
        switchStemMaterial, switchTopHousing, switchBottomHousing, switchSpringType,
        switchLongPole, switchLedDiffuser, switchDustproofStem, switchLightPipe,
        keycapsIncluded, keycapMaterial, keycapProfile, keycapLegendType, keycapLegendPlacement,
        includedAccessories, additionalAccessories, specialFeatures,
      });
      const validEntries = vendorEntries.filter((ve) => ve.vendorId && ve.vendorUrl);
      if (isEdit && product?.id) {
        for (const vp of existingVendorProducts) {
          if (!validEntries.some((ve) => ve.id === vp.id)) await deleteVendorProduct(vp.id);
        }
      }
      for (const entry of validEntries) {
        const fd = new FormData();
        fd.set('vendorId', entry.vendorId); fd.set('productId', productId);
        fd.set('vendorUrl', entry.vendorUrl); fd.set('price', String(entry.price || 0));
        fd.set('shippingCost', String(entry.shippingCost || 0));
        fd.set('shippingIncluded', entry.shippingIncluded ? 'on' : '');
        fd.set('stockStatus', entry.stockStatus || 'in_stock'); fd.set('affiliateLink', entry.affiliateLink);
        fd.set('coupons', JSON.stringify(entry.coupons.map(({ collapsed, ...c }) => c)));
        const result = await createVendorProduct(fd);
        if (result && 'id' in result && entry.variants.length > 0) {
          await upsertVendorVariants(result.id as string, entry.variants);
        }
      }
    }
    setHasChanges(false);
    if (!isEdit) { window.location.href = `/admin/products/${productType}`; return; }
    window.location.reload();
  }

  async function handleDelete() {
    if (!product?.id) return;
    setDeleting(true); setDeleteError(null);
    const result = await deleteProduct(product.id, deletePassword);
    if (result?.error) { setDeleteError(result.error); setDeleting(false); return; }
    router.push(`/admin/products/${productType}`);
  }

  async function handleImageUpload(file: File) {
    setUploading(true);
    try {
      const fd = new FormData(); fd.append('file', file); fd.append('dir', 'products');
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.url) { setImageUrl(data.url); markChange(); }
      else { setError(data.error || 'Upload failed'); }
    } catch { setError('Image upload failed'); }
    setUploading(false);
  }

  const addVendorEntry = () => { setVendorEntries((p) => [...p, { vendorId: '', vendorUrl: '', shippingCost: 0, affiliateLink: '', price: 0, stockStatus: 'in_stock', shippingIncluded: true, coupons: [], variants: [] }]); markChange(); };
  const removeVendorEntry = (idx: number) => { setVendorEntries((p) => p.filter((_, i) => i !== idx)); markChange(); };
  const updateVendorEntry = (idx: number, field: keyof VendorEntry, value: string | number | boolean) => { setVendorEntries((p) => p.map((e, i) => i === idx ? { ...e, [field]: value } : e)); markChange(); };

  const addVendorCoupon = (vendorIdx: number) => {
    setVendorEntries((p) => p.map((e, i) => i === vendorIdx ? {
      ...e, coupons: [...e.coupons, { code: '', discountType: 'percentage', discountValue: 0, minimumOrderAmount: 0, expiryDate: '', couponUrl: '', description: '', enabled: true, collapsed: false }],
    } : e));
    markChange();
  };
  const removeVendorCoupon = (vendorIdx: number, couponIdx: number) => {
    setVendorEntries((p) => p.map((e, i) => i === vendorIdx ? {
      ...e, coupons: e.coupons.filter((_, ci) => ci !== couponIdx),
    } : e));
    markChange();
  };
  const updateVendorCoupon = (vendorIdx: number, couponIdx: number, field: keyof CouponEntry, value: unknown) => {
    setVendorEntries((p) => p.map((e, i) => i === vendorIdx ? {
      ...e, coupons: e.coupons.map((c, ci) => ci === couponIdx ? { ...c, [field]: value } : c),
    } : e));
    markChange();
  };
  const toggleVendorCouponCollapsed = (vendorIdx: number, couponIdx: number) => {
    setVendorEntries((p) => p.map((e, i) => i === vendorIdx ? {
      ...e, coupons: e.coupons.map((c, ci) => ci === couponIdx ? { ...c, collapsed: !c.collapsed } : c),
    } : e));
  };

  const addVariant = (vendorIdx: number) => {
    setVendorEntries((p) => p.map((e, i) => i === vendorIdx ? {
      ...e, variants: [...e.variants, { name: '', color: [], switches: [], keycaps: [], price: 0, stockStatus: 'in_stock', variantUrl: '', sku: '', isDefault: e.variants.length === 0 }],
    } : e));
    markChange();
  };
  const removeVariant = (vendorIdx: number, variantIdx: number) => {
    setVendorEntries((p) => p.map((e, i) => i === vendorIdx ? {
      ...e, variants: e.variants.filter((_, vi) => vi !== variantIdx),
    } : e));
    markChange();
  };
  const updateVariant = (vendorIdx: number, variantIdx: number, field: keyof VariantEntry, value: unknown) => {
    setVendorEntries((p) => p.map((e, i) => i === vendorIdx ? {
      ...e, variants: e.variants.map((v, vi) => vi === variantIdx ? { ...v, [field]: value } : v),
    } : e));
    markChange();
  };

  async function handleCheckNow(idx: number) {
    const entry = vendorEntries[idx];
    if (!entry.id) return;
    setVendorChecking((p) => ({ ...p, [idx]: true }));
    setVendorCheckResult((p) => ({ ...p, [idx]: null }));
    try {
      const result = await checkVendorProduct(entry.id);
      if ('error' in result) {
        setVendorCheckResult((p) => ({ ...p, [idx]: { ok: false, message: String(result.error || 'Check failed') } }));
      } else {
        setVendorCheckResult((p) => ({ ...p, [idx]: {
          ok: true,
          message: String(result.message || 'OK'),
          currentPrice: result.currentPrice,
          currentStatus: result.currentStatus,
          lastChecked: result.lastChecked,
          scrapedPrice: result.scrapedPrice ?? undefined,
          scrapedAvailability: result.scrapedAvailability,
          scraperVersion: result.scraperVersion,
        } }));
      }
    } catch {
      setVendorCheckResult((p) => ({ ...p, [idx]: { ok: false, message: 'Network error' } }));
    }
    setVendorChecking((p) => ({ ...p, [idx]: false }));
  }

  async function handleUpdateStatus(idx: number) {
    const entry = vendorEntries[idx];
    if (!entry.id) return;
    setVendorUpdating((p) => ({ ...p, [idx]: true }));
    try {
      const fd = new FormData();
      fd.set('vendorProductId', entry.id);
      fd.set('price', String(entry.price || 0));
      fd.set('stockStatus', entry.stockStatus || 'in_stock');
      fd.set('shippingCost', String(entry.shippingCost || 0));
      fd.set('shippingIncluded', entry.shippingIncluded ? 'on' : '');
      fd.set('coupons', JSON.stringify(entry.coupons.map(({ collapsed, ...c }) => c)));
      const result = await updateVendorStatus(fd);
      if (result?.error) { setError(result.error); }
      else { window.location.reload(); }
    } catch { setError('Failed to update vendor status'); }
    setVendorUpdating((p) => ({ ...p, [idx]: false }));
  }

  async function handleScrapeNow(idx: number) {
    const entry = vendorEntries[idx];
    if (!entry.id) return;
    setVendorScraping((p) => ({ ...p, [idx]: true }));
    setVendorCheckResult((p) => ({ ...p, [idx]: null }));
    try {
      const result = await scrapeVendorProduct(entry.id);
      if (result?.error) {
        setVendorCheckResult((p) => ({ ...p, [idx]: { ok: false, message: String(result.error) } }));
      } else {
        setVendorCheckResult((p) => ({ ...p, [idx]: {
          ok: true,
          message: `Scraped: ₹${result.price?.toLocaleString()} (${result.availability})`,
          scrapedPrice: result.price,
          scrapedAvailability: result.availability,
        } }));
        window.location.reload();
      }
    } catch {
      setVendorCheckResult((p) => ({ ...p, [idx]: { ok: false, message: 'Network error' } }));
    }
    setVendorScraping((p) => ({ ...p, [idx]: false }));
  }

  async function handleClearOverride(idx: number) {
    const entry = vendorEntries[idx];
    if (!entry.id) return;
    setVendorClearing((p) => ({ ...p, [idx]: true }));
    try {
      const result = await clearManualOverride(entry.id);
      if (!result?.ok) {
        setVendorCheckResult((p) => ({ ...p, [idx]: { ok: false, message: 'Failed to clear override' } }));
      } else {
        window.location.reload();
      }
    } catch {
      setVendorCheckResult((p) => ({ ...p, [idx]: { ok: false, message: 'Failed to clear override' } }));
    }
    setVendorClearing((p) => ({ ...p, [idx]: false }));
  }

  return (
    <>
      <Navbar />
      <div className="kb-editor-layout">
        {/* ── Sidebar Nav ── */}
        <aside className="kb-sidebar">
          <div className="kb-sidebar-inner">
            <div className="kb-sidebar-logo">KB</div>
            {SECTION_IDS.map((id, i) => {
              const meta = SECTION_META[id];
              const c = progressMap[id];
              const isActive = activeSection === id;
              return (
                <button key={id} type="button" className={`kb-nav-item ${isActive ? 'active' : ''}`} onClick={() => scrollToSection(id)}>
                  <span className="kb-nav-num">{String(i + 1).padStart(2, '0')}</span>
                  <span className="kb-nav-label">{meta.label}</span>
                  {c && c.total > 0 && (
                    <span className={`kb-nav-badge ${c.completed ? 'done' : ''}`}>
                      {c.completed ? '✓' : `${c.current}/${c.total}`}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </aside>

        {/* ── Main Content ── */}
        <main className="kb-main">
          <div className="kb-editor-header">
            <div className="kb-editor-header-left">
              <div className="kb-editor-breadcrumb">
                <span>KEYBOARD DATABASE</span>
                <span className="sep">/</span>
                <span>{isEdit ? 'EDITING' : 'ADDING'}</span>
              </div>
              <h1 className="kb-editor-title">
                {isEdit ? product!.name : 'NEW KEYBOARD'}
                {isEdit && <em> KEYBOARD</em>}
                {isEdit && (
                  <button type="button" onClick={() => setShowDeleteModal(true)} className="kb-delete-btn" title="Delete keyboard">🗑</button>
                )}
              </h1>
            </div>
            <div className="kb-editor-actions">
              <Link href={`/admin/products/${productType}`} className="btn-secondary">CANCEL</Link>
              {isEdit && <button type="button" onClick={() => setShowDeleteModal(true)} className="btn-danger">DELETE</button>}
            </div>
          </div>

          {error && <div className="kb-error-banner">{error}</div>}

          <form ref={formRef} id="kb-form" onSubmit={handleSubmit}>
            {/* Basic Information */}
            <section id="kb-section-basic" className="kb-section">
              <button type="button" className="kb-section-header" onClick={() => scrollToSection('layout')}>
                <div className="kb-section-title-group">
                  <div className="kb-section-title"><span className="kb-section-icon">📝</span> Basic Information</div>
                  <span className="kb-section-subtitle">Product identity and images</span>
                </div>
                <span className="kb-section-chevron">›</span>
              </button>
              <div className="kb-section-body">
                <div className="kb-pair-grid">
                  <Field label="Keyboard Name *">
                    <input name="name" required value={name} onChange={(e) => { setName(e.target.value); markChange(); }} className="kb-input" placeholder="e.g. Rainy75, Wooting 60HE" />
                  </Field>
                  <Field label="Brand">
                    <select name="brandId" value={brandId} onChange={(e) => { setBrandId(e.target.value); markChange(); }} className="kb-input">
                      <option value="">— No Brand —</option>
                      {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                  </Field>
                </div>
                <Field label="Short Description" wide>
                  <textarea name="description" rows={3} value={description} onChange={(e) => { setDescription(e.target.value); markChange(); }} className="kb-input kb-textarea" placeholder="Brief overview of the keyboard's key features and selling points..." maxLength={500} />
                  <div className="kb-char-count">{description.length}/500</div>
                </Field>
              </div>
            </section>

            {/* Product Image */}
            <section id="kb-section-image" className="kb-section">
              <button type="button" className="kb-section-header" onClick={() => scrollToSection('layout')}>
                <div className="kb-section-title-group">
                  <div className="kb-section-title"><span className="kb-section-icon">🖼</span> Product Image</div>
                  <span className="kb-section-subtitle">Primary product media</span>
                </div>
                <span className="kb-section-chevron">›</span>
              </button>
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
                      if (file) handleImageUpload(file);
                    }}
                  >
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp,.avif"
                      className="kb-dropzone-input"
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload(f); }}
                    />
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
                      <button type="button" className="btn-secondary btn-sm" onClick={() => { const input = document.createElement('input'); input.type = 'file'; input.accept = '.jpg,.jpeg,.png,.webp,.avif'; input.onchange = (e) => { const f = (e.target as HTMLInputElement).files?.[0]; if (f) handleImageUpload(f); }; input.click(); }}>Replace</button>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Layout & Build */}
            <section id="kb-section-layout" className="kb-section">
              <button type="button" className="kb-section-header" onClick={() => scrollToSection('mounting')}>
                <div className="kb-section-title-group">
                  <div className="kb-section-title"><span className="kb-section-icon">📐</span> Layout & Build</div>
                  <span className="kb-section-subtitle">Physical construction</span>
                </div>
                <span className="kb-section-chevron">›</span>
              </button>
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
                  <textarea
                    name="colors"
                    rows={3}
                    value={colors.join('\n')}
                    onChange={(e) => { setColors(e.target.value.split('\n').map((l) => l.trim()).filter(Boolean)); markChange(); }}
                    className="kb-input kb-textarea"
                    placeholder={"Black\nWhite\nNavy Blue"}
                  />
                  <div className="kb-char-count">{colors.length} color{colors.length !== 1 ? 's' : ''}</div>
                </Field>
              </div>
            </section>

            {/* Mounting */}
            <section id="kb-section-mounting" className="kb-section">
              <button type="button" className="kb-section-header" onClick={() => scrollToSection('pcb')}>
                <div className="kb-section-title-group">
                  <div className="kb-section-title"><span className="kb-section-icon">🔩</span> Mounting</div>
                  <span className="kb-section-subtitle">Internal structure and dampening</span>
                </div>
                <span className="kb-section-chevron">›</span>
              </button>
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
            </section>

            {/* PCB */}
            <section id="kb-section-pcb" className="kb-section">
              <button type="button" className="kb-section-header" onClick={() => scrollToSection('connectivity')}>
                <div className="kb-section-title-group">
                  <div className="kb-section-title"><span className="kb-section-icon">🧩</span> PCB</div>
                  <span className="kb-section-subtitle">Internal electronics</span>
                </div>
                <span className="kb-section-chevron">›</span>
              </button>
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
            </section>

            {/* Connectivity */}
            <section id="kb-section-connectivity" className="kb-section">
              <button type="button" className="kb-section-header" onClick={() => scrollToSection('lighting')}>
                <div className="kb-section-title-group">
                  <div className="kb-section-title"><span className="kb-section-icon">📡</span> Connectivity</div>
                  <span className="kb-section-subtitle">Wired and wireless options</span>
                </div>
                <span className="kb-section-chevron">›</span>
              </button>
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
            </section>

            {/* Lighting */}
            <section id="kb-section-lighting" className="kb-section">
              <button type="button" className="kb-section-header" onClick={() => scrollToSection('switch')}>
                <div className="kb-section-title-group">
                  <div className="kb-section-title"><span className="kb-section-icon">💡</span> Lighting</div>
                  <span className="kb-section-subtitle">RGB configuration</span>
                </div>
                <span className="kb-section-chevron">›</span>
              </button>
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
            </section>

            {/* Switches */}
            <section id="kb-section-switch" className="kb-section">
              <button type="button" className="kb-section-header" onClick={() => scrollToSection('keycaps')}>
                <div className="kb-section-title-group">
                  <div className="kb-section-title"><span className="kb-section-icon">⌨</span> Switches</div>
                  <span className="kb-section-subtitle">Switch details and specifications</span>
                </div>
                <span className="kb-section-chevron">›</span>
              </button>
              <div className="kb-section-body">

                {/* 1. Included */}
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

                {/* 2. Compatibility */}
                <div className="kb-subgroup-label">Compatibility</div>
                <Field label="Socket Compatibility">
                  <div className="kb-chip-container">
                    <ChipSelect name="switchCompat" options={SWITCH_COMPAT} value={switchCompat} onChange={(v) => { setSwitchCompat(v); markChange(); }} />
                  </div>
                </Field>

                <div className="kb-divider" />

                {/* 3. Switch Type */}
                <div className="kb-subgroup-label">Switch Type</div>
                <Field label="Type">
                  <div className="kb-chip-container">
                    <ChipSelect name="switchType" options={SWITCH_TYPE} value={switchType} onChange={(v) => { setSwitchType(v); markChange(); }} />
                  </div>
                </Field>

                <div className="kb-divider" />

                {/* 4 & 5. Brand & Model */}
                <div className="kb-pair-grid">
                  <TagInput label="Switch Brands" value={switchBrand} onChange={(v) => { setSwitchBrand(v); markChange(); }} placeholder="+ Add Brand" />
                  <TagInput label="Switch Models" value={switchModel} onChange={(v) => { setSwitchModel(v); markChange(); }} placeholder="+ Add Model" />
                </div>

                <div className="kb-divider" />

                {/* 6. Specifications */}
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

                {/* 7. Materials */}
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

                {/* 8. Spring */}
                <div className="kb-subgroup-label">Spring</div>
                <Field label="Spring Type">
                  <select name="switchSpringType" value={switchSpringType} onChange={(e) => { setSwitchSpringType(e.target.value); markChange(); }} className="kb-input">
                    <option value="">— Select —</option>
                    {SPRING_TYPES.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                </Field>

                <div className="kb-divider" />

                {/* 9. Additional Features */}
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
            </section>

            {/* Keycaps */}
            <section id="kb-section-keycaps" className="kb-section">
              <button type="button" className="kb-section-header" onClick={() => scrollToSection('features')}>
                <div className="kb-section-title-group">
                  <div className="kb-section-title"><span className="kb-section-icon">🎨</span> Keycaps</div>
                  <span className="kb-section-subtitle">Material and legend specs</span>
                </div>
                <span className="kb-section-chevron">›</span>
              </button>
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
            </section>

            {/* Accessories */}
            <section id="kb-section-features" className="kb-section">
              <button type="button" className="kb-section-header" onClick={() => scrollToSection('vendors')}>
                <div className="kb-section-title-group">
                  <div className="kb-section-title"><span className="kb-section-icon">🎁</span> Accessories & Features</div>
                  <span className="kb-section-subtitle">Included extras</span>
                </div>
                <span className="kb-section-chevron">›</span>
              </button>
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
            </section>

            {/* Vendors */}
            <section id="kb-section-vendors" className="kb-section">
              <div className="kb-section-header">
                <div className="kb-section-title-group">
                  <div className="kb-section-title"><span className="kb-section-icon">🏪</span> Vendor Information</div>
                  <span className="kb-section-subtitle">Retail sources & price tracking</span>
                </div>
              </div>
              <div className="kb-section-body">
                {vendorEntries.map((entry, idx) => {
                  const existing = entry.id ? existingVendorProducts.find((vp) => vp.id === entry.id) : null;
                  const vendorName = vendors.find((v) => v.id === entry.vendorId)?.name || 'Select Vendor';
                  const scrapeStatusClass = existing?.scrapeStatus === 'SUCCESS' ? 'success' : existing?.scrapeStatus === 'FAILED' ? 'failed' : existing?.scrapeStatus === 'NEEDS_REVIEW' ? 'warning' : 'pending';
                  const scrapeStatusLabel = existing?.scrapeStatus || 'NOT CHECKED';
                  return (
                    <div key={idx} className="kb-vendor-card">
                      {/* Header */}
                      <div className="kb-vendor-header">
                        <div className="kb-vendor-header-left">
                          <span className="kb-vendor-name">{vendorName}</span>
                          {entry.id && (
                            <span className="kb-vendor-tracking-badge on">
                              ✓ Tracking
                            </span>
                          )}
                        </div>
                        <button type="button" className="kb-vendor-remove" onClick={() => removeVendorEntry(idx)}>Remove</button>
                      </div>

                      {/* Section: Product Details + Pricing */}
                      <div className="kb-vendor-section">
                        <div className="kb-vendor-two-col">
                          {/* Left: Product Details */}
                          <div>
                            <div className="kb-vendor-section-label">🌐 Product Details</div>
                            <div className="kb-vendor-field">
                              <span className="kb-vendor-field-label">Vendor *</span>
                              <select className="kb-vendor-select" value={entry.vendorId} onChange={(e) => updateVendorEntry(idx, 'vendorId', e.target.value)}>
                                <option value="">Select vendor</option>
                                {vendors.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
                              </select>
                            </div>
                            <div className="kb-vendor-field">
                              <span className="kb-vendor-field-label">🌐 Product URL *</span>
                              <input type="url" className="kb-vendor-input" placeholder="https://..." value={entry.vendorUrl} onChange={(e) => updateVendorEntry(idx, 'vendorUrl', e.target.value)} />
                            </div>
                            <div className="kb-vendor-field">
                              <span className="kb-vendor-field-label">Affiliate Link</span>
                              <input type="url" className="kb-vendor-input" placeholder="https://... (optional)" value={entry.affiliateLink} onChange={(e) => updateVendorEntry(idx, 'affiliateLink', e.target.value)} />
                            </div>
                          </div>
                          {/* Right: Pricing */}
                          <div>
                            <div className="kb-vendor-section-label">💰 Pricing</div>
                            <div className="kb-vendor-field">
                              <span className="kb-vendor-field-label">Current Price</span>
                              <div className="kb-vendor-price-wrap">
                                <span className="kb-vendor-price-prefix">₹</span>
                                <input
                                  type="number"
                                  className={`kb-vendor-price-input ${existing?.scrapeStatus === 'SUCCESS' ? 'scraped' : 'manual'}`}
                                  placeholder="0"
                                  step="0.01"
                                  value={entry.price || ''}
                                  onChange={(e) => { updateVendorEntry(idx, 'price', parseFloat(e.target.value) || 0); markChange(); }}
                                />
                              </div>
                            </div>
                            <div className="kb-vendor-field">
                              <span className="kb-vendor-field-label">🚚 Shipping Type</span>
                              <div className="pe-ship-group">
                                <button type="button" className={`pe-ship-btn ${entry.shippingIncluded ? 'active' : ''}`} onClick={() => { updateVendorEntry(idx, 'shippingIncluded', true); updateVendorEntry(idx, 'shippingCost', 0); }}>
                                  {entry.shippingIncluded && <span className="pe-ship-check">✓</span>}
                                  FREE SHIPPING
                                </button>
                                <button type="button" className={`pe-ship-btn ${!entry.shippingIncluded ? 'active' : ''}`} onClick={() => updateVendorEntry(idx, 'shippingIncluded', false)}>
                                  {!entry.shippingIncluded && <span className="pe-ship-check">✓</span>}
                                  PAID SHIPPING
                                </button>
                              </div>
                            </div>
                            <div className={`pe-ship-cost-wrap ${!entry.shippingIncluded ? 'open' : ''}`}>
                              <div className="kb-vendor-field">
                                <span className="kb-vendor-field-label">Shipping Cost</span>
                                <div className="pe-input-wrap">
                                  <span className="pe-input-prefix">₹</span>
                                  <input type="number" className="pe-input pe-input--prefixed kb-vendor-input" placeholder="0" step="1" min="0" required={!entry.shippingIncluded} value={entry.shippingCost || ''} onChange={(e) => updateVendorEntry(idx, 'shippingCost', parseFloat(e.target.value) || 0)} />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Section: Coupons */}
                      <div className="kb-vendor-section">
                        <div className="kb-vendor-section-label">🏷️ Coupons</div>
                        <div className="pe-coupon-header">
                          <button type="button" className="pe-coupon-add-btn" onClick={() => addVendorCoupon(idx)}>+ Add Coupon</button>
                        </div>
                        {entry.coupons.length === 0 ? (
                          <div className="pe-coupon-empty">No coupons — click "+ Add Coupon" to create one</div>
                        ) : (
                          entry.coupons.map((coupon, cIdx) => (
                            <div key={cIdx} className={`pe-coupon-card ${coupon.collapsed ? 'collapsed' : ''}`}>
                              <div className="pe-coupon-card-header" onClick={() => toggleVendorCouponCollapsed(idx, cIdx)}>
                                <div className="pe-coupon-card-title">
                                  <span className="pe-coupon-chevron">{coupon.collapsed ? '▸' : '▾'}</span>
                                  <span className="pe-coupon-card-code">{coupon.code || 'Untitled Coupon'}</span>
                                  <span className={`pe-coupon-type-badge ${coupon.discountType}`}>
                                    {coupon.discountType === 'percentage' ? `${coupon.discountValue}% OFF` : coupon.discountType === 'flat' ? `₹${coupon.discountValue} OFF` : 'FREE SHIPPING'}
                                  </span>
                                  {!coupon.enabled && <span className="pe-coupon-disabled-badge">DISABLED</span>}
                                </div>
                                <button type="button" className="pe-coupon-remove-btn" onClick={(e) => { e.stopPropagation(); removeVendorCoupon(idx, cIdx); }}>Remove</button>
                              </div>
                              <div className="pe-coupon-card-body">
                                <div className="pe-row-2">
                                  <div className="pe-field">
                                    <label className="pe-label">Coupon Code *</label>
                                    <input type="text" className="pe-input" placeholder="e.g. SAVE10" value={coupon.code} onChange={(e) => updateVendorCoupon(idx, cIdx, 'code', e.target.value)} />
                                  </div>
                                  <div className="pe-field">
                                    <label className="pe-label">Discount Type</label>
                                    <div className="pe-avail-group">
                                      {(['percentage', 'flat', 'free_shipping'] as const).map((opt) => (
                                        <button key={opt} type="button" className={`pe-avail-btn ${coupon.discountType === opt ? 'active' : ''}`} onClick={() => updateVendorCoupon(idx, cIdx, 'discountType', opt)}>
                                          {opt === 'percentage' ? '%' : opt === 'flat' ? '₹' : '🚚'} {opt === 'free_shipping' ? 'Free Ship.' : opt === 'percentage' ? 'Percentage' : 'Flat Amount'}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                                {coupon.discountType !== 'free_shipping' && (
                                  <div className="pe-field pe-field--full">
                                    <label className="pe-label">Discount Value *</label>
                                    <div className="pe-input-wrap">
                                      <span className="pe-input-prefix">{coupon.discountType === 'flat' ? '₹' : '%'}</span>
                                      <input type="number" className="pe-input pe-input--prefixed" placeholder="0" step="1" min="0" value={coupon.discountValue || ''} onChange={(e) => updateVendorCoupon(idx, cIdx, 'discountValue', parseFloat(e.target.value) || 0)} />
                                    </div>
                                  </div>
                                )}
                                <div className="pe-row-2">
                                  <div className="pe-field">
                                    <label className="pe-label">Minimum Order Amount (optional)</label>
                                    <div className="pe-input-wrap">
                                      <span className="pe-input-prefix">₹</span>
                                      <input type="number" className="pe-input pe-input--prefixed" placeholder="0" step="1" min="0" value={coupon.minimumOrderAmount || ''} onChange={(e) => updateVendorCoupon(idx, cIdx, 'minimumOrderAmount', parseFloat(e.target.value) || 0)} />
                                    </div>
                                  </div>
                                  <div className="pe-field">
                                    <label className="pe-label">Expiry Date (optional)</label>
                                    <input type="date" className="pe-input" value={coupon.expiryDate} onChange={(e) => updateVendorCoupon(idx, cIdx, 'expiryDate', e.target.value)} />
                                  </div>
                                </div>
                                <div className="pe-field pe-field--full">
                                  <label className="pe-label">Coupon URL (optional)</label>
                                  <input type="url" className="pe-input" placeholder="https://... (link to promotion)" value={coupon.couponUrl} onChange={(e) => updateVendorCoupon(idx, cIdx, 'couponUrl', e.target.value)} />
                                </div>
                                <div className="pe-field pe-field--full">
                                  <label className="pe-label">Description / Notes (optional)</label>
                                  <input type="text" className="pe-input" placeholder="e.g. 10% off on orders above ₹999" value={coupon.description} onChange={(e) => updateVendorCoupon(idx, cIdx, 'description', e.target.value)} />
                                </div>
                                <div className="pe-coupon-enabled-row">
                                  <span className="pe-coupon-enabled-label">Enabled</span>
                                  <button type="button" className={`pe-coupon-toggle ${coupon.enabled ? 'on' : ''}`} onClick={() => updateVendorCoupon(idx, cIdx, 'enabled', !coupon.enabled)}>
                                    <span className="pe-coupon-toggle-thumb" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Section: Availability */}
                      <div className="kb-vendor-section">
                        <div className="kb-vendor-section-label">📦 Availability</div>
                        <div className="kb-avail-group">
                          {(['in_stock', 'preorder', 'group_buy', 'coming_soon', 'out_of_stock'] as const).map((opt) => (
                            <button
                              key={opt}
                              type="button"
                              className={`kb-avail-btn ${entry.stockStatus === opt ? 'active' : ''}`}
                              onClick={() => updateVendorEntry(idx, 'stockStatus', opt)}
                            >
                              {opt === 'in_stock' ? 'In Stock' : opt === 'preorder' ? 'Pre-Order' : opt === 'group_buy' ? 'Group Buy' : opt === 'coming_soon' ? 'Coming Soon' : 'Out of Stock'}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Section: Scraper Health */}
                      <div className="kb-vendor-section">
                        <div className="kb-vendor-section-label">🤖 Scraper Health</div>
                        {existing ? (
                          <div className="kb-vendor-scraper-grid">
                            <div className="kb-vendor-status">
                              <span className={`kb-vendor-status-dot ${scrapeStatusClass}`} />
                              <span className={`kb-vendor-status-text ${scrapeStatusClass}`}>{scrapeStatusLabel}</span>
                            </div>
                            {existing.scraperVersion && (
                              <>
                                <span className="kb-vendor-scraper-label">Version</span>
                                <span className="kb-vendor-scraper-value">v{existing.scraperVersion}</span>
                              </>
                            )}
                            {existing.lastHttpStatus && (
                              <>
                                <span className="kb-vendor-scraper-label">HTTP</span>
                                <span className="kb-vendor-scraper-value">{existing.lastHttpStatus}</span>
                              </>
                            )}
                            {existing.lastChecked && (
                              <>
                                <span className="kb-vendor-scraper-label">Checked</span>
                                <span className="kb-vendor-scraper-value">{new Date(existing.lastChecked).toLocaleString()}</span>
                              </>
                            )}
                            {existing.lastManualUpdate && (
                              <>
                                <span className="kb-vendor-scraper-label">Manual Edit</span>
                                <span className="kb-vendor-scraper-value">{new Date(existing.lastManualUpdate).toLocaleString()}</span>
                              </>
                            )}
                          </div>
                        ) : (
                          <div className="kb-vendor-new-hint">New vendor — save to start tracking</div>
                        )}
                      </div>

                      {/* Check result banner */}
                      {vendorCheckResult[idx] && (
                        <div className={`kb-vendor-check-result ${vendorCheckResult[idx]!.ok ? 'ok' : 'err'}`}>
                          <span>{vendorCheckResult[idx]!.message}</span>
                          {vendorCheckResult[idx]!.scrapedPrice != null && (
                            <span>Scraped: ₹{vendorCheckResult[idx]!.scrapedPrice.toLocaleString()} ({vendorCheckResult[idx]!.scrapedAvailability || 'unknown'})</span>
                          )}
                          {vendorCheckResult[idx]!.scraperVersion && (
                            <span style={{ color: 'var(--text-dim)', fontSize: '.65rem' }}>v{vendorCheckResult[idx]!.scraperVersion}</span>
                          )}
                        </div>
                      )}

                      {/* Section: Variants */}
                      <div className="kb-vendor-section">
                        <div className="kb-variants-header">
                          <span className="kb-variants-label">Variants</span>
                          <button type="button" className="kb-add-variant" onClick={() => addVariant(idx)}>+ Add Variant</button>
                        </div>
                        {entry.variants.length === 0 ? (
                          <div className="kb-vendor-new-hint">No variants — click "+ Add Variant" to create one</div>
                        ) : (
                          entry.variants.map((variant, vIdx) => (
                            <div key={vIdx} className="kb-variant-card">
                              <div className="kb-variant-header">
                                <span className="kb-variant-num">Variant #{vIdx + 1}{variant.isDefault ? ' (Default)' : ''}</span>
                                <button type="button" className="kb-variant-remove" onClick={() => removeVariant(idx, vIdx)}>Remove</button>
                              </div>
                              <div className="kb-variant-grid">
                                <div className="kb-field">
                                  <label className="kb-field-label">Variant Name</label>
                                  <input type="text" className="kb-vendor-input" placeholder="e.g. Black / Gateron Yellow" value={variant.name} onChange={(e) => updateVariant(idx, vIdx, 'name', e.target.value)} />
                                </div>
                                <div className="kb-field">
                                  <label className="kb-field-label">SKU (optional)</label>
                                  <input type="text" className="kb-vendor-input" placeholder="SKU" value={variant.sku} onChange={(e) => updateVariant(idx, vIdx, 'sku', e.target.value)} />
                                </div>
                                <TagInput label="Color" value={variant.color} onChange={(v) => updateVariant(idx, vIdx, 'color', v)} placeholder="+ Add Color" />
                                <TagInput label="Switches" value={variant.switches} onChange={(v) => updateVariant(idx, vIdx, 'switches', v)} placeholder="+ Add Switch" />
                                <TagInput label="Keycaps" value={variant.keycaps} onChange={(v) => updateVariant(idx, vIdx, 'keycaps', v)} placeholder="+ Add Keycap" />
                              </div>
                              <div className="kb-variant-price-row">
                                <div className="kb-field">
                                  <label className="kb-field-label">💰 Price</label>
                                  <div className="kb-vendor-price-wrap">
                                    <span className="kb-vendor-price-prefix">₹</span>
                                    <input type="number" className="kb-vendor-price-input" placeholder="0" step="0.01" value={variant.price || ''} onChange={(e) => updateVariant(idx, vIdx, 'price', parseFloat(e.target.value) || 0)} />
                                  </div>
                                </div>
                                <div className="kb-field">
                                  <label className="kb-field-label">📦 Availability</label>
                                  <div className="kb-avail-group">
                                    {(['in_stock', 'preorder', 'out_of_stock'] as const).map((opt) => (
                                      <button key={opt} type="button" className={`kb-avail-btn ${variant.stockStatus === opt ? 'active' : ''}`} onClick={() => updateVariant(idx, vIdx, 'stockStatus', opt)}>
                                        {opt === 'in_stock' ? 'In Stock' : opt === 'preorder' ? 'Pre-Order' : 'Out of Stock'}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                                <div className="kb-field">
                                  <label className="kb-field-label">🌐 Variant URL</label>
                                  <input type="url" className="kb-vendor-input" placeholder="https://... (falls back to main URL)" value={variant.variantUrl} onChange={(e) => updateVariant(idx, vIdx, 'variantUrl', e.target.value)} />
                                </div>
                              </div>
                              <div className="kb-variant-default-toggle">
                                <label>
                                  <input type="checkbox" checked={variant.isDefault} onChange={(e) => updateVariant(idx, vIdx, 'isDefault', e.target.checked)} />
                                  Default variant
                                </label>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Section: Actions */}
                      <div className="kb-vendor-section">
                        <div className="kb-vendor-actions">
                          {entry.id ? (
                            <>
                              <button type="button" className="btn-secondary btn-sm" disabled={vendorChecking[idx]} onClick={() => handleCheckNow(idx)}>
                                {vendorChecking[idx] ? 'Checking...' : 'CHECK NOW'}
                              </button>
                              <button type="button" className="btn-primary btn-sm" disabled={vendorScraping[idx]} onClick={() => handleScrapeNow(idx)}>
                                {vendorScraping[idx] ? 'Scraping...' : 'SCRAPE'}
                              </button>
                              <button type="button" className="btn-primary btn-sm" disabled={vendorUpdating[idx]} onClick={() => handleUpdateStatus(idx)}>
                                {vendorUpdating[idx] ? 'Updating...' : 'UPDATE'}
                              </button>
                              {existing?.manualOverride && (
                                <button type="button" className="btn-secondary btn-sm" disabled={vendorClearing[idx]} onClick={() => handleClearOverride(idx)}>
                                  {vendorClearing[idx] ? 'Clearing...' : 'CLEAR OVERRIDE'}
                                </button>
                              )}
                            </>
                          ) : (
                            <div className="kb-vendor-new-hint">Save to enable actions</div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <button type="button" className="kb-add-vendor" onClick={addVendorEntry}>+ Add Vendor</button>
              </div>
            </section>
          </form>
        </main>
      </div>

      {/* ── Sticky Save Bar ── */}
      <div className={`kb-save-bar ${hasChanges ? 'visible' : ''}`}>
        <div className="kb-save-bar-inner">
          <div className="kb-save-bar-label">
            <span className="kb-save-bar-dot" />
            Unsaved Changes
          </div>
          <div className="kb-save-bar-actions">
            <button type="button" onClick={() => { setHasChanges(false); window.location.reload(); }} className="btn-secondary">Cancel</button>
            <button type="submit" form="kb-form" disabled={pending} className="btn-primary">
              {pending ? 'Saving...' : isEdit ? 'Save Keyboard' : 'Create Keyboard'}
            </button>
          </div>
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4">
          <div className="neo-card max-w-sm w-full p-6">
            <h3 className="font-[family-name:var(--f-m)] text-sm font-bold uppercase tracking-[.12em] text-[var(--accent)] mb-4">Confirm Deletion</h3>
            <p className="text-sm text-[var(--text-dim)] mb-4">
              This will permanently delete <strong className="text-[var(--text)]">{product?.name}</strong>. Enter password to confirm.
            </p>
            <input type="password" placeholder="Enter password" value={deletePassword} onChange={(e) => { setDeletePassword(e.target.value); setDeleteError(null); }} onKeyDown={(e) => { if (e.key === 'Enter') handleDelete(); }} className="kb-input w-full mb-1" autoFocus />
            {deleteError && <p className="text-xs text-red-400 mb-3">{deleteError}</p>}
            <div className="flex gap-3 mt-4">
              <button onClick={handleDelete} disabled={!deletePassword || deleting} className="btn-danger flex-1">{deleting ? 'Deleting...' : 'Delete'}</button>
              <button onClick={() => { setShowDeleteModal(false); setDeletePassword(''); setDeleteError(null); }} className="btn-secondary flex-1">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
