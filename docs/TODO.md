# KEYDIR — TODO

> **Last Updated:** 2026-07-14

---

## High Priority

- [ ] Add Next.js middleware to protect `/admin/*` routes (check ADMIN_EMAILS)
- [ ] Community contributions system (Phase 11) — user-submitted products and prices
- [ ] Add `Contribution` model to schema for tracking user submissions
- [ ] Admin review queue for community submissions
- [ ] Add `reputation` field to Profile model
- [ ] Implement profile reputation scoring based on contributions

---

## Medium Priority

- [ ] Performance optimization (Phase 15)
  - [ ] Implement ISR for category pages
  - [ ] Add database query result caching
  - [ ] Optimize N+1 queries in product listings
  - [ ] Add loading skeleton states for all pages
  - [ ] Implement infinite scroll pagination properly
- [ ] SEO improvements (Phase 16)
  - [ ] Generate `sitemap.ts`
  - [ ] Create `robots.ts`
  - [ ] Add structured data (JSON-LD) for products
  - [ ] Add canonical URLs
  - [ ] Add meta descriptions for all pages
- [ ] Moderation/report system (Phase 12)
  - [ ] Add `Report` model to schema
  - [ ] Report submission form
  - [ ] Admin report review queue
- [ ] Banner image upload to cloud storage (current: local filesystem)
- [ ] Add `View` model for product page analytics
- [ ] Add `SearchLog` model for tracking search queries
- [ ] Implement proper loading states (Suspense boundaries)
- [ ] Add error boundaries for all routes
- [ ] Add admin authorization check to all admin server actions (currently only community-actions checks)

---

## Low Priority

- [ ] Testing setup (Phase 17)
  - [ ] Configure Vitest or Jest
  - [ ] Unit tests for `src/lib/utils.ts`
  - [ ] Unit tests for `src/lib/validations.ts`
  - [ ] Integration tests for API routes
  - [ ] E2E tests for auth flow
  - [ ] E2E tests for product browsing
- [ ] Analytics dashboard (Phase 13)
  - [ ] Page view tracking
  - [ ] Vendor click-through tracking
  - [ ] Admin analytics page
- [ ] Add `Notification` model for user notifications
- [ ] Full-text search index (PostgreSQL GIN)
- [ ] Implement `meta` JSON field on Product for extensible metadata
- [ ] Add price drop email notifications
- [ ] Add stock availability notifications
- [ ] Browser extension for price comparison
- [ ] Mobile app (React Native or PWA)
- [ ] Multi-language support

---

## Technical Debt

- [ ] Admin pages lack authorization middleware — any authenticated user can access `/admin/*`
- [ ] Banner images stored locally (`/public/uploads/banners/`) — ephemeral on Vercel
- [ ] `/api/votes/route.ts` is a placeholder — voting uses server actions
- [ ] `site-data.ts` contains hardcoded vendor/category data alongside database-driven data — potential sync issues
- [ ] Some admin server actions (createProduct, createVendor, etc.) don't check admin authorization
- [ ] No CSRF protection on server actions beyond Next.js built-in
- [ ] No rate limiting on API routes
- [ ] No image optimization for uploaded banners (no resizing/compression)

---

## Ideas

- [ ] Vendor self-service dashboard (vendors manage their own products/pricing)
- [ ] Group buy tracking with deadlines and status updates
- [ ] Build showcase (users share their keyboard builds)
- [ ] Product comparison tool (side-by-side)
- [ ] Price alert subscriptions (email when price drops)
- [ ] Keyboard configurator (select parts, see total price)
- [ ] Community wiki for keyboard guides
- [ ] Vendor reliability scoring based on community feedback
- [ ] Automated price scraping from vendor websites
- [ ] Integration with Indian keyboard Discord communities
- [ ] RSS feed for new products and price changes
- [ ] API for third-party integrations
- [ ] Keyboard sound test database
- [ ] Switch comparison tool (side-by-side specs)

---

## Bugs

| Bug | Description | Status |
|-----|-------------|--------|
| No admin middleware | Admin pages accessible to any authenticated user | Open |
| Banner upload is local | Uploaded banners lost on Vercel redeploy | Open |
| Votes API placeholder | `/api/votes` returns hardcoded JSON | Open |
| `site-data.ts` sync risk | Hardcoded vendor data may drift from database data | Open |

---

## Performance

| Task | Impact | Status |
|------|--------|--------|
| Add ISR for static pages | Faster page loads | Open |
| Optimize product listing queries | Faster category pages | Open |
| Add database connection pooling | Better concurrent performance | Open |
| Implement infinite scroll properly | Better UX for large listings | Open |
| Optimize bundle size | Faster initial load | Open |
| Add image optimization for uploads | Faster image loading | Open |
| Add caching headers | Reduced server load | Open |

---

## UI Improvements

| Task | Impact | Status |
|------|--------|--------|
| Add skeleton loading states | Better perceived performance | Open |
| Add error boundaries | Better error handling UX | Open |
| Improve mobile filter UX | Better mobile experience | Open |
| Add product image gallery | Better product pages | Open |
| Add vendor rating system | Better vendor trust | Open |
| Improve admin form validation UX | Better admin experience | Open |
| Add dark mode toggle animation | Smoother theme switching | Open |
| Add keyboard shortcuts | Power user features | Open |

---

## Completed

| Date | Task |
|------|------|
| 2026-07-14 | Documentation system created (PRD, Architecture, Rules, Phases, Design, Memory, Database, TODO) |
| 2026-07 | Price History chart (SVG, range selector, tooltips) |
| 2026-07 | Banner system (CRUD, scheduling, location targeting, image upload) |
| 2026-07 | Admin dashboard (stats, activity, health, moderation) |
| 2026-07 | Profile system (auto-creation, editing, social links, ranks) |
| 2026-07 | Collection/Wishlist system |
| 2026-07 | Voting system (upvote/downvote, toggle, approval rating) |
| 2026-07 | Category-specific filter modals (keyboard, switch, keycap, mouse) |
| 2026-07 | Global search (products, vendors, brands) |
| 2026-07 | Admin CRUD (products, vendors, brands, categories) |
| 2026-07 | Authentication (email/password, Google OAuth, Discord OAuth) |
| 2026-07 | Product detail pages with specs, vendors, pricing |
| 2026-07 | Category listing pages with filtering and sorting |
| 2026-07 | Homepage with hero, categories, stats, CTA |
| 2026-07 | Design system (tokens, themes, components) |
| 2026-07 | Database schema (16 models, indexes, constraints) |
