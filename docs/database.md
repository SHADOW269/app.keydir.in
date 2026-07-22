# Database Documentation

## Overview

KeyDir uses PostgreSQL via Supabase with Prisma 7 as the ORM. The database stores all product, vendor, user, and community data.

## Connection

```typescript
// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
export const prisma = new PrismaClient({ adapter });
```

## Schema

### Core Models

#### Product
Central model for all keyboard-related products.

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (cuid) | Primary key |
| `name` | String | Product name |
| `slug` | String (unique) | URL-friendly identifier |
| `description` | String? | Product description |
| `productType` | String | Category: `keyboard`, `switch`, `keycap`, `mouse` |
| `brandId` | String | Foreign key to Brand |
| `imageUrl` | String? | Primary product image |
| `createdAt` | DateTime | Creation timestamp |
| `updatedAt` | DateTime | Last update timestamp |

#### Brand
Manufacturers/brands of products.

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (cuid) | Primary key |
| `name` | String | Brand name |
| `slug` | String (unique) | URL-friendly identifier |
| `logoUrl` | String? | Brand logo |

#### Vendor
Stores/retailers that sell products.

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (cuid) | Primary key |
| `name` | String | Vendor name |
| `slug` | String (unique) | URL-friendly identifier |
| `website` | String? | Vendor website URL |
| `logoUrl` | String? | Vendor logo |
| `enabled` | Boolean | Whether vendor is active |
| `scraperEnabled` | Boolean | Whether scraping is enabled |
| `scraperEngine` | String? | `cheerio` or `playwright` |
| `cloudflareProtected` | Boolean | Whether site has Cloudflare protection |

#### VendorProduct
Links products to vendors with pricing information.

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (cuid) | Primary key |
| `productId` | String | Foreign key to Product |
| `vendorId` | String | Foreign key to Vendor |
| `price` | Float? | Current price |
| `url` | String? | Product URL on vendor site |
| `availability` | String | Stock status |
| `lastCheckedAt` | DateTime? | Last scrape timestamp |

#### PriceHistory
Tracks price changes over time.

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (cuid) | Primary key |
| `vendorProductId` | String | Foreign key to VendorProduct |
| `price` | Float | Price at time of record |
| `recordedAt` | DateTime | When price was recorded |

### Specification Models

#### KeyboardSpec
Keyboard-specific specifications.

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (cuid) | Primary key |
| `productId` | String | Foreign key to Product |
| `layout` | String? | e.g., `60%`, `65%`, `75%`, `TKL`, `full` |
| `switchType` | String? | `mechanical`, `optical`, `membrane` |
| `connectivity` | String? | `wired`, `wireless`, `bluetooth` |
| `backlight` | String? | `rgb`, `single`, `none` |
| `hotswap` | Boolean? | Hot-swappable switches |
| `priceRange` | String? | Price bracket |

#### SwitchSpec
Switch-specific specifications.

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (cuid) | Primary key |
| `productId` | String | Foreign key to Product |
| `switchType` | String? | `linear`, `tactile`, `clicky` |
| `actuationForce` | String? | e.g., `45g` |
| `bottomOutForce` | String? | e.g., `60g` |
| `travelDistance` | String? | e.g., `4mm` |
| `lubed` | Boolean? | Pre-lubed from factory |

#### KeycapSpec
Keycap-specific specifications.

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (cuid) | Primary key |
| `productId` | String | Foreign key to Product |
| `material` | String? | `pbt`, `abs`, `pa` |
| `profile` | String? | `cherry`, `oem`, `sa`, `dsa`, `xda` |
| `legends` | String? | `doubleshot`, `dye-sub`, `pad-printed` |
| `layout` | String? | `ansi`, `iso`, `alice` |

#### MouseSpec
Mouse-specific specifications.

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (cuid) | Primary key |
| `productId` | String | Foreign key to Product |
| `sensor` | String? | Sensor model |
| `dpi` | String? | Max DPI |
| `pollingRate` | String? | e.g., `1000Hz`, `4000Hz` |
| `weight` | String? | Weight in grams |
| `connectivity` | String? | `wired`, `wireless`, `bluetooth` |

### User & Community Models

#### Profile
User profile data (extends Supabase auth).

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (cuid) | Primary key |
| `userId` | String (unique) | Supabase auth user ID |
| `username` | String (unique) | Display name |
| `avatarUrl` | String? | Profile picture |
| `bio` | String? | User biography |

#### Vote
User votes on products.

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (cuid) | Primary key |
| `userId` | String | Voter's user ID |
| `productId` | String | Voted product |
| `value` | Int | `1` for upvote, `-1` for downvote |

#### Wishlist
User wishlists.

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (cuid) | Primary key |
| `userId` | String | Owner's user ID |
| `productId` | String | Wishlisted product |

#### Collection
User product collections.

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (cuid) | Primary key |
| `userId` | String | Owner's user ID |
| `name` | String | Collection name |
| `description` | String? | Collection description |

### Admin Models

#### Banner
Homepage banners.

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (cuid) | Primary key |
| `title` | String | Banner title |
| `desktopImage` | String? | Desktop image URL |
| `mobileImage` | String? | Mobile image URL |
| `linkUrl` | String? | Click-through URL |
| `linkType` | String | `internal` or `external` |
| `openNewTab` | Boolean | Open link in new tab |

#### BanHistory
User ban records.

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (cuid) | Primary key |
| `userId` | String | Banned user ID |
| `reason` | String | Ban reason |
| `bannedAt` | DateTime | When banned |

#### Contribution
Tracks user contributions.

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (cuid) | Primary key |
| `userId` | String | Contributor's user ID |
| `type` | String | Contribution type |
| `points` | Int | XP earned |

#### UserXP
User experience points.

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (cuid) | Primary key |
| `userId` | String (unique) | User ID |
| `totalXp` | Int | Total XP earned |
| `level` | Int | Current level |

#### UserBadge
User badges/achievements.

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (cuid) | Primary key |
| `userId` | String | User ID |
| `badgeId` | String | Badge ID |
| `earnedAt` | DateTime | When earned |

#### ActivityLog
User activity tracking.

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (cuid) | Primary key |
| `userId` | String | User ID |
| `action` | String | Action performed |
| `details` | Json? | Additional details |

## Relationships

```
Brand ──1:N── Product ──1:N── VendorProduct ──1:N── PriceHistory
                      │
                      ├──1:1── KeyboardSpec
                      ├──1:1── SwitchSpec
                      ├──1:1── KeycapSpec
                      └──1:1── MouseSpec

Vendor ──1:N── VendorProduct

Profile ──1:N── Vote
         ──1:N── Wishlist
         ──1:N── Collection
         ──1:N── Contribution
         ──1:1── UserXP
         ──1:N── UserBadge
         ──1:N── ActivityLog
```

## Migrations

### Creating a Migration

```bash
# Make changes to prisma/schema.prisma, then:
npx prisma migrate dev --name descriptive-name

# For production:
npx prisma migrate deploy
```

### Seeding

```bash
npx prisma db seed
```

The seed file (`prisma/seed.ts`) creates:
- Sample brands (Rainy, Bridge, Neo Macro, Wooting, etc.)
- Sample vendors (GenesisPC, Rectangles, Mecha, etc.)
- Sample products with specifications

## Common Queries

### Fetching Products with Filters

```typescript
const products = await prisma.product.findMany({
  where: {
    productType: 'keyboard',
    brand: { slug: 'wooting' },
    vendorProducts: {
      some: { price: { gte: 5000, lte: 15000 } }
    }
  },
  include: {
    brand: true,
    keyboardSpec: true,
    vendorProducts: {
      include: { vendor: true },
      orderBy: { price: 'asc' }
    }
  }
});
```

### Getting Lowest Price

```typescript
const lowestPrice = await prisma.vendorProduct.findFirst({
  where: { productId },
  orderBy: { price: 'asc' },
  select: { price: true, vendor: { select: { name: true } } }
});
```

## Performance Tips

1. Always use `select` to fetch only needed fields
2. Use `take` to limit results
3. Add `@@index` for frequently queried fields
4. Avoid N+1 queries with `include`
5. Use connection pooling in production

## Troubleshooting

See `docs/troubleshooting.md` for database-related issues.
