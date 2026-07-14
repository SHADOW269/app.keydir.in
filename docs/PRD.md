# KEYDIR — Product Requirements Document

> **Version:** 1.0
> **Last Updated:** 2026-07-14
> **Status:** Active Development

---

## 1. Project Vision

KEYDIR is the definitive community-maintained directory of mechanical keyboards, switches, keycaps, vendors, brands, and desk peripherals available in India. It serves as a single, trusted source of truth for the Indian mechanical keyboard community — replacing fragmented spreadsheets, scattered Reddit threads, and inconsistent vendor pages with one fast, searchable, unbiased directory.

**Core Principles:**
- No affiliate links. No ads. Pure signal.
- Community-driven data: users contribute, verify, and vote.
- India-first: pricing in INR, Indian vendors only, Indian shipping context.
- Open-source ethos: transparent, auditable, contributor-friendly.

---

## 2. Problem Statement

The Indian mechanical keyboard community faces several problems:

| Problem | Impact |
|---------|--------|
| No centralized product directory | Users scour 20+ vendor sites manually |
| Price opacity across vendors | Impossible to find the best deal without checking each vendor |
| No price history | Users cannot tell if a price is a good deal or inflated |
| Fragmented vendor information | Shipping policies, stock status, and reliability are unknown |
| No community verification | Product specs and vendor reliability are unverified |
| Group buys are risky | No trusted platform to track or verify group buys |

KEYDIR solves these by providing a **unified, community-driven, India-focused** directory with price comparison, history, voting, and vendor transparency.

---

## 3. Target Audience

| Segment | Description |
|---------|-------------|
| **Primary** | Indian mechanical keyboard enthusiasts (buyers, builders, modders) |
| **Secondary** | Vendors seeking visibility in the Indian market |
| **Tertiary** | Content creators, reviewers, and community moderators |

---

## 4. User Roles

### 4.1 Visitor (Unauthenticated)

- Browse products by category (Keyboards, Switches, Keycaps, Mouse)
- View product details, specs, and vendor pricing
- Use global search
- View price history charts
- View vendor profiles and links
- View public user profiles

### 4.2 Registered User

All Visitor capabilities plus:

- Vote on products (upvote/downvote)
- Add products to Wishlist
- Add products to Collection
- Edit own profile (display name, bio, social links)
- View own voting history

### 4.3 Community Contributor

All Registered User capabilities plus:

- Submit new products via admin panel
- Submit new vendor listings
- Submit price updates for existing products
- Submit specification data
- Edit existing product information

### 4.4 Moderator

All Community Contributor capabilities plus:

- Review and approve/reject community submissions
- Moderate votes (remove spam votes)
- Reset product votes if manipulation is detected
- Manage banners and announcements

### 4.5 Administrator

All Moderator capabilities plus:

- Full CRUD for all entities (products, vendors, brands, categories)
- Manage vendor products and pricing
- Manage specifications (SpecField definitions)
- Manage banners (create, edit, delete, toggle, duplicate)
- Manage users
- Access system health dashboard
- Configure site settings
- Admin authentication via ADMIN_EMAILS environment variable

---

## 5. Core Features

### 5.1 Products

| Feature | Status | Description |
|---------|--------|-------------|
| Product listing | ✅ Implemented | Paginated product cards with image, name, brand, price, vote count |
| Product detail page | ✅ Implemented | Full product page with specs, vendors, price history, voting |
| Product creation | ✅ Implemented | Admin-only product creation with name, brand, category, image, description |
| Product editing | ✅ Implemented | Admin-only product editing |
| Product deletion | ✅ Implemented | Admin-only with cascade delete |
| Slug-based URLs | ✅ Implemented | SEO-friendly `/products/[slug]` routes |
| Category-specific pages | ✅ Implemented | `/keyboards`, `/switches`, `/keycaps`, `/mouse` with dedicated filter modals |
| Dynamic metadata | ✅ Implemented | Per-page `<title>` and OpenGraph tags |

### 5.2 Vendors

| Feature | Status | Description |
|---------|--------|-------------|
| Vendor listing | ✅ Implemented | Admin panel vendor management |
| Vendor creation | ✅ Implemented | Name, website, affiliate link, shipping policy, enabled toggle |
| Vendor editing | ✅ Implemented | Full CRUD |
| Vendor enable/disable | ✅ Implemented | Soft toggle without deletion |
| Vendor-product linking | ✅ Implemented | Associate vendors with products via VendorProduct join table |
| Vendor pricing | ✅ Implemented | Price, shipping cost, shipping included flag, total price |

### 5.3 Brands

| Feature | Status | Description |
|---------|--------|-------------|
| Brand listing | ✅ Implemented | Admin panel brand management |
| Brand CRUD | ✅ Implemented | Name, logo URL, website, country |
| Brand-product association | ✅ Implemented | Each product can have one brand |

### 5.4 Categories

| Feature | Status | Description |
|---------|--------|-------------|
| Category listing | ✅ Implemented | Admin panel category management |
| Category CRUD | ✅ Implemented | Name, icon, slug |
| Category-product association | ✅ Implemented | Each product belongs to one category |
| Seed categories | ✅ Implemented | Keyboards, Switches, Keycaps, Desk Pads seeded via `prisma/seed.ts` |

### 5.5 Collections & Wishlists

| Feature | Status | Description |
|---------|--------|-------------|
| Add to Wishlist | ✅ Implemented | Toggle via server action |
| Add to Collection | ✅ Implemented | Toggle via server action |
| Remove from Wishlist | ✅ Implemented | From profile page |
| Remove from Collection | ✅ Implemented | From profile page |
| Profile display | ✅ Implemented | Wishlist and Collection tabs on profile page |

### 5.6 Profiles

| Feature | Status | Description |
|---------|--------|-------------|
| Auto-profile creation | ✅ Implemented | Created on first login (email or OAuth) |
| Profile page | ✅ Implemented | `/profile/[username]` with identicon, stats, tabs |
| Profile editing | ✅ Implemented | Display name, bio, social links |
| Social links | ✅ Implemented | GitHub, Discord, Reddit, MonkeyType, Website |
| Vote credits | ✅ Implemented | 25 credits default per profile |
| Rank system | ✅ Implemented | Newbie, Member, Contributor, Expert, Elite (based on reputation) |

### 5.7 Voting

| Feature | Status | Description |
|---------|--------|-------------|
| Upvote/downvote | ✅ Implemented | One vote per user per product |
| Vote toggle | ✅ Implemented | Click same vote to remove, click opposite to switch |
| Vote display | ✅ Implemented | Upvote/downvote counts on product cards and detail pages |
| Approval rating | ✅ Implemented | Percentage shown when total votes >= 10 |
| Admin vote management | ✅ Implemented | Reset votes, remove individual votes |

### 5.8 Price History

| Feature | Status | Description |
|---------|--------|-------------|
| Price recording | ✅ Implemented | PriceHistory model tracks every price change |
| Price chart | ✅ Implemented | SVG-based interactive chart with range selector (7D, 30D, 90D, ALL) |
| Crosshair tooltip | ✅ Implemented | Hover to see price, date, and vendor |
| Lowest price highlight | ✅ Implemented | Green border on lowest-price vendor card |

### 5.9 Community Contributions

| Feature | Status | Description |
|---------|--------|-------------|
| Admin panel community section | ✅ Implemented | Dashboard shows pending contributions (currently 0) |
| Vote management | ✅ Implemented | Admin can reset/remove votes |
| TODO: User submissions | 🔲 Pending | Users submit products/prices for admin review |
| TODO: Edit suggestions | 🔲 Pending | Users suggest edits to existing products |

### 5.10 Group Buys

| Feature | Status | Description |
|---------|--------|-------------|
| External link | ✅ Implemented | Links to `keydir.in/groupbuy/` |
| TODO: In-app tracking | 🔲 Pending | Track group buy status, deadlines, vendors |
| TODO: Group buy alerts | 🔲 Pending | Notify users of new group buys |

### 5.11 Search

| Feature | Status | Description |
|---------|--------|-------------|
| Global search | ✅ Implemented | `/api/search` — searches products, vendors, brands |
| Nav search bar | ✅ Implemented | Expandable search in navbar with dropdown results |
| Min 2 characters | ✅ Implemented | Debounced search with minimum query length |
| Category grouping | ✅ Implemented | Results grouped by type (Products, Vendors, Brands) |

### 5.12 Filters

| Feature | Status | Description |
|---------|--------|-------------|
| Keyboard filters | ✅ Implemented | Layout, case material, mount type, connectivity, PCB type, keyboard type, plate material, RGB, switch compatibility, vendors, availability, price range |
| Switch filters | ✅ Implemented | Type, sound, feel, spring weight range, factory lubed, manufacturers |
| Keycap filters | ✅ Implemented | Profile, material, manufacture method, language |
| Mouse filters | ✅ Implemented | Connectivity, DPI, weight, brand |
| Filter modal | ✅ Implemented | Slide-out filter panel with checkbox groups |
| Sort options | ✅ Implemented | Lowest price, highest price, newest, most upvoted, most vendors |
| URL-based filters | ✅ Implemented | Filters reflected in URL search params |

### 5.13 Admin Panel

| Feature | Status | Description |
|---------|--------|-------------|
| Dashboard | ✅ Implemented | System overview with stats, quick actions, activity feed |
| Products CRUD | ✅ Implemented | Full create/read/update/delete with specs and vendor products |
| Vendors CRUD | ✅ Implemented | Full create/read/update/delete with enable/disable toggle |
| Brands CRUD | ✅ Implemented | Full create/read/update/delete |
| Categories CRUD | ✅ Implemented | Full create/read/update/delete |
| Banners CRUD | ✅ Implemented | Full create/read/update/delete with location targeting, scheduling |
| Users list | ✅ Implemented | View registered users |
| Votes management | ✅ Implemented | View and manage votes |
| Community moderation | ✅ Implemented | Reset votes, remove votes |
| Settings page | ✅ Implemented | Placeholder for site configuration |
| Sidebar navigation | ✅ Implemented | Sticky sidebar with all admin sections |

### 5.14 Banner System

| Feature | Status | Description |
|---------|--------|-------------|
| Hero banners | ✅ Implemented | Full-width carousel on homepage and category pages |
| Inline banners | ✅ Implemented | Inline placement within page content |
| Location targeting | ✅ Implemented | Place banners on specific pages (home, keyboards, switches, etc.) |
| Scheduling | ✅ Implemented | Start date and end date for auto-activation |
| Display rules | ✅ Implemented | Desktop only, mobile only, or both |
| Link types | ✅ Implemented | External URL, internal route, vendor, product, category |
| Priority ordering | ✅ Implemented | Lower priority number = shown first |
| Duplicate banner | ✅ Implemented | Clone existing banner as draft |
| Image upload | ✅ Implemented | Upload banner images to `/public/uploads/banners/` |

### 5.15 Authentication

| Feature | Status | Description |
|---------|--------|-------------|
| Email/password login | ✅ Implemented | Via Supabase Auth |
| Email/password registration | ✅ Implemented | Auto-creates Profile row |
| Google OAuth | ✅ Implemented | Via Supabase Auth provider |
| Discord OAuth | ✅ Implemented | Via Supabase Auth provider |
| OAuth callback | ✅ Implemented | `/auth/callback` route exchanges code, creates profile |
| Password reset | ✅ Implemented | Forgot password flow with email redirect |
| Email verification | ✅ Implemented | Account created confirmation page |
| Logout | ✅ Implemented | Server action |

---

## 6. User Stories

### Visitor

| ID | Story | Priority |
|----|-------|----------|
| V-01 | As a visitor, I want to browse keyboards by category so I can discover products | High |
| V-02 | As a visitor, I want to search for a product by name so I can find it quickly | High |
| V-03 | As a visitor, I want to compare prices across vendors on a product page | High |
| V-04 | As a visitor, I want to view price history so I know if a deal is good | High |
| V-05 | As a visitor, I want to filter products by specs (layout, switch type, etc.) | High |
| V-06 | As a visitor, I want to sort by lowest price to find the cheapest option | Medium |
| V-07 | As a visitor, I want to see which vendors have a product in stock | Medium |
| V-08 | As a visitor, I want to see vendor warnings (e.g., slow shipping) | Medium |

### Registered User

| ID | Story | Priority |
|----|-------|----------|
| R-01 | As a user, I want to upvote/downvote products so the community benefits | High |
| R-02 | As a user, I want to save products to my wishlist for later | Medium |
| R-03 | As a user, I want to add products to my collection to show what I own | Medium |
| R-04 | As a user, I want to edit my profile with bio and social links | Medium |
| R-05 | As a user, I want to see my voting history on my profile | Low |

### Admin

| ID | Story | Priority |
|----|-------|----------|
| A-01 | As an admin, I want to add new products with specs and vendor pricing | High |
| A-02 | As an admin, I want to manage vendors (enable/disable, edit details) | High |
| A-03 | As an admin, I want to create banners for promotions on specific pages | Medium |
| A-04 | As an admin, I want to view system health and recent activity | Medium |
| A-05 | As an admin, I want to moderate votes if manipulation is detected | Medium |
| A-06 | As an admin, I want to manage site settings | Low |

---

## 7. Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Products listed | 500+ | Database count |
| Vendors listed | 30+ | Database count |
| Monthly active users | 1,000+ | Analytics |
| Products with 3+ vendor prices | 60% | Database query |
| Average page load time | < 2s | Lighthouse |
| Community votes per month | 500+ | Database count |
| Search usage | 40% of sessions | Analytics |
| Bounce rate | < 50% | Analytics |

---

## 8. Future Roadmap

### Phase 1 — Foundation (Current)
- Authentication (email/password, OAuth)
- Product browsing with category pages
- Price comparison and vendor listings
- Admin panel for data management
- Voting system
- Search and filtering

### Phase 2 — Community
- User-submitted products (pending admin review)
- User-submitted price updates
- Edit suggestions for existing products
- Community reputation system
- Contributor leaderboards

### Phase 3 — Intelligence
- Price drop alerts (email notifications)
- Price prediction based on history
- Vendor reliability scores
- Automated price scraping from vendor sites
- Stock availability notifications

### Phase 4 — Social
- User reviews and ratings
- Build showcase (share your keyboard)
- Discussion threads on products
- Group buy tracking and alerts
- Vendor messaging system

### Phase 5 — Platform
- API for third-party integrations
- Mobile app (React Native or PWA)
- Browser extension for price comparison
- Vendor dashboard (self-service product management)
- Multi-language support

---

## 9. Non-Goals

| Non-Goal | Reason |
|----------|--------|
| E-commerce / direct sales | KEYDIR is a directory, not a store |
| Affiliate links | Conflicts with unbiased mission |
| Advertising | Conflicts with unbiased mission |
| International vendor coverage | India-first focus |
| Real-time chat | Out of scope for directory |
| User-to-user marketplace | Out of scope for directory |
| Custom keyboard configurator | Out of scope, exists elsewhere |
| Inventory management for vendors | Vendor's responsibility |

---

## 10. Technical Constraints

| Constraint | Detail |
|------------|--------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript (strict mode) |
| Database | PostgreSQL via Prisma 7.8 |
| Auth | Supabase Auth (email/password + OAuth) |
| Styling | Tailwind CSS 4 + custom CSS variables (design tokens) |
| Hosting | Vercel (assumed) |
| Runtime | Node.js |
| Fonts | Space Grotesk (display) + JetBrains Mono (monospace) |
