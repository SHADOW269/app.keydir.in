# KEYDIR — Architecture

> **Version:** 1.0
> **Last Updated:** 2026-07-14

---

## 1. Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        KEYDIR Architecture                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐      │
│  │   Browser     │    │   Browser     │    │   Browser     │     │
│  │  (Visitor)    │    │  (User)       │    │  (Admin)      │     │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘      │
│         │                   │                   │               │
│         └───────────────────┼───────────────────┘               │
│                             │                                   │
│                     ┌───────▼───────┐                           │
│                     │  Vercel Edge   │                           │
│                     │  (Next.js 16)  │                           │
│                     └───────┬───────┘                           │
│                             │                                   │
│              ┌──────────────┼──────────────┐                    │
│              │              │              │                    │
│     ┌────────▼────┐ ┌──────▼──────┐ ┌────▼────────┐           │
│     │  Server      │ │  Server     │ │  API         │           │
│     │  Components  │ │  Actions    │ │  Routes      │           │
│     └────────┬────┘ └──────┬──────┘ └────┬────────┘           │
│              │              │              │                    │
│              └──────────────┼──────────────┘                    │
│                             │                                   │
│              ┌──────────────┼──────────────┐                    │
│              │              │              │                    │
│     ┌────────▼────┐ ┌──────▼──────┐ ┌────▼────────┐           │
│     │  Prisma      │ │  Supabase   │ │  File        │           │
│     │  ORM         │ │  Auth       │ │  System      │           │
│     └────────┬────┘ └──────┬──────┘ └────┬────────┘           │
│              │              │              │                    │
│     ┌────────▼────┐ ┌──────▼──────┐ ┌────▼────────┐           │
│     │  PostgreSQL  │ │  Supabase   │ │  /public/    │           │
│     │  Database    │ │  Cloud      │ │  uploads/    │           │
│     └─────────────┘ └─────────────┘ └─────────────┘           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Project Structure

```
app.keydir.in/
├── prisma/
│   ├── schema.prisma          # Database schema (all models)
│   ├── seed.ts                # Seed script (categories, brands, vendors, products, specs)
│   └── migrations/            # Prisma migration history
├── prisma.config.ts           # Prisma config (datasource URL, seed command)
├── src/
│   ├── app/                   # Next.js App Router pages
│   │   ├── layout.tsx         # Root layout (fonts, ThemeProvider, ProgressBar)
│   │   ├── page.tsx           # Homepage (hero, categories, stats, CTA)
│   │   ├── globals.css        # Global styles + component styles
│   │   ├── design-tokens.css  # Design token CSS variables
│   │   ├── favicon.ico
│   │   ├── keyboards/         # Keyboard category page (Server + Client components)
│   │   │   ├── page.tsx       # Server wrapper (fetches banners)
│   │   │   └── content.tsx    # Client component (filters, infinite scroll)
│   │   ├── switches/          # Switch category page
│   │   │   ├── page.tsx
│   │   │   └── content.tsx
│   │   ├── keycaps/           # Keycap category page
│   │   │   ├── page.tsx
│   │   │   └── content.tsx
│   │   ├── mouse/             # Mouse category page
│   │   │   ├── page.tsx
│   │   │   └── content.tsx
│   │   ├── products/
│   │   │   └── [slug]/        # Product detail page (Server Component)
│   │   │       └── page.tsx
│   │   ├── profile/
│   │   │   └── [username]/    # User profile page (Server Component)
│   │   │       └── page.tsx
│   │   ├── auth/
│   │   │   ├── login/page.tsx
│   │   │   ├── forgot-password/page.tsx
│   │   │   ├── reset-password/page.tsx
│   │   │   ├── verify-email/page.tsx
│   │   │   ├── account-created/page.tsx
│   │   │   └── callback/route.ts  # OAuth callback handler
│   │   ├── admin/
│   │   │   ├── layout.tsx     # Admin shell (sidebar + main)
│   │   │   ├── page.tsx       # Dashboard (stats, activity, health)
│   │   │   ├── products/      # Product CRUD
│   │   │   ├── vendors/       # Vendor CRUD
│   │   │   ├── brands/        # Brand CRUD
│   │   │   ├── categories/    # Category CRUD
│   │   │   ├── banners/       # Banner CRUD
│   │   │   ├── users/         # User listing
│   │   │   ├── votes/         # Vote management
│   │   │   ├── community/     # Community moderation
│   │   │   └── settings/      # Site settings
│   │   └── api/
│   │       ├── products/      # Product listing + filter API
│   │       │   ├── route.ts
│   │       │   └── filters/route.ts
│   │       ├── switches/      # Switch listing + filter API
│   │       │   ├── route.ts
│   │       │   └── filters/route.ts
│   │       ├── keycaps/       # Keycap listing API
│   │       │   └── route.ts
│   │       ├── mouse/         # Mouse listing API
│   │       │   └── route.ts
│   │       ├── votes/         # Voting API (placeholder)
│   │       │   └── route.ts
│   │       ├── search/        # Global search API
│   │       │   └── route.ts
│   │       └── upload/        # Image upload API
│   │           └── route.ts
│   ├── components/
│   │   ├── layout/
│   │   │   ├── navbar.tsx          # Main navigation bar
│   │   │   ├── footer.tsx          # Site footer
│   │   │   ├── footer-theme-toggle.tsx
│   │   │   └── global-search.tsx   # Nav search with dropdown
│   │   ├── product/
│   │   │   ├── product-card.tsx        # Product card for listings
│   │   │   ├── home-product-section.tsx # Homepage featured products
│   │   │   ├── vendor-card.tsx         # Vendor pricing card
│   │   │   ├── spec-table.tsx          # Specification display table
│   │   │   ├── vote-widget.tsx         # Upvote/downvote buttons
│   │   │   ├── price-history-chart.tsx # SVG price chart
│   │   │   ├── price-table.tsx         # Vendor price comparison table
│   │   │   ├── save-buttons.tsx        # Wishlist/Collection toggle
│   │   │   ├── filter-modal.tsx        # Keyboard filter panel
│   │   │   ├── switch-filter-modal.tsx # Switch filter panel
│   │   │   ├── keycap-filter-modal.tsx # Keycap filter panel
│   │   │   └── mouse-filter-modal.tsx  # Mouse filter panel
│   │   ├── auth/
│   │   │   ├── auth-layout.tsx     # Auth page layout
│   │   │   ├── auth-terminal.tsx   # Terminal-style auth display
│   │   │   └── social-buttons.tsx  # Google/Discord OAuth buttons
│   │   ├── admin/
│   │   │   ├── product-form.tsx    # Admin product form
│   │   │   ├── vendor-form.tsx     # Admin vendor form
│   │   │   ├── brand-form.tsx      # Admin brand form
│   │   │   ├── category-form.tsx   # Admin category form
│   │   │   ├── banner-form.tsx     # Admin banner form
│   │   │   └── banner-actions.tsx  # Banner action buttons
│   │   ├── profile/
│   │   │   ├── profile-tabs.tsx        # Wishlist/Collection tabs
│   │   │   ├── profile-edit-form.tsx   # Profile edit form
│   │   │   └── identicon.tsx           # Generated avatar
│   │   ├── banner/
│   │   │   ├── hero-banner.tsx     # Hero banner carousel
│   │   │   └── inline-banner.tsx   # Inline banner
│   │   ├── ui/
│   │   │   └── search-bar.tsx      # Reusable search bar
│   │   ├── theme-provider.tsx      # next-themes provider
│   │   ├── theme-script.tsx        # FOUC prevention script
│   │   ├── progress-bar.tsx        # Scroll progress indicator
│   │   ├── scroll-reveal.tsx       # Scroll-triggered animations
│   │   └── cursor.tsx              # Custom cursor
│   ├── lib/
│   │   ├── prisma.ts               # Prisma client singleton
│   │   ├── utils.ts                # cn(), formatPrice(), slugify(), timeAgo()
│   │   ├── validations.ts          # Zod schemas (username, profile, filters)
│   │   ├── site-data.ts            # Static vendor/category/brand data
│   │   ├── supabase/
│   │   │   ├── server.ts           # Server-side Supabase client
│   │   │   └── client.ts           # Browser-side Supabase client
│   │   ├── auth/
│   │   │   └── actions.ts          # Auth server actions (login, register, logout, OAuth)
│   │   ├── admin/
│   │   │   ├── actions.ts          # Admin CRUD server actions
│   │   │   ├── community-actions.ts # Community moderation actions
│   │   │   └── banner-actions.ts   # Banner CRUD server actions
│   │   └── profile/
│   │       └── actions.ts          # Profile, wishlist, collection, voting actions
│   └── types/
│       └── index.ts                # TypeScript interfaces and type definitions
├── public/
│   └── uploads/
│       └── banners/                # Uploaded banner images
├── supabase/                       # Supabase local dev config
├── package.json
├── tsconfig.json
├── next.config.ts
├── postcss.config.mjs
├── eslint.config.mjs
├── .env.example
└── README.md
```

---

## 3. Authentication Flow

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Login    │────>│ Supabase │────>│ Callback │────>│ Profile  │
│  Page     │     │  Auth    │     │  Route   │     │  Create  │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
     │                │                │                │
     │  Email/Pass    │  Verify        │  Exchange      │  Auto-create
     │  or OAuth      │  Credentials   │  Code          │  if new user
     │                │                │                │
     ▼                ▼                ▼                ▼
  formData       supabase.auth    supabase.auth     prisma.profile
  -> server      .signInWith     .exchangeCode      .create({
  action           Password()     ForSession()        userId,
                                 + getUser()         username,
                                                     displayName
                                                   })
```

**Providers:**
- Email + Password (Supabase Auth)
- Google OAuth (via Supabase)
- Discord OAuth (via Supabase)

**Files involved:**
- `src/lib/auth/actions.ts` — Server actions: `login()`, `register()`, `logout()`, `signInWithGoogle()`, `signInWithDiscord()`, `forgotPassword()`
- `src/lib/supabase/server.ts` — Server-side Supabase client (cookie-based)
- `src/lib/supabase/client.ts` — Browser-side Supabase client
- `src/app/auth/callback/route.ts` — OAuth callback handler (exchanges code, creates profile)
- `src/app/auth/login/page.tsx` — Login page
- `src/app/auth/forgot-password/page.tsx` — Password reset request
- `src/app/auth/reset-password/page.tsx` — Password reset form
- `src/app/auth/account-created/page.tsx` — Post-registration confirmation

**Admin authorization:**
- Admin access is determined by `ADMIN_EMAILS` environment variable (comma-separated list)
- Checked in server actions via `supabase.auth.getUser()` + email comparison
- No role-based access control in database — email-based gatekeeping only

---

## 4. Database Flow

```
┌─────────────────────────────────────────────────────┐
│                    Prisma ORM                        │
│                                                     │
│  prisma.ts → PrismaClient with PrismaPg adapter     │
│  → PostgreSQL via DATABASE_URL                       │
│  → Global singleton in development                   │
└─────────────────────────────────────────────────────┘
```

**Singleton pattern:**
- `src/lib/prisma.ts` creates a global `PrismaClient` instance
- In development, attaches to `globalThis` to survive HMR
- Uses `PrismaPg` adapter for PostgreSQL connection

**Query patterns:**
- Server Components: Direct `prisma.*` calls (no API layer)
- Server Actions: Direct `prisma.*` calls with `revalidatePath()`
- API Routes: Direct `prisma.*` calls returning `NextResponse.json()`
- No client-side direct database access — all queries go through server

---

## 5. Voting System

```
┌──────────┐     ┌──────────┐     ┌──────────┐
│  User     │────>│  Vote    │────>│  Vote    │
│  Clicks   │     │  Widget  │     │  Action  │
└──────────┘     └──────────┘     └──────────┘
                                       │
                          ┌────────────┼────────────┐
                          │            │            │
                     ┌────▼────┐ ┌────▼────┐ ┌────▼────┐
                     │  Same   │ │ Opposite│ │  New    │
                     │  vote   │ │  vote   │ │  vote   │
                     │  (remove)│ │ (switch)│ │ (create)│
                     └─────────┘ └─────────┘ └─────────┘
```

**Vote logic (`src/lib/profile/actions.ts:voteOnProduct`):**
1. Check authentication
2. Find existing vote for this user + product
3. If exists and same type → delete (toggle off)
4. If exists and different type → update (switch)
5. If not exists → create new vote
6. Revalidate `/keyboards` and `/products` paths

**Approval rating:**
- Calculated only when total votes >= 10
- Formula: `Math.round((upvotes / totalVotes) * 100)`
- Displayed on product cards as percentage

---

## 6. Collection System

```
┌──────────┐     ┌──────────┐
│  Toggle   │────>│ Upsert / │
│  Button   │     │ Delete   │
└──────────┘     └──────────┘
                       │
              ┌────────┼────────┐
              │                 │
         ┌────▼────┐      ┌────▼────┐
         │ Wishlist │      │Collection│
         │ (save for│      │ (own it) │
         │  later)  │      │          │
         └─────────┘      └─────────┘
```

**Actions (`src/lib/profile/actions.ts`):**
- `toggleWishlist(productId)` — Add/remove from wishlist
- `toggleCollection(productId)` — Add/remove from collection
- `removeFromWishlist(wishlistId)` — Remove from profile page
- `removeFromCollection(collectionId)` — Remove from profile page

---

## 7. Price History

```
┌──────────┐     ┌──────────┐     ┌──────────┐
│  Admin    │────>│ Vendor   │────>│ Price    │
│  updates  │     │ Product  │     │ History  │
│  price    │     │ upsert   │     │ record   │
└──────────┘     └──────────┘     └──────────┘
                                      │
                                 ┌────▼────┐
                                 │  Chart  │
                                 │  render │
                                 └─────────┘
```

**Flow:**
1. Admin creates/updates a VendorProduct via `createVendorProduct()`
2. `VendorProduct` record stores current price, shipping, total
3. `PriceHistory` records are created on each price change
4. `PriceHistoryChart` component fetches history and renders SVG chart
5. Chart supports range selection: 7D, 30D, 90D, ALL
6. Interactive crosshair shows price, date, and vendor on hover

---

## 8. Contribution Workflow

**Current (Admin-only):**
1. Admin navigates to `/admin/products/new`
2. Fills product form (name, brand, category, image, description)
3. Server action validates and creates product
4. Admin adds vendor products (pricing) on product edit page
5. Admin adds specifications on product edit page

**Planned (Community):**
1. User submits new product or price update
2. Submission enters "pending" queue
3. Admin reviews in `/admin/community`
4. Admin approves → data goes live
5. Admin rejects → submission removed with optional feedback

---

## 9. Admin Workflow

```
┌─────────────────────────────────────────────────────┐
│                   Admin Dashboard                    │
│                                                     │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐            │
│  │ Products │  │ Vendors │  │ Brands  │            │
│  │ CRUD     │  │ CRUD    │  │ CRUD    │            │
│  └─────────┘  └─────────┘  └─────────┘            │
│                                                     │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐            │
│  │Categories│  │ Banners │  │  Users  │            │
│  │ CRUD     │  │ CRUD    │  │  List   │            │
│  └─────────┘  └─────────┘  └─────────┘            │
│                                                     │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐            │
│  │  Votes  │  │Community│  │Settings │            │
│  │ Manage  │  │ Moderate│  │ Config  │            │
│  └─────────┘  └─────────┘  └─────────┘            │
└─────────────────────────────────────────────────────┘
```

**Authorization:**
- Admin access gated by `ADMIN_EMAILS` env var
- Checked in: `community-actions.ts` (`resetProductVotes`, `removeVote`)
- NOT enforced in: admin CRUD actions, admin pages (TODO: add middleware)

---

## 10. Deployment Architecture

```
┌─────────────────────────────────────────────┐
│               Vercel Platform                │
│                                             │
│  ┌──────────────────────────────────────┐   │
│  │         Next.js 16 App               │   │
│  │                                      │   │
│  │  Server Components (SSR)             │   │
│  │  Server Actions                      │   │
│  │  API Routes                          │   │
│  │  Static Pages (ISR)                  │   │
│  └──────────────┬───────────────────────┘   │
│                 │                            │
│  ┌──────────────▼───────────────────────┐   │
│  │         Vercel Edge Network          │   │
│  │  - Static assets (CDN)               │   │
│  │  - ISR pages (cached)                │   │
│  │  - Serverless functions (dynamic)    │   │
│  └──────────────────────────────────────┘   │
│                                             │
└─────────────────────────────────────────────┘
         │
         │  Connection (PrismaPg adapter)
         │
┌────────▼────────────────────────────────────┐
│           Supabase Cloud                    │
│                                             │
│  ┌──────────────┐  ┌──────────────────┐    │
│  │  PostgreSQL   │  │  Auth            │    │
│  │  Database     │  │  (email, OAuth)  │    │
│  └──────────────┘  └──────────────────┘    │
│                                             │
└─────────────────────────────────────────────┘
```

**Key deployment details:**
- **Framework:** Next.js 16.2.10 on Vercel
- **Database:** Supabase PostgreSQL (connected via PrismaPg adapter)
- **Auth:** Supabase Auth (managed service)
- **Static assets:** Served from `/public/` via Vercel CDN
- **Banner images:** Uploaded to `/public/uploads/banners/` (local filesystem)
- **Environment variables:** Set in Vercel dashboard (see `.env.example`)

---

## 11. Cron Jobs

| Job | Status | Description |
|-----|--------|-------------|
| Price scraping | 🔲 Planned | Automated price checking from vendor sites |
| Stock status check | 🔲 Planned | Verify stock availability |
| Data cleanup | 🔲 Planned | Remove orphaned records |
| Sitemap generation | 🔲 Planned | Auto-generate sitemap.xml |

---

## 12. Scrapers

| Scraper | Status | Description |
|---------|--------|-------------|
| Vendor price scraper | 🔲 Planned | Scrape prices from Indian vendor sites |
| Stock checker | 🔲 Planned | Check in-stock/out-of-stock status |
| New product detection | 🔲 Planned | Detect new products on vendor sites |

**Implementation notes:**
- Scrapers would run as Vercel Cron Jobs or external services
- Must respect vendor robots.txt
- Should update `PriceHistory` on each run
- Rate limiting required to avoid overloading vendor sites

---

## 13. Caching Strategy

| Layer | Strategy | TTL |
|-------|----------|-----|
| Static pages | ISR (Incremental Static Regeneration) | 60s |
| Product listings | `force-dynamic` (no cache) | — |
| API routes | No explicit cache headers | — |
| Prisma queries | No application-level cache | — |
| Static assets | Vercel CDN | Long-term |
| Banner images | Vercel CDN | Long-term |

**Current state:** Minimal caching. Most pages use `force-dynamic` or server-side rendering without caching.

**TODO:** Implement caching for:
- Product listing API responses
- Search results
- Filter option data
- Category metadata

---

## 14. Image Handling

| Type | Storage | Optimization |
|------|---------|--------------|
| Product images | External URLs (vendor sites) | `next/image` with remote patterns |
| Banner images | `/public/uploads/banners/` | `next/image` |
| Brand logos | External URLs or admin-uploaded | `next/image` |
| User avatars | Generated identicon (SVG) | Inline SVG |

**Upload flow:**
1. Admin selects image file in banner form
2. Client-side POST to `/api/upload`
3. Server validates (5MB max, JPEG/PNG/WebP/GIF)
4. Writes to `/public/uploads/banners/` with timestamp + random suffix
5. Returns URL (`/uploads/banners/{filename}`)
6. URL stored in database record

**`next.config.ts` remote patterns:**
```ts
images: {
  remotePatterns: [
    { protocol: 'https', hostname: '**' },
  ],
}
```
Allows any HTTPS image source.

---

## 15. Data Relationships

```
Profile ──┐
          ├── Vote ──────── Product ──── Brand
          ├── Wishlist ──── Product ──── Category
          └── Collection ── Product ──── Specification ──── SpecField ──── SpecOption
                                   │
                                   └── VendorProduct ──── Vendor
                                           │
                                           └── PriceHistory

Banner ──── BannerLocation

SwitchData ──── Product (1:1, DEPRECATED — migrated to EAV)
KeycapData ──── Product (1:1, DEPRECATED — migrated to EAV)
```

**Key relationships:**
- `Profile` 1:N `Vote` (cascade delete)
- `Profile` 1:N `Wishlist` (cascade delete)
- `Profile` 1:N `Collection` (cascade delete)
- `Product` N:1 `Brand` (optional)
- `Product` N:1 `Category` (required)
- `Product` 1:N `Specification` (cascade delete)
- `Product` 1:N `VendorProduct` (cascade delete)
- `Product` 1:N `Vote` (cascade delete)
- `Vendor` 1:N `VendorProduct`
- `SpecField` 1:N `Specification`
- `SpecField` 1:N `SpecOption` (cascade delete)
- `VendorProduct` 1:N `PriceHistory` (cascade delete)
- `Banner` 1:N `BannerLocation` (cascade delete)
- `Product` 1:1 `SwitchData` (deprecated, migrated to EAV)
- `Product` 1:1 `KeycapData` (deprecated, migrated to EAV)

---

## 16. API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/products` | GET | List keyboards with filters, sort, pagination |
| `/api/products/filters` | GET | Get available filter options |
| `/api/switches` | GET | List switches with filters |
| `/api/switches/filters` | GET | Get switch filter options |
| `/api/keycaps` | GET | List keycaps with filters |
| `/api/mouse` | GET | List mice with filters |
| `/api/votes` | GET | Placeholder — coming soon |
| `/api/search` | GET | Global search (products, vendors, brands) |
| `/api/upload` | POST | Upload banner images |

**Search API example:**
```
GET /api/search?q=keychron
Response: {
  products: [{ name, slug, image, brand, category, categorySlug }],
  vendors: [{ name, slug }],
  brands: [{ name, slug }]
}
```

**Products API example:**
```
GET /api/products?sort=lowest&layout=75%25&priceMin=5000&priceMax=15000
Response: {
  products: [{ id, name, slug, image, brand, category, lowestPrice, vendorCount, upvotes, downvotes, specs, approval, userVote }],
  total: 42
}
```
