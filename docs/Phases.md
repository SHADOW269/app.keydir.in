# KEYDIR — Development Phases

> **Version:** 1.0
> **Last Updated:** 2026-07-14

---

## Phase 1: Authentication ✅

### Goals
- User registration with email/password
- User login with email/password
- OAuth login (Google, Discord)
- Password reset flow
- Auto-profile creation on first login
- Session management via Supabase Auth

### Files Involved
- `src/lib/auth/actions.ts`
- `src/lib/supabase/server.ts`
- `src/lib/supabase/client.ts`
- `src/app/auth/login/page.tsx`
- `src/app/auth/forgot-password/page.tsx`
- `src/app/auth/reset-password/page.tsx`
- `src/app/auth/verify-email/page.tsx`
- `src/app/auth/account-created/page.tsx`
- `src/app/auth/callback/route.ts`
- `src/components/auth/auth-layout.tsx`
- `src/components/auth/auth-terminal.tsx`
- `src/components/auth/social-buttons.tsx`
- `src/components/layout/navbar.tsx` (auth state)

### Checklist
- [x] Email/password registration
- [x] Email/password login
- [x] Google OAuth
- [x] Discord OAuth
- [x] OAuth callback handler
- [x] Auto-profile creation
- [x] Password reset flow
- [x] Logout
- [x] Navbar auth state (login/profile dropdown)

### Acceptance Criteria
- Users can register with email/password
- Users can log in with email/password, Google, or Discord
- A Profile record is automatically created on first login
- Password reset sends email with reset link
- Session persists across page reloads
- Logout clears session and redirects to homepage

### Dependencies
- Supabase project with Auth enabled
- Google OAuth provider configured in Supabase
- Discord OAuth provider configured in Supabase
- `ADMIN_EMAILS` env var for admin access

---

## Phase 2: Products ✅

### Goals
- Product listing pages by category
- Product detail page with full information
- Admin CRUD for products
- Slug-based URLs for SEO
- Dynamic metadata per product

### Files Involved
- `src/app/keyboards/page.tsx`, `content.tsx`
- `src/app/switches/page.tsx`, `content.tsx`
- `src/app/keycaps/page.tsx`, `content.tsx`
- `src/app/mouse/page.tsx`, `content.tsx`
- `src/app/products/[slug]/page.tsx`
- `src/app/admin/products/page.tsx`
- `src/app/admin/products/new/page.tsx`
- `src/app/admin/products/[id]/page.tsx`
- `src/components/admin/product-form.tsx`
- `src/components/product/product-card.tsx`
- `src/components/product/spec-table.tsx`
- `src/components/product/vendor-card.tsx`
- `src/lib/admin/actions.ts`
- `src/app/api/products/route.ts`
- `prisma/schema.prisma` (Product, SpecField, Specification models)

### Checklist
- [x] Product listing with category filter
- [x] Product detail page
- [x] Admin product creation
- [x] Admin product editing
- [x] Admin product deletion
- [x] Slug-based routing
- [x] Dynamic metadata
- [x] Brand and category associations
- [x] Flexible specification system (EAV pattern)
- [x] Category-specific pages with dedicated filter modals

### Acceptance Criteria
- Products are listed on category pages with filtering and sorting
- Product detail page shows image, specs, vendors, price history
- Admin can create, edit, and delete products
- Each product has a unique slug URL
- Page metadata is dynamically generated per product

### Dependencies
- Phase 1 (Authentication for admin access)
- Database models: Product, Brand, Category, SpecField, Specification

---

## Phase 3: Vendors ✅

### Goals
- Vendor listing and management
- Vendor-product association with pricing
- Stock status tracking
- Vendor enable/disable toggle

### Files Involved
- `src/app/admin/vendors/page.tsx`
- `src/app/admin/vendors/new/page.tsx`
- `src/app/admin/vendors/[id]/page.tsx`
- `src/components/admin/vendor-form.tsx`
- `src/components/product/vendor-card.tsx`
- `src/components/product/price-table.tsx`
- `src/lib/admin/actions.ts` (createVendor, updateVendor, toggleVendor, deleteVendor, createVendorProduct, deleteVendorProduct)
- `prisma/schema.prisma` (Vendor, VendorProduct models)

### Checklist
- [x] Vendor CRUD in admin panel
- [x] Vendor enable/disable toggle
- [x] Vendor-product linking with pricing
- [x] Price, shipping cost, total price calculation
- [x] Stock status (in_stock, preorder, group_buy, coming_soon, out_of_stock)
- [x] lastChecked timestamp
- [x] Unique constraint on vendor+product combination

### Acceptance Criteria
- Admin can create, edit, delete, and enable/disable vendors
- Admin can link vendors to products with pricing data
- Price comparison shows multiple vendors per product
- Lowest price is highlighted

### Dependencies
- Phase 2 (Products must exist to link vendors)

---

## Phase 4: Brands ✅

### Goals
- Brand listing and management
- Brand-product association
- Brand logos and websites

### Files Involved
- `src/app/admin/brands/page.tsx`
- `src/app/admin/brands/new/page.tsx`
- `src/app/admin/brands/[id]/page.tsx`
- `src/components/admin/brand-form.tsx`
- `src/lib/admin/actions.ts` (createBrand, updateBrand, deleteBrand)
- `prisma/schema.prisma` (Brand model)

### Checklist
- [x] Brand CRUD in admin panel
- [x] Brand name, logo URL, website, country
- [x] Brand-product association (optional)
- [x] Slug-based brand URLs

### Acceptance Criteria
- Admin can create, edit, and delete brands
- Products can be optionally associated with a brand
- Brand information is displayed on product cards and detail pages

### Dependencies
- None (can be developed independently)

---

## Phase 5: Categories ✅

### Goals
- Category listing and management
- Category-product association
- Seed data for initial categories

### Files Involved
- `src/app/admin/categories/page.tsx`
- `src/app/admin/categories/new/page.tsx`
- `src/app/admin/categories/[id]/page.tsx`
- `src/components/admin/category-form.tsx`
- `src/lib/admin/actions.ts` (createCategory, updateCategory, deleteCategory)
- `prisma/schema.prisma` (Category model)
- `prisma/seed.ts`

### Checklist
- [x] Category CRUD in admin panel
- [x] Category name, icon, slug
- [x] Seed script creates initial categories
- [x] Category-product association (required)

### Acceptance Criteria
- Admin can create, edit, and delete categories
- Every product must belong to a category
- Seed script initializes 4 core categories (Keyboards, Switches, Keycaps, Desk Pads)

### Dependencies
- None (can be developed independently)

---

## Phase 6: Voting ✅

### Goals
- Upvote/downvote products
- Vote toggle (click to remove, click opposite to switch)
- Approval rating calculation
- Admin vote management

### Files Involved
- `src/lib/profile/actions.ts` (voteOnProduct)
- `src/lib/admin/community-actions.ts` (resetProductVotes, removeVote)
- `src/components/product/vote-widget.tsx`
- `src/app/admin/votes/page.tsx`
- `src/app/admin/community/page.tsx`
- `src/app/api/votes/route.ts` (placeholder)
- `prisma/schema.prisma` (Vote model)

### Checklist
- [x] Upvote/downvote toggle
- [x] One vote per user per product
- [x] Vote display on product cards
- [x] Vote display on product detail pages
- [x] Approval rating (when votes >= 10)
- [x] Admin can reset all votes for a product
- [x] Admin can remove individual votes

### Acceptance Criteria
- Authenticated users can upvote or downvote a product
- Clicking the same vote type removes the vote
- Clicking the opposite type switches the vote
- Vote counts are displayed on product cards and detail pages
- Approval percentage is shown when total votes >= 10

### Dependencies
- Phase 1 (Authentication)
- Phase 2 (Products must exist to vote on)

---

## Phase 7: Collections ✅

### Goals
- Wishlist management
- Collection management
- Profile page display

### Files Involved
- `src/lib/profile/actions.ts` (toggleWishlist, toggleCollection, removeFromWishlist, removeFromCollection)
- `src/components/product/save-buttons.tsx`
- `src/components/profile/profile-tabs.tsx`
- `src/app/profile/[username]/page.tsx`
- `prisma/schema.prisma` (Wishlist, Collection models)

### Checklist
- [x] Toggle wishlist from product pages
- [x] Toggle collection from product pages
- [x] Display wishlist on profile page
- [x] Display collection on profile page
- [x] Remove items from wishlist/collection on profile page
- [x] Unique constraint (one entry per user per product)

### Acceptance Criteria
- Users can add/remove products from wishlist and collection
- Profile page displays wishlist and collection in separate tabs
- Users can remove items from their own wishlist/collection

### Dependencies
- Phase 1 (Authentication)
- Phase 2 (Products must exist to save)

---

## Phase 8: Profiles ✅

### Goals
- Auto-profile creation
- Profile page with identicon
- Profile editing (display name, bio, social links)
- Reputation/rank system

### Files Involved
- `src/lib/profile/actions.ts` (ensureProfile, getProfileByUsername, getCurrentUser, updateProfile, getMyProfileUsername, isAuthenticated)
- `src/app/profile/[username]/page.tsx`
- `src/components/profile/profile-tabs.tsx`
- `src/components/profile/profile-edit-form.tsx`
- `src/components/profile/identicon.tsx`
- `prisma/schema.prisma` (Profile model)

### Checklist
- [x] Auto-profile creation on first login
- [x] Profile page with identicon
- [x] Profile editing
- [x] Social links (GitHub, Discord, Reddit, MonkeyType, Website)
- [x] Vote credits system (25 default)
- [x] Rank system (Newbie → Member → Contributor → Expert → Elite)
- [x] Member since date display

### Acceptance Criteria
- Profile is created automatically on first login
- Profile page shows identicon, display name, bio, social links
- Users can edit their own profile
- Rank is determined by reputation score

### Dependencies
- Phase 1 (Authentication)

---

## Phase 9: Admin Dashboard ✅

### Goals
- System overview with stats
- Quick action cards
- Recent activity feed
- System health panel
- Moderation queue

### Files Involved
- `src/app/admin/layout.tsx`
- `src/app/admin/page.tsx`
- `src/app/admin/settings/page.tsx`

### Checklist
- [x] Dashboard with product, vendor, brand, category, user, vote counts
- [x] Quick action cards (add product, vendor, brand, category)
- [x] Recent activity feed (products, collections)
- [x] System health panel (database, storage, cron jobs, scraper status)
- [x] Pending moderation queue
- [x] Reports queue (placeholder)
- [x] Recent signups
- [x] Recent votes
- [x] Announcements panel
- [x] Admin sidebar navigation

### Acceptance Criteria
- Admin dashboard shows real-time stats
- Quick actions link to creation forms
- Activity feed shows recent products and collections
- System health shows operational status

### Dependencies
- Phase 1 (Authentication with admin check)

---

## Phase 10: Price History ✅

### Goals
- Price history recording on every price change
- Interactive SVG price chart
- Range selector (7D, 30D, 90D, ALL)
- Crosshair tooltip with price, date, vendor

### Files Involved
- `src/components/product/price-history-chart.tsx`
- `src/components/product/price-table.tsx`
- `src/lib/admin/actions.ts` (createVendorProduct — triggers price history)
- `prisma/schema.prisma` (PriceHistory model)

### Checklist
- [x] PriceHistory records created on VendorProduct upsert
- [x] SVG chart rendering
- [x] Range selector buttons
- [x] Crosshair with tooltip
- [x] Grid lines and axis labels
- [x] Area fill under line
- [x] Responsive chart height

### Acceptance Criteria
- Price chart shows historical price data for each vendor
- Users can select different time ranges
- Hovering shows exact price, date, and vendor name
- Chart is interactive and responsive

### Dependencies
- Phase 3 (Vendors with pricing)

---

## Phase 11: Community Contributions 🔲

### Goals
- User-submitted products (pending admin review)
- User-submitted price updates
- Edit suggestions for existing products
- Contribution history

### Files Involved
- `src/app/admin/community/page.tsx`
- `src/lib/admin/community-actions.ts`
- TODO: New contribution server actions
- TODO: New contribution forms
- TODO: Community contribution models in schema

### Checklist
- [ ] Contribution form for new products
- [ ] Contribution form for price updates
- [ ] Edit suggestion form for existing products
- [ ] Admin review queue
- [ ] Approve/reject with feedback
- [ ] Contributor reputation tracking
- [ ] Contribution history on profile

### Acceptance Criteria
- Users can submit new products for admin review
- Users can submit price updates
- Admin can review, approve, or reject submissions
- Contributors gain reputation for approved submissions

### Dependencies
- Phase 1 (Authentication)
- Phase 2 (Products)
- Phase 3 (Vendors)

---

## Phase 12: Moderation 🔲

### Goals
- Content moderation tools
- Report system
- User blocking
- Spam detection

### Files Involved
- `src/app/admin/community/page.tsx`
- TODO: Report model in schema
- TODO: Moderation actions
- TODO: Report submission form

### Checklist
- [ ] Report product (wrong info, spam, duplicate)
- [ ] Report vendor (broken link, scam)
- [ ] Report user (spam, abuse)
- [ ] Admin moderation queue
- [ ] Action taken logging
- [ ] User notification of report resolution

### Acceptance Criteria
- Users can report products, vendors, and users
- Admin sees reports in a queue
- Admin can take action (dismiss, warn, ban)
- Actions are logged for audit trail

### Dependencies
- Phase 1 (Authentication)
- Phase 11 (Community Contributions)

---

## Phase 13: Reports 🔲

### Goals
- Analytics dashboard for admins
- Traffic and engagement metrics
- Vendor performance reports
- Product popularity reports

### Files Involved
- TODO: Analytics components
- TODO: Report generation logic

### Checklist
- [ ] Page view tracking
- [ ] Search query tracking
- [ ] Vendor click-through tracking
- [ ] Product view tracking
- [ ] Admin analytics dashboard
- [ ] Export reports as CSV

### Acceptance Criteria
- Admin can view traffic and engagement metrics
- Admin can see which vendors and products are most popular
- Reports can be exported

### Dependencies
- Phase 9 (Admin Dashboard)

---

## Phase 14: Announcements 🔲

### Goals
- Banner management system
- Scheduled announcements
- Location-based banner display
- Banner analytics

### Files Involved
- `src/app/admin/banners/page.tsx`
- `src/app/admin/banners/new/page.tsx`
- `src/app/admin/banners/[id]/page.tsx`
- `src/components/admin/banner-form.tsx`
- `src/components/admin/banner-actions.tsx`
- `src/components/banner/hero-banner.tsx`
- `src/components/banner/inline-banner.tsx`
- `src/lib/admin/banner-actions.ts`
- `src/app/api/upload/route.ts`
- `prisma/schema.prisma` (Banner, BannerLocation models)

### Checklist
- [x] Banner CRUD
- [x] Location targeting
- [x] Scheduling (start/end dates)
- [x] Display rules (desktop/mobile/both)
- [x] Link types (URL, internal, vendor, product, category)
- [x] Priority ordering
- [x] Duplicate banner
- [x] Image upload
- [x] Hero banner carousel
- [x] Inline banner

### Acceptance Criteria
- Admin can create, edit, delete, and duplicate banners
- Banners display on targeted pages
- Banners respect scheduling and display rules
- Banner images can be uploaded

### Dependencies
- Phase 1 (Authentication for admin)

---

## Phase 15: Performance 🔲

### Goals
- Optimize page load times
- Implement caching
- Optimize database queries
- Image optimization

### Files Involved
- All page files
- API route files
- Prisma queries

### Checklist
- [ ] Implement ISR for static pages
- [ ] Add database query caching
- [ ] Optimize N+1 queries
- [ ] Add loading states for all pages
- [ ] Implement infinite scroll pagination
- [ ] Optimize bundle size
- [ ] Add performance monitoring
- [ ] Lighthouse score > 90

### Acceptance Criteria
- All pages load in < 2 seconds
- Lighthouse performance score > 90
- No layout shift (CLS < 0.1)
- First Contentful Paint < 1.5s

### Dependencies
- All previous phases

---

## Phase 16: SEO 🔲

### Goals
- Meta tags for all pages
- OpenGraph images
- Sitemap generation
- Structured data

### Files Involved
- All page files (metadata exports)
- TODO: `src/app/sitemap.ts`
- TODO: `src/app/robots.ts`

### Checklist
- [x] Dynamic metadata for product pages
- [x] OpenGraph tags
- [ ] Sitemap generation
- [ ] Robots.txt
- [ ] Structured data (JSON-LD)
- [ ] Canonical URLs
- [ ] Meta descriptions for all pages

### Acceptance Criteria
- All pages have unique title and description
- OpenGraph tags render correctly on social media
- Sitemap includes all public pages
- Structured data validates

### Dependencies
- Phase 2 (Products)

---

## Phase 17: Testing 🔲

### Goals
- Unit tests for critical functions
- Integration tests for API routes
- E2E tests for user flows

### Files Involved
- TODO: Test configuration
- TODO: Test files

### Checklist
- [ ] Test framework setup (Vitest or Jest)
- [ ] Unit tests for `src/lib/utils.ts`
- [ ] Unit tests for `src/lib/validations.ts`
- [ ] Integration tests for API routes
- [ ] E2E tests for auth flow
- [ ] E2E tests for product browsing
- [ ] E2E tests for admin CRUD
- [ ] Test coverage > 60%

### Acceptance Criteria
- All critical functions have unit tests
- API routes have integration tests
- User flows have E2E tests
- CI/CD runs tests on every commit

### Dependencies
- All previous phases

---

## Phase 18: Production 🔲

### Goals
- Production deployment
- Monitoring and alerting
- Backup strategy
- Documentation finalization

### Files Involved
- Vercel configuration
- Environment variables
- Database backups

### Checklist
- [ ] Production environment configured
- [ ] All environment variables set
- [ ] Database migrations applied
- [ ] Seed data loaded
- [ ] Monitoring configured
- [ ] Error tracking configured
- [ ] Backup schedule set
- [ ] Documentation reviewed and finalized
- [ ] README updated

### Acceptance Criteria
- Site is live at `app.keydir.in`
- All features work in production
- Monitoring catches errors
- Database is backed up daily
- Documentation is complete and accurate

### Dependencies
- All previous phases
