# KEYDIR — Specification Engine

> **Version:** 1.0
> **Last Updated:** 2026-07-14

---

## 1. Overview

The specification engine uses a dynamic EAV (Entity-Attribute-Value) pattern to define, store, render, filter, and compare product specifications. Admin-defined `SpecField` definitions drive everything — no hardcoded filter logic, no hardcoded form rendering, no hardcoded spec display.

**One system, four categories, zero manual coding per category.**

### Current vs New

| Aspect | Current (v1) | New (v2) |
|--------|-------------|----------|
| SpecField definition | `type` (text/number/boolean/select) + JSON `options` | `inputType` (8 types) + `SpecOption` model + `filterable`/`searchable`/`comparable` flags |
| Select options | JSON string in `options` field | Proper `SpecOption` rows with ordering and enable/disable |
| Multi-select | Not supported | Native `multi_select` input type |
| Filter generation | Hardcoded per category in frontend | Auto-generated from `filterable: true` fields |
| Product form | Only shows specs on edit, not creation | Dynamic form from `SpecField` definitions, always available |
| Search integration | Partial (name only) | `searchable: true` fields included in search queries |
| Comparison | Not implemented | `comparable: true` fields available for side-by-side comparison |
| Admin management | No UI to manage spec definitions | Specification Manager in admin panel |

---

## 2. Schema

### 2.1 SpecField

Defines what specification fields exist for a category.

```prisma
model SpecField {
  id              String    @id @default(cuid())
  name            String                    // Display name (e.g. "Layout")
  slug            String    @unique         // URL-safe (e.g. "layout")
  categoryId      String                    // FK → Category
  group           String    @default("General")  // Display grouping
  groupOrder      Int       @default(0)    // Order of the group itself
  inputType       String    @default("text")  // Input type (see below)
  required        Boolean   @default(false)
  filterable      Boolean   @default(false)    // Generates a filter control
  searchable      Boolean   @default(false)    // Included in search
  comparable      Boolean   @default(false)    // Available in comparison
  order           Int       @default(0)        // Order within group
  defaultValue    String?                      // Pre-filled value for new products
  validationRules String?                      // JSON: { min, max, pattern, ... }
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  specs      Specification[]
  options    SpecOption[]

  @@index([categoryId])
  @@index([categoryId, group])
  @@index([categoryId, filterable])
}
```

### 2.2 SpecOption

Selectable options for `select` and `multi_select` fields.

```prisma
model SpecOption {
  id          String    @id @default(cuid())
  specFieldId String
  label       String                    // Display label (e.g. "USB-C")
  value       String                    // Stored value (e.g. "usb_c")
  order       Int       @default(0)    // Display order
  enabled     Boolean   @default(true)  // Can be disabled without deleting
  createdAt   DateTime  @default(now())

  specField   SpecField @relation(fields: [specFieldId], references: [id], onDelete: Cascade)

  @@unique([specFieldId, value])
  @@index([specFieldId])
}
```

### 2.3 Specification

Actual values for a product (EAV value store).

```prisma
model Specification {
  id          String    @id @default(cuid())
  productId   String
  specFieldId String
  value       String                  // For multi_select: comma-separated values

  product   Product   @relation(fields: [productId], references: [id], onDelete: Cascade)
  specField SpecField @relation(fields: [specFieldId], references: [id])

  @@unique([productId, specFieldId])
  @@index([productId])
  @@index([specFieldId])
}
```

---

## 3. Input Types

| InputType | Form Control | Storage Format | Filter Control | Example |
|-----------|-------------|----------------|----------------|---------|
| `text` | Text input | Plain string | Text search or checkbox list (from existing values) | Product name, USB type |
| `number` | Number input | Numeric string | Range slider (min/max) | Operating force, weight |
| `boolean` | Toggle / Yes-No | `"true"` / `"false"` | Checkbox (Yes/No/Any) | Hot-swappable, wireless |
| `select` | Dropdown / radio | Single stored value | Checkbox group (from SpecOption) | Layout, switch type |
| `multi_select` | Checkbox group | Comma-separated values | Checkbox group (from SpecOption) | Connectivity, sound tags |
| `rich_text` | Textarea | Plain string | Text search | Description, notes |
| `url` | URL input | URL string | N/A (not filterable) | Product page, review link |
| `date` | Date picker | ISO date string | Range (from/to) | Release date, group buy end |

---

## 4. How It Flows

### 4.1 Admin Creates SpecField

1. Admin navigates to Specification Manager (`/admin/specs`)
2. Selects a category (e.g. "Keyboards")
3. Clicks "Add Field"
4. Fills: name, group, inputType, required, filterable, searchable, comparable, order
5. If `select` or `multi_select`: adds options (label + value pairs)
6. Saves → `SpecField` + `SpecOption` rows created

### 4.2 Admin Creates/Edits Product

1. Admin navigates to `/admin/products/new` or `/admin/products/[id]`
2. Selects a category → product form loads that category's `SpecField` definitions
3. Form renders dynamically:
   - `text` → `<input type="text">`
   - `number` → `<input type="number">`
   - `boolean` → Yes/No radio or toggle
   - `select` → Dropdown populated from `SpecOption` rows
   - `multi_select` → Checkbox group from `SpecOption` rows
   - `rich_text` → `<textarea>`
   - `url` → `<input type="url">`
   - `date` → `<input type="date">`
4. On save: each non-empty spec value → `Specification` row (upsert by `[productId, specFieldId]`)

### 4.3 Product Page Renders Specs

1. `src/app/products/[slug]/page.tsx` fetches product with `specifications` + `specField`
2. Groups specs by `specField.group` (ordered by `groupOrder`)
3. Within each group, sorts by `specField.order`
4. Renders via `SpecTable` component:
   - `boolean` → "Yes" / "No" badge
   - `select` → Displays the label (not the stored value)
   - `multi_select` → Displays all selected values as badges
   - `url` → Renders as clickable link
   - Other types → Plain text

### 4.4 Filters Auto-Generate

1. Category page loads (e.g. `/keyboards`)
2. Fetches `SpecField` rows where `categoryId = <keyboards>` AND `filterable = true`
3. For each filterable field, fetches distinct values from `Specification`:
   - `select` / `multi_select` → checkbox group from `SpecOption` labels
   - `boolean` → Yes/No/Any toggle
   - `number` → min/max range from actual values
   - `text` → checkbox group from distinct existing values
4. Filter modal renders dynamically — no hardcoded filter components
5. User selects filters → API route builds Prisma `WHERE` clauses from field definitions

### 4.5 Search Includes Specs

1. User types in search bar
2. API route checks `SpecField` rows where `searchable = true` for the relevant category
3. Builds `OR` clause: `name LIKE %q%` OR `specifications WHERE specField.slug IN (searchable_slugs) AND value LIKE %q%`
4. Returns matching products across all categories

### 4.6 Comparison Uses Comparable Fields

1. User selects products to compare
2. System fetches `SpecField` rows where `comparable = true`
3. For each comparable field, fetches values for all selected products
4. Renders side-by-side comparison table
5. Highlights differences between products

---

## 5. Category Templates

Each category gets a predefined set of `SpecField` definitions seeded via `prisma/seed.ts`. Admins can modify, add, or remove fields after seeding.

### 5.1 Keyboards

| Group | Field Name | Slug | InputType | Filterable | Searchable | Comparable | Options |
|-------|-----------|------|-----------|------------|------------|------------|---------|
| **General** | Layout | `layout` | select | Yes | Yes | Yes | 60%, 65%, 75%, TKL, Full, 40%, 50%, Alice, Southpaw, Numpad |
| **General** | Keyboard Type | `keyboard_type` | select | Yes | Yes | Yes | Pre-built, Custom, Kit, Barebones |
| **General** | Connectivity | `connectivity` | multi_select | Yes | Yes | Yes | Wired, Wireless (2.4GHz), Bluetooth, USB-C, Micro-USB |
| **General** | Hot-swappable | `hot_swappable` | boolean | Yes | Yes | Yes | — |
| **General** | RGB | `rgb` | boolean | Yes | No | No | — |
| **Build** | Case Material | `case_material` | select | Yes | Yes | Yes | Plastic (ABS), Plastic (PBT), Aluminum, Wood, Acrylic, Polycarbonate |
| **Build** | Plate Material | `plate_material` | select | Yes | Yes | Yes | Steel, Aluminum, Brass, Polycarbonate, POM, FR4 |
| **Build** | Weight | `weight` | number | Yes | No | Yes | — |
| **Build** | Dimensions | `dimensions` | text | No | No | No | — |
| **PCB** | PCB Type | `pcb_type` | select | Yes | Yes | Yes | Standard, North-facing, South-facing, Hot-swap |
| **PCB** | Mount Type | `mount_type` | select | Yes | Yes | Yes | Tray, Top, Bottom, Gasket, Sandwich, O-ring |
| **PCB** | Key Rollover | `key_rollover` | select | Yes | No | No | NKRO, 6KRO |
| **PCB** | Firmware | `firmware` | select | Yes | No | No | QMK, VIA, VIAL, proprietary, other |
| **Extras** | Knob | `knob` | boolean | Yes | No | No | — |
| **Extras** | Screen | `screen` | boolean | Yes | No | No | — |
| **Extras** | Dampening | `dampening` | multi_select | Yes | No | No | Foam, Silicone, Tape, None |
| **Extras** | Stabilizers | `stabilizers` | select | Yes | No | No | Plate-mount, PCB-mount, Screw-in, None |
| **Extras** | Layout Standard | `layout_standard` | text | No | No | No | — |
| **Extras** | LED Type | `led_type` | select | Yes | No | No | SMD, Through-hole, Per-key, Underglow |
| **Extras** | Software | `software` | text | No | No | No | — |
| **Extras** | Included Accessories | `included_accessories` | rich_text | No | No | No | — |
| **Extras** | Features | `features` | rich_text | No | No | No | — |
| **Extras** | Compatibility | `compatibility` | multi_select | Yes | No | Yes | Windows, macOS, Linux, iOS, Android |
| **Extras** | Release Date | `release_date` | date | Yes | No | No | — |
| **Extras** | Group Buy Status | `group_buy_status` | select | Yes | No | No | None, Active, Upcoming, Ended |
| **Extras** | Group Buy End Date | `group_buy_end_date` | date | No | No | No | — |
| **Extras** | Vendor Product URL | `vendor_product_url` | url | No | No | No | — |
| **Extras** | Review URL | `review_url` | url | No | No | No | — |
| **Extras** | Additional Notes | `additional_notes` | rich_text | No | No | No | — |

### 5.2 Switches

| Group | Field Name | Slug | InputType | Filterable | Searchable | Comparable | Options |
|-------|-----------|------|-----------|------------|------------|------------|---------|
| **General** | Switch Type | `switch_type` | select | Yes | Yes | Yes | Linear, Tactile, Clicky, Silent Linear, Silent Tactile |
| **General** | Manufacturer | `manufacturer` | select | Yes | Yes | Yes | Gateron, Cherry, Kailh, TTC, Akko, Durock, JWICK, SP-Star, BSUN, Tecsee, JWK, Hippo |
| **General** | Factory Lubed | `factory_lubed` | boolean | Yes | Yes | Yes | — |
| **General** | Stem Material | `stem_material` | select | Yes | Yes | Yes | POM, UHMWPE, Nylon, Polycarbonate, Other |
| **General** | Housing Material | `housing_material` | select | Yes | Yes | Yes | Nylon, Polycarbonate, UHMWPE, Mixed, Other |
| **General** | Stem Color | `stem_color` | text | No | No | No | — |
| **General** | Housing Color | `housing_color` | text | No | No | No | — |
| **Force** | Operating Force (g) | `operating_force` | number | Yes | No | Yes | — |
| **Force** | Bottom-out Force (g) | `bottom_out_force` | number | Yes | No | Yes | — |
| **Force** | Spring Type | `spring_type` | select | Yes | No | No | Standard, Double-stage, Triple-stage, Long, Slow |
| **Force** | Spring Material | `spring_material` | select | Yes | No | No | Stainless Steel, Gold-plated, Other |
| **Travel** | Pre-travel (mm) | `pre_travel` | number | Yes | No | Yes | — |
| **Travel** | Total Travel (mm) | `total_travel` | number | Yes | No | Yes | — |
| **Feel** | Smoothness | `smoothness` | select | Yes | No | No | Very Smooth, Smooth, Moderate, Scratchy |
| **Feel** | Sound Profile | `sound_profile` | multi_select | Yes | Yes | No | Thocky, Clacky, Creamy, Poppy, Deep, High-pitched, Muted |
| **Feel** | Stem Wobble | `stem_wobble` | select | Yes | No | No | Minimal, Low, Moderate, High |
| **Feel** | Bump Intensity | `bump_intensity` | select | Yes | No | No | None (Linear), Light, Medium, Strong, Sharp |
| **Feel** | Click Mechanism | `click_mechanism` | select | Yes | No | No | None, Click Jacket, Click Bar, Click Leaf |
| **Feel** | Pre-lube Notes | `pre_lube_notes` | rich_text | No | No | No | — |
| **Use Case** | Best For | `best_for` | multi_select | Yes | Yes | No | Gaming, Typing, Programming, Office, General |
| **Use Case** | Skill Level | `skill_level` | select | Yes | No | No | Beginner, Intermediate, Enthusiast |
| **Extras** | Pins | `pins` | select | Yes | No | No | 3-pin, 5-pin |
| **Extras** | LED Compatibility | `led_compatibility` | select | Yes | No | No | SMD, Through-hole, Both |
| **Extras** | Available in Packs | `available_in_packs` | boolean | Yes | No | No | — |
| **Extras** | Compatible Keyboards | `compatible_keyboards` | rich_text | No | No | No | — |
| **Extras** | Modding Potential | `modding_potential` | select | Yes | No | No | Low, Medium, High |
| **Extras** | Release Date | `release_date` | date | Yes | No | No | — |
| **Extras** | Switch URL | `switch_url` | url | No | No | No | — |
| **Extras** | Review URL | `review_url` | url | No | No | No | — |
| **Extras** | Additional Notes | `additional_notes` | rich_text | No | No | No | — |

### 5.3 Keycaps

| Group | Field Name | Slug | InputType | Filterable | Searchable | Comparable | Options |
|-------|-----------|------|-----------|------------|------------|------------|---------|
| **General** | Profile | `keycap_profile` | select | Yes | Yes | Yes | Cherry, OEM, SA, DSA, MT3, XDA, KAT, KAM, MDA, Other |
| **General** | Material | `keycap_material` | select | Yes | Yes | Yes | PBT, ABS, POM, Other |
| **General** | Manufacture Method | `keycap_manufacture_method` | select | Yes | Yes | Yes | Double-shot, Dye-sub, Reverse Dye-sub, Laser-engraved, Other |
| **General** | Language/Layout | `keycap_language` | select | Yes | Yes | Yes | English (ANSI), English (ISO), English (UK), Hindi, Japanese, Korean, Other |
| **General** | Key Count | `keycap_key_count` | number | Yes | No | Yes | — |
| **General** | Keycap Sets | `keycap_sets` | multi_select | Yes | No | No | Base Kit, Mods, Numpad, Spacebars, Novelties, International, Child Kits |
| **Build** | Thickness | `keycap_thickness` | number | Yes | No | Yes | — |
| **Build** | Texture | `keycap_texture` | select | Yes | No | No | Smooth, Textured, Matte, Glossy |
| **Build** | Shine Resistance | `shine_resistance` | select | Yes | No | No | High, Medium, Low |
| **Build** | Color Scheme | `keycap_color_scheme` | text | No | No | No | — |
| **Build** | Legends | `keycap_legends` | text | No | No | No | — |
| **Build** | Font Style | `keycap_font_style` | select | Yes | No | No | Standard, Bold, Thin, Custom |
| **Build** | Compatibility | `keycap_compatibility` | multi_select | Yes | No | Yes | Standard ANSI, ISO, Alice, Ortholinear, 40%, Numpad |
| **Extras** | Designer | `keycap_designer` | text | No | Yes | No | — |
| **Extras** | Manufacturer | `keycap_manufacturer` | select | Yes | Yes | Yes | GMK, ePBT, KBDfans, Drop, AKKO, Keychron, Other |
| **Extras** | Group Buy Status | `keycap_group_buy_status` | select | Yes | No | No | None, Active, Upcoming, Ended |
| **Extras** | Release Date | `keycap_release_date` | date | Yes | No | No | — |
| **Extras** | Keycap URL | `keycap_url` | url | No | No | No | — |
| **Extras** | Review URL | `keycap_review_url` | url | No | No | No | — |
| **Extras** | Additional Notes | `keycap_additional_notes` | rich_text | No | No | No | — |

### 5.4 Mouse

| Group | Field Name | Slug | InputType | Filterable | Searchable | Comparable | Options |
|-------|-----------|------|-----------|------------|------------|------------|---------|
| **General** | Mouse Type | `mouse_type` | select | Yes | Yes | Yes | Gaming, Productivity, Trackball, Ergonomic, Travel |
| **General** | Connectivity | `mouse_connectivity` | multi_select | Yes | Yes | Yes | Wired, Wireless (2.4GHz), Bluetooth, USB-C |
| **General** | Color | `mouse_color` | text | No | No | No | — |
| **General** | Weight | `mouse_weight` | number | Yes | No | Yes | — |
| **General** | Shape | `mouse_shape` | select | Yes | Yes | Yes | Ambidextrous, Right-handed, Ergonomic, Trackball |
| **General** | Grip Style | `mouse_grip_style` | multi_select | Yes | Yes | No | Palm, Claw, Fingertip, Hybrid |
| **Sensor** | Sensor Type | `mouse_sensor_type` | select | Yes | Yes | Yes | Optical, Laser |
| **Sensor** | DPI | `mouse_dpi` | number | Yes | No | Yes | — |
| **Sensor** | Polling Rate | `mouse_polling_rate` | select | Yes | No | Yes | 125Hz, 250Hz, 500Hz, 1000Hz, 2000Hz, 4000Hz, 8000Hz |
| **Sensor** | IPS | `mouse_ips` | number | Yes | No | Yes | — |
| **Sensor** | Acceleration | `mouse_acceleration` | number | Yes | No | Yes | — |
| **Buttons** | Button Count | `mouse_button_count` | number | Yes | No | No | — |
| **Buttons** | Programmable Buttons | `mouse_programmable_buttons` | number | Yes | No | No | — |
| **Buttons** | Wheel Type | `mouse_wheel_type` | select | Yes | No | No | Scroll, Tilt, Free-spin, None |
| **Buttons** | Switch Type | `mouse_switch_type` | select | Yes | No | No | Mechanical, Optical, Hybrid |
| **Buttons** | Switch Rating | `mouse_switch_rating` | text | No | No | No | — |
| **Build** | Cable | `mouse_cable` | select | Yes | No | No | Braided, Rubber, USB-C detachable, None (wireless only) |
| **Build** | Feet | `mouse_feet` | select | Yes | No | No | PTFE, Ceramic, Glass, Other |
| **Build** | Lighting | `mouse_lighting` | select | Yes | No | No | RGB, Single-color, None |
| **Build** | Memory | `mouse_memory` | boolean | Yes | No | No | — |
| **Extras** | Software | `mouse_software` | text | No | No | No | — |
| **Extras** | Compatible Platforms | `mouse_compatible_platforms` | multi_select | Yes | No | Yes | Windows, macOS, Linux |
| **Extras** | Release Date | `mouse_release_date` | date | Yes | No | No | — |
| **Extras** | Mouse URL | `mouse_url` | url | No | No | No | — |
| **Extras** | Review URL | `mouse_review_url` | url | No | No | No | — |
| **Extras** | Additional Notes | `mouse_additional_notes` | rich_text | No | No | No | — |

---

## 6. Server Actions

### 6.1 SpecField Management

```typescript
// Create a new spec field with options
createSpecField(data: {
  name: string
  slug: string
  categoryId: string
  group?: string
  groupOrder?: number
  inputType: string
  required?: boolean
  filterable?: boolean
  searchable?: boolean
  comparable?: boolean
  order?: number
  defaultValue?: string
  validationRules?: string
  options?: { label: string; value: string; order?: number }[]
})

// Update a spec field
updateSpecField(id: string, data: Partial<SpecFieldInput>)

// Delete a spec field (cascades to SpecOption and Specification)
deleteSpecField(id: string)

// Reorder spec fields within a category
reorderSpecFields(fieldIds: string[])
```

### 6.2 SpecOption Management

```typescript
// Add an option to a spec field
addSpecOption(specFieldId: string, data: { label: string; value: string; order?: number })

// Update an option
updateSpecOption(id: string, data: { label?: string; value?: string; enabled?: boolean })

// Delete an option
deleteSpecOption(id: string)
```

### 6.3 Product Specs

```typescript
// Upsert specs for a product (used during product create/edit)
upsertSpecifications(productId: string, specs: {
  specFieldId: string
  value: string
}[])

// Get all spec fields for a category (for form rendering)
getSpecFieldsForCategory(categoryId: string): Promise<SpecFieldWithOptions[]>

// Get spec fields with filterable flag (for filter generation)
getFilterableSpecFields(categoryId: string): Promise<SpecFieldWithOption[]>
```

### 6.4 Template Seeding

```typescript
// Load a category template (creates all SpecField + SpecOption rows)
loadCategoryTemplate(categoryId: string, template: 'keyboards' | 'switches' | 'keycaps' | 'mouse')

// Export current spec definitions as JSON (for backup/migration)
exportCategorySpecs(categoryId: string): Promise<CategorySpecExport>

// Import spec definitions from JSON
importCategorySpecs(categoryId: string, data: CategorySpecExport)
```

---

## 7. API Routes

### 7.1 Dynamic Filters

```
GET /api/products/filters?category=keyboards
```

Returns filter options generated from `SpecField` definitions:

```json
{
  "filters": [
    {
      "field": "layout",
      "name": "Layout",
      "type": "select",
      "options": [
        { "value": "65%", "label": "65%", "count": 12 },
        { "value": "75%", "label": "75%", "count": 8 }
      ]
    },
    {
      "field": "hot_swappable",
      "name": "Hot-swappable",
      "type": "boolean",
      "options": [
        { "value": "true", "label": "Yes", "count": 15 },
        { "value": "false", "label": "No", "count": 20 }
      ]
    },
    {
      "field": "weight",
      "name": "Weight",
      "type": "number",
      "min": 300,
      "max": 2500
    }
  ]
}
```

### 7.2 Filtered Products

```
GET /api/products?category=keyboards&layout=75%25&hot_swappable=true&sort=lowest
```

Server builds Prisma `WHERE` from query params using `SpecField` definitions to determine filter type.

---

## 8. Filter Modal (Dynamic)

The filter modal is a single component that renders based on field definitions:

```tsx
// Pseudocode
for (const field of filterableFields) {
  switch (field.inputType) {
    case 'select':
      renderCheckboxGroup(field.options)
    case 'multi_select':
      renderCheckboxGroup(field.options)
    case 'boolean':
      renderTriState(Yes/No/Any)
    case 'number':
      renderRangeSlider(field.min, field.max)
    case 'text':
      renderCheckboxGroup(distinctValues)
  }
}
```

No more `filter-modal.tsx`, `switch-filter-modal.tsx`, `keycap-filter-modal.tsx`, `mouse-filter-modal.tsx`. One component handles all categories.

---

## 9. Product Form (Dynamic)

The admin product form renders spec inputs dynamically:

```tsx
// Pseudocode
const fields = await getSpecFieldsForCategory(categoryId)
const groups = groupBy(fields, 'group')

for (const [group, groupFields] of groups) {
  renderSectionHeader(group)
  for (const field of groupFields) {
    switch (field.inputType) {
      case 'text':
        renderTextInput(field)
      case 'number':
        renderNumberInput(field)
      case 'boolean':
        renderBooleanToggle(field)
      case 'select':
        renderSelect(field.options)
      case 'multi_select':
        renderCheckboxGroup(field.options)
      case 'rich_text':
        renderTextarea(field)
      case 'url':
        renderUrlInput(field)
      case 'date':
        renderDateInput(field)
    }
  }
}
```

---

## 10. Seed Data

The `prisma/seed.ts` file creates:

1. Categories (Keyboards, Switches, Keycaps, Mouse)
2. `SpecField` rows for each category (using the templates above)
3. `SpecOption` rows for `select` and `multi_select` fields
4. Sample products with `Specification` values

After seeding, admins can modify, add, or remove fields via the Specification Manager.

---

## 11. Migration Strategy

### From v1 to v2

1. Add new columns to `SpecField`: `groupOrder`, `inputType`, `required`, `filterable`, `searchable`, `comparable`, `defaultValue`, `validationRules`, `updatedAt`
2. Migrate `type` → `inputType` (text→text, number→number, boolean→boolean, select→select)
3. Migrate `options` JSON → `SpecOption` rows
4. Create `SpecOption` table
5. Add `@@index([specFieldId])` to `Specification`
6. Remove `SwitchData` and `KeycapData` models (data migrated to EAV)
7. Run seed script to populate new fields for existing categories

### From SwitchData/KeycapData to EAV

Existing `SwitchData` and `KeycapData` rows must be migrated:
- Each column → `Specification` row with the corresponding `SpecField`
- JSON arrays (`soundTags`, `feelTags`, `useTags`) → comma-separated values in `Specification.value`

---

## 12. Deprecations

| Model | Status | Migration |
|-------|--------|-----------|
| `SwitchData` | Deprecated | Data migrated to SpecField/Specification EAV |
| `KeycapData` | Deprecated | Data migrated to SpecField/Specification EAV |
| `SpecField.type` | Deprecated | Replaced by `inputType` |
| `SpecField.options` (JSON) | Deprecated | Replaced by `SpecOption` model |
