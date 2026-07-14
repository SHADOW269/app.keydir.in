# KEYDIR — Database Documentation

> **Version:** 1.0
> **Last Updated:** 2026-07-14
> **Database:** PostgreSQL (via Supabase)
> **ORM:** Prisma 7.8.0 with PrismaPg adapter

---

## 1. Overview

KEYDIR uses a PostgreSQL database managed through Supabase. The schema is defined in `prisma/schema.prisma` and accessed via Prisma ORM. The database follows a relational model with an EAV (Entity-Attribute-Value) pattern for flexible product specifications.

---

## 2. Entity Relationship Diagram

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│   Profile    │     │     Vote      │     │    Product    │
│─────────────│     │──────────────│     │──────────────│
│ id (PK)     │────<│ profileId(FK) │     │ id (PK)     │
│ userId (UQ) │     │ productId(FK) │>────│ name        │
│ username(UQ)│     │ type          │     │ slug (UQ)   │
│ displayName │     │ createdAt     │     │ brandId(FK) │>────┌──────────┐
│ bio         │     │ updatedAt     │     │ categoryId  │>────│ Category  │
│ github      │     └──────────────┘     │ image       │     │──────────│
│ discord     │                          │ description │     │ id (PK)  │
│ reddit      │     ┌──────────────┐     │ createdAt   │     │ name     │
│ monkeytype  │     │  Wishlist     │     │ updatedAt   │     │ slug(UQ) │
│ website     │     │──────────────│     └──────┬──────┘     │ icon     │
│ voteCredits │────<│ profileId(FK) │            │            └──────────┘
│ createdAt   │     │ productId(FK) │>───────────┘
│ updatedAt   │     │ createdAt     │
└──────┬──────┘     └──────────────┘
       │
       │             ┌──────────────┐
       │             │  Collection   │
       │             │──────────────│
       └────────────<│ profileId(FK) │
                     │ productId(FK) │>──── (to Product)
                     │ createdAt     │
                     └──────────────┘

┌──────────────┐     ┌──────────────────┐
│    Brand      │     │     Vendor        │
│──────────────│     │──────────────────│
│ id (PK)      │     │ id (PK)          │
│ name         │     │ name             │
│ slug (UQ)    │     │ slug (UQ)        │
│ logo         │     │ logo             │
│ website      │     │ website          │
│ country      │     │ affiliateLink    │
│ createdAt    │     │ shippingPolicy   │
│ updatedAt    │     │ enabled          │
└──────┬───────┘     │ createdAt        │
       │             │ updatedAt        │
       │             └────────┬─────────┘
       │                      │
       │                      │
┌──────▼──────────────────────▼─────────┐
│           VendorProduct                 │
│───────────────────────────────────────│
│ id (PK)                               │
│ vendorId (FK) ──────> Vendor          │
│ productId (FK) ─────> Product         │
│ vendorUrl                             │
│ price (Decimal 10,2)                  │
│ shippingCost (Decimal 10,2)           │
│ shippingIncluded (Boolean)            │
│ totalPrice (Decimal 10,2)             │
│ stockStatus                           │
│ lastChecked                           │
│ createdAt                             │
│ updatedAt                             │
│ @@unique([vendorId, productId])       │
└──────────────┬────────────────────────┘
               │
               │
┌──────────────▼────────────────────────┐
│          PriceHistory                   │
│───────────────────────────────────────│
│ id (PK)                               │
│ vendorProductId (FK) ──> VendorProduct │
│ price (Decimal 10,2)                  │
│ shippingCost (Decimal 10,2)           │
│ totalPrice (Decimal 10,2)             │
│ stockStatus                           │
│ recordedAt                            │
└───────────────────────────────────────┘

┌──────────────┐     ┌──────────────────┐
│  SpecField    │     │  Specification   │
│──────────────│     │──────────────────│
│ id (PK)      │────<│ specFieldId (FK) │
│ name         │     │ productId (FK)   │>──── Product
│ slug (UQ)    │     │ value            │
│ categoryId   │     │ @@unique([       │
│ group        │     │   productId,     │
│ type         │     │   specFieldId])  │
│ options      │     └──────────────────┘
│ order        │
│ createdAt    │
└──────────────┘

┌──────────────┐     ┌──────────────────┐
│    Banner     │     │ BannerLocation   │
│──────────────│     │──────────────────│
│ id (PK)      │────<│ bannerId (FK)    │
│ title        │     │ location         │
│ status       │     │ @@unique([       │
│ priority     │     │   bannerId,      │
│ startDate    │     │   location])     │
│ endDate      │     └──────────────────┘
│ desktopImage │
│ mobileImage  │
│ linkType     │
│ linkUrl      │
│ openNewTab   │
│ displayRule  │
│ bannerType   │
│ createdAt    │
│ updatedAt    │
└──────────────┘

┌──────────────┐     ┌──────────────────┐
│  SwitchData   │     │   KeycapData     │
│──────────────│     │──────────────────│
│ id (PK)      │     │ id (PK)          │
│ productId(UQ)│>─── │ productId (UQ)   │>─── Product
│ manufacturer │     │ profile          │
│ type         │     │ material         │
│ operatingForce│    │ manufactureMethod│
│ bottomOutForce│   │ language         │
│ travel       │     │ createdAt        │
│ factoryLubed │     │ updatedAt        │
│ soundTags    │     └──────────────────┘
│ feelTags     │
│ useTags      │
│ createdAt    │
│ updatedAt    │
└──────────────┘
```

---

## 3. Models

### 3.1 Profile

User profile created automatically on first login.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | String | PK, cuid | Unique identifier |
| `userId` | String | Unique | References Supabase auth user ID |
| `username` | String | Unique | Public username |
| `displayName` | String? | | Display name |
| `bio` | String? | VarChar(200) | Short bio |
| `github` | String? | | GitHub profile URL |
| `discord` | String? | | Discord username/ID |
| `reddit` | String? | | Reddit profile URL |
| `monkeytype` | String? | | MonkeyType profile URL |
| `website` | String? | | Personal website URL |
| `voteCredits` | Int | Default: 25 | Available vote credits |
| `createdAt` | DateTime | Default: now() | Creation timestamp |
| `updatedAt` | DateTime | Auto-updated | Last update timestamp |

**Indexes:** `@@index([username])`
**Relations:** `votes`, `wishlist`, `collection`

---

### 3.2 Brand

Keyboard/peripheral brands (manufacturers).

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | String | PK, cuid | Unique identifier |
| `name` | String | | Brand name |
| `slug` | String | Unique | URL-friendly name |
| `logo` | String? | | Logo image URL |
| `website` | String? | | Official website |
| `country` | String | Default: "IN" | Country code |
| `createdAt` | DateTime | Default: now() | Creation timestamp |
| `updatedAt` | DateTime | Auto-updated | Last update timestamp |

**Indexes:** `@@index([slug])`
**Relations:** `products`

---

### 3.3 Vendor

Indian keyboard vendors/stores.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | String | PK, cuid | Unique identifier |
| `name` | String | | Vendor name |
| `slug` | String | Unique | URL-friendly name |
| `logo` | String? | | Logo image URL |
| `website` | String | | Vendor website URL |
| `affiliateLink` | String? | | Affiliate tracking link |
| `shippingPolicy` | String? | | Shipping policy description |
| `enabled` | Boolean | Default: true | Whether vendor is active |
| `createdAt` | DateTime | Default: now() | Creation timestamp |
| `updatedAt` | DateTime | Auto-updated | Last update timestamp |

**Indexes:** `@@index([slug])`
**Relations:** `vendorProducts`

---

### 3.4 Category

Product categories (Keyboards, Switches, Keycaps, etc.).

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | String | PK, cuid | Unique identifier |
| `name` | String | | Category name |
| `slug` | String | Unique | URL-friendly name |
| `icon` | String? | | Emoji icon |
| `createdAt` | DateTime | Default: now() | Creation timestamp |

**Indexes:** `@@index([slug])`
**Relations:** `products`

**Seed data:**
- Keyboards (`keyboards`, ⌨)
- Switches (`switches`, 🔴)
- Keycaps (`keycaps`, 🔲)
- Desk Pads (`deskpads`, 🟩)

---

### 3.5 Product

Core entity — any keyboard, switch, keycap, or accessory.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | String | PK, cuid | Unique identifier |
| `name` | String | | Product name |
| `slug` | String | Unique | URL-friendly name |
| `brandId` | String? | FK → Brand | Associated brand (optional) |
| `categoryId` | String | FK → Category | Product category (required) |
| `image` | String? | | Product image URL |
| `description` | String? | | Product description |
| `createdAt` | DateTime | Default: now() | Creation timestamp |
| `updatedAt` | DateTime | Auto-updated | Last update timestamp |

**Indexes:** `@@index([slug])`, `@@index([categoryId])`, `@@index([brandId])`
**Relations:** `brand`, `category`, `specifications`, `vendorProducts`, `votes`, `wishlist`, `collection`

---

### 3.6 SpecField

Defines specification fields per category (EAV pattern).

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | String | PK, cuid | Unique identifier |
| `name` | String | | Display name (e.g., "Layout") |
| `slug` | String | Unique | URL-friendly name (e.g., "layout") |
| `categoryId` | String | | Which category this field belongs to |
| `group` | String | Default: "General" | Display group (e.g., "General", "PCB") |
| `type` | String | Default: "text" | Field type: text, number, boolean, select |
| `options` | String? | | JSON array for select type fields |
| `order` | Int | Default: 0 | Display order within group |
| `createdAt` | DateTime | Default: now() | Creation timestamp |

**Indexes:** `@@index([categoryId])`, `@@index([categoryId, group])`
**Relations:** `specs`

---

### 3.7 Specification

Actual specification values for products (EAV value table).

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | String | PK, cuid | Unique identifier |
| `productId` | String | FK → Product | Product this spec belongs to |
| `specFieldId` | String | FK → SpecField | Which spec field this is |
| `value` | String | | The spec value |

**Constraints:** `@@unique([productId, specFieldId])`
**Indexes:** `@@index([productId])`
**Relations:** `product`, `specField`
**Cascade:** onDelete: Cascade (deleting a product removes its specs)

---

### 3.8 VendorProduct

Links a vendor to a product with pricing information.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | String | PK, cuid | Unique identifier |
| `vendorId` | String | FK → Vendor | Vendor selling this product |
| `productId` | String | FK → Product | Product being sold |
| `vendorUrl` | String | | Direct link to product on vendor site |
| `price` | Decimal(10,2) | | Base price in INR |
| `shippingCost` | Decimal(10,2) | Default: 0 | Shipping cost in INR |
| `shippingIncluded` | Boolean | Default: false | Whether shipping is included in price |
| `totalPrice` | Decimal(10,2) | | Total price (price + shipping or just price) |
| `stockStatus` | String | Default: "in_stock" | Stock status |
| `lastChecked` | DateTime | Default: now() | When price was last verified |
| `createdAt` | DateTime | Default: now() | Creation timestamp |
| `updatedAt` | DateTime | Auto-updated | Last update timestamp |

**Constraints:** `@@unique([vendorId, productId])`
**Indexes:** `@@index([productId])`, `@@index([vendorId])`, `@@index([totalPrice])`
**Relations:** `vendor`, `product`, `priceHistory`
**Cascade:** onDelete: Cascade (deleting a product removes vendor pricing)

**Stock status values:** `in_stock`, `preorder`, `group_buy`, `coming_soon`, `out_of_stock`

---

### 3.9 PriceHistory

Historical price records for vendor products.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | String | PK, cuid | Unique identifier |
| `vendorProductId` | String | FK → VendorProduct | Parent vendor product |
| `price` | Decimal(10,2) | | Price at time of recording |
| `shippingCost` | Decimal(10,2) | Default: 0 | Shipping cost at time of recording |
| `totalPrice` | Decimal(10,2) | | Total price at time of recording |
| `stockStatus` | String | Default: "in_stock" | Stock status at time of recording |
| `recordedAt` | DateTime | Default: now() | When this price was recorded |

**Indexes:** `@@index([vendorProductId])`, `@@index([recordedAt])`
**Relations:** `vendorProduct`
**Cascade:** onDelete: Cascade

---

### 3.10 SwitchData

Extended data specific to mechanical switches.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | String | PK, cuid | Unique identifier |
| `productId` | String | Unique, FK → Product | Associated product |
| `manufacturer` | String? | | Switch manufacturer |
| `type` | String? | | linear, tactile, clicky, silent_linear, silent_tactile |
| `operatingForce` | Int? | | Grams |
| `bottomOutForce` | Int? | | Grams |
| `travel` | Decimal(3,1)? | | Travel distance in mm |
| `factoryLubed` | Boolean | Default: false | Factory lubed |
| `soundTags` | String? | | JSON array: thock, clack, creamy, etc. |
| `feelTags` | String? | | JSON array: smooth, scratchy, snappy, etc. |
| `useTags` | String? | | JSON array: gaming, office, coding, etc. |
| `createdAt` | DateTime | Default: now() | Creation timestamp |
| `updatedAt` | DateTime | Auto-updated | Last update timestamp |

**Indexes:** `@@index([productId])`
**Relation:** 1:1 with Product

---

### 3.11 KeycapData

Extended data specific to keycap sets.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | String | PK, cuid | Unique identifier |
| `productId` | String | Unique, FK → Product | Associated product |
| `profile` | String? | | cherry, oem, sa, mt3, xda, dsa, etc. |
| `material` | String? | | abs, pbt, pom |
| `manufactureMethod` | String? | | doubleshot, dye-sub, etc. |
| `language` | String? | Default: "English" | Keycap language/layout |
| `createdAt` | DateTime | Default: now() | Creation timestamp |
| `updatedAt` | DateTime | Auto-updated | Last update timestamp |

**Indexes:** `@@index([productId])`
**Relation:** 1:1 with Product

---

### 3.12 Vote

Community voting on products.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | String | PK, cuid | Unique identifier |
| `profileId` | String | FK → Profile | Voter |
| `productId` | String | FK → Product | Product being voted on |
| `type` | String | | "upvote" or "downvote" |
| `createdAt` | DateTime | Default: now() | Vote timestamp |
| `updatedAt` | DateTime | Auto-updated | Last update timestamp |

**Constraints:** `@@unique([profileId, productId])`
**Indexes:** `@@index([productId])`
**Relations:** `profile`, `product`
**Cascade:** onDelete: Cascade

---

### 3.13 Banner

Promotional banners displayed on the site.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | String | PK, cuid | Unique identifier |
| `title` | String | | Banner title (admin reference) |
| `status` | String | Default: "draft" | "active" or "draft" |
| `priority` | Int | Default: 0 | Display priority (lower = first) |
| `startDate` | DateTime? | | When banner becomes active |
| `endDate` | DateTime? | | When banner expires |
| `desktopImage` | String? | | Desktop image URL |
| `mobileImage` | String? | | Mobile image URL |
| `linkType` | String | Default: "url" | url, internal, vendor, product, category |
| `linkUrl` | String? | | Click-through URL |
| `openNewTab` | Boolean | Default: false | Open link in new tab |
| `displayRule` | String | Default: "both" | both, desktop, mobile |
| `bannerType` | String | Default: "hero" | hero, inline, sidebar |
| `createdAt` | DateTime | Default: now() | Creation timestamp |
| `updatedAt` | DateTime | Auto-updated | Last update timestamp |

**Indexes:** `@@index([status])`, `@@index([priority])`
**Relations:** `locations`

---

### 3.14 BannerLocation

Defines which pages a banner appears on.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | String | PK, cuid | Unique identifier |
| `bannerId` | String | FK → Banner | Parent banner |
| `location` | String | | Page location identifier |

**Constraints:** `@@unique([bannerId, location])`
**Indexes:** `@@index([location])`
**Relations:** `banner`
**Cascade:** onDelete: Cascade

**Location values:** `home`, `keyboards`, `switches`, `keycaps`, `mouse`, `vendors`, `builders`, `brands`, `search`, `guide`, `about`

---

### 3.15 Wishlist

User's saved products for later.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | String | PK, cuid | Unique identifier |
| `profileId` | String | FK → Profile | Owner |
| `productId` | String | FK → Product | Saved product |
| `createdAt` | DateTime | Default: now() | When saved |

**Constraints:** `@@unique([profileId, productId])`
**Relations:** `profile`, `product`
**Cascade:** onDelete: Cascade

---

### 3.16 Collection

User's owned products.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | String | PK, cuid | Unique identifier |
| `profileId` | String | FK → Profile | Owner |
| `productId` | String | FK → Product | Owned product |
| `createdAt` | DateTime | Default: now() | When added |

**Constraints:** `@@unique([profileId, productId])`
**Relations:** `profile`, `product`
**Cascade:** onDelete: Cascade

---

## 4. Indexes Summary

| Model | Index | Fields |
|-------|-------|--------|
| Profile | Default | `username` |
| Brand | Default | `slug` |
| Vendor | Default | `slug` |
| Category | Default | `slug` |
| Product | Default | `slug` |
| Product | Custom | `categoryId` |
| Product | Custom | `brandId` |
| SpecField | Custom | `categoryId` |
| SpecField | Composite | `[categoryId, group]` |
| Specification | Default | `productId` |
| VendorProduct | Default | `productId` |
| VendorProduct | Custom | `vendorId` |
| VendorProduct | Custom | `totalPrice` |
| PriceHistory | Default | `vendorProductId` |
| PriceHistory | Custom | `recordedAt` |
| SwitchData | Default | `productId` |
| KeycapData | Default | `productId` |
| Vote | Default | `productId` |
| Banner | Default | `status` |
| Banner | Custom | `priority` |
| BannerLocation | Default | `location` |

---

## 5. Constraints Summary

| Model | Constraint | Type | Fields |
|-------|------------|------|--------|
| Profile | `userId` | Unique | `userId` |
| Profile | `username` | Unique | `username` |
| Brand | `slug` | Unique | `slug` |
| Vendor | `slug` | Unique | `slug` |
| Category | `slug` | Unique | `slug` |
| Product | `slug` | Unique | `slug` |
| SpecField | `slug` | Unique | `slug` |
| Specification | `productId_specFieldId` | Unique | `productId`, `specFieldId` |
| VendorProduct | `vendorId_productId` | Unique | `vendorId`, `productId` |
| SwitchData | `productId` | Unique | `productId` |
| KeycapData | `productId` | Unique | `productId` |
| Vote | `profileId_productId` | Unique | `profileId`, `productId` |
| BannerLocation | `bannerId_location` | Unique | `bannerId`, `location` |
| Wishlist | `profileId_productId` | Unique | `profileId`, `productId` |
| Collection | `profileId_productId` | Unique | `profileId`, `productId` |

---

## 6. Foreign Keys Summary

| Model | Field | References | On Delete |
|-------|-------|------------|-----------|
| Profile | — | — | — (Supabase auth) |
| Product | `brandId` | Brand.id | SetNull |
| Product | `categoryId` | Category.id | Restrict |
| Specification | `productId` | Product.id | Cascade |
| Specification | `specFieldId` | SpecField.id | Restrict |
| VendorProduct | `vendorId` | Vendor.id | Restrict |
| VendorProduct | `productId` | Product.id | Cascade |
| PriceHistory | `vendorProductId` | VendorProduct.id | Cascade |
| Vote | `profileId` | Profile.id | Cascade |
| Vote | `productId` | Product.id | Cascade |
| BannerLocation | `bannerId` | Banner.id | Cascade |
| Wishlist | `profileId` | Profile.id | Cascade |
| Wishlist | `productId` | Product.id | Cascade |
| Collection | `profileId` | Profile.id | Cascade |
| Collection | `productId` | Product.id | Cascade |

---

## 7. Migration History

> TODO: Document migration history once migrations are generated and applied.
>
> Current state: Schema is defined but migrations have not been generated yet. Run `npx prisma migrate dev` to create the initial migration.

---

## 8. Naming Conventions

| Convention | Example | Applies to |
|------------|---------|------------|
| PascalCase | `Profile`, `VendorProduct` | Model names |
| camelCase | `userId`, `brandId`, `categoryId` | Field names |
| snake_case | `stock_status`, `price_min` | Query parameters, URL params |
| kebab-case | `keyboards`, `price-history` | Slugs, route segments |
| CUID | `clx1234...` | Primary keys |
| `@@unique` | `@@unique([profileId, productId])` | Composite unique constraints |
| `@@index` | `@@index([categoryId])` | Database indexes |

---

## 9. Future Database Improvements

| Improvement | Priority | Description |
|-------------|----------|-------------|
| Add `reputation` field to Profile | High | Track user contribution reputation |
| Add `Contribution` model | High | Track user-submitted edits and additions |
| Add `Report` model | Medium | User reports for products/vendors |
| Add `View` model | Medium | Track product page views |
| Add `SearchLog` model | Medium | Track search queries |
| Add `Announcement` model | Low | In-app announcements beyond banners |
| Add `Notification` model | Low | User notifications |
| Full-text search index | Medium | PostgreSQL GIN index for faster search |
| Partition PriceHistory | Low | Partition by date for large datasets |
| Add `meta` JSON field to Product | Low | Extensible metadata without schema changes |
