# KEYDIR — Project Memory

> **Last Updated:** 2026-07-14
> **Current Phase:** Phase 10 Complete (Price History) + Spec Engine v2 Redesign
> **This file is the first thing AI assistants should read before continuing development.**

---

## Current Phase

**Phase 10: Price History ✅ Complete**

The project has completed the core feature phases (1-10). The next major work is community contributions (Phase 11), performance optimization (Phase 15), and SEO (Phase 16).

---

## Completed Features

| Phase | Feature | Status |
|-------|---------|--------|
| 1 | Authentication (Email/Password, Google, Discord OAuth) | ✅ |
| 2 | Products (CRUD, detail pages, category pages, specs) | ✅ |
| 3 | Vendors (CRUD, pricing, stock status) | ✅ |
| 4 | Brands (CRUD) | ✅ |
| 5 | Categories (CRUD, seed data) | ✅ |
| 6 | Voting (upvote/downvote, toggle, approval rating) | ✅ |
| 7 | Collections (Wishlist, Collection) | ✅ |
| 8 | Profiles (auto-creation, editing, social links, ranks) | ✅ |
| 9 | Admin Dashboard (stats, activity, health, moderation) | ✅ |
| 10 | Price History (SVG chart, range selector, tooltips) | ✅ |
| 14 | Announcements (Banner system with scheduling) | ✅ |

---

## Current Work

- Specification engine v2 redesign in progress (schema updated, documentation created)
- Schema: `SpecField` now has `inputType`, `required`, `filterable`, `searchable`, `comparable`, `groupOrder`, `defaultValue`, `validationRules`
- New model: `SpecOption` for select/multi_select options (replaces JSON `options` field)
- `SwitchData` and `KeycapData` marked as deprecated
- Next: Implement admin Specification Manager, dynamic product form, dynamic filter generation

---

## Pending Features

| Priority | Feature | Phase |
|----------|---------|-------|
| High | Community contributions (user-submitted products/prices) | 11 |
| High | Admin authorization middleware (protect admin routes) | — |
| Medium | Moderation/report system | 12 |
| Medium | Performance optimization (caching, ISR) | 15 |
| Medium | SEO (sitemap, robots.txt, structured data) | 16 |
| Medium | Testing setup | 17 |
| Low | Analytics/reports | 13 |
| Low | Production deployment finalization | 18 |

---

## Known Bugs

| Bug | Description | Status |
|-----|-------------|--------|
| No admin middleware | Admin pages are not protected by middleware — any logged-in user could potentially access `/admin/*` | Open |
| Votes API placeholder | `/api/votes/route.ts` returns placeholder JSON — voting uses server actions instead | Open |
| Banner image upload to local filesystem | Uploaded banners go to `/public/uploads/banners/` which is ephemeral on Vercel | Open |

---

## Database Decisions

| Decision | Rationale |
|----------|-----------|
| PostgreSQL via Supabase | Managed database with auth integration |
| PrismaPg adapter | Official Prisma adapter for PostgreSQL connection pooling |
| CUID primary keys | Non-sequential, URL-safe, collision-resistant |
| EAV pattern for specs | Flexible specification system — each category can define its own spec fields |
| SpecOption model | Proper rows for select/multi_select options (not JSON) — enables ordering, enable/disable, admin management |
| Dynamic filter generation | Filters auto-generated from `filterable: true` SpecFields — no hardcoded filter components per category |
| Deprecated SwitchData/KeycapData | Data migrated to EAV — single unified system for all categories |
| Decimal for prices | Precise monetary values with `@db.Decimal(10,2)` |
| Cascade deletes | Votes, specs, vendor products, wishlists, collections all cascade on product delete |
| Unique constraints | `@@unique([profileId, productId])` on Vote, Wishlist, Collection prevents duplicates |

---

## Design Decisions

| Decision | Rationale |
|----------|-----------|
| Cyberpunk-industrial aesthetic | Matches the technical, hands-on keyboard community culture |
| Zero border-radius | Sharp edges = industrial feel, consistent neo-brutalist design |
| Hard box shadows | No blur — pure offset shadows for that brutalist look |
| Space Grotesk + JetBrains Mono | Display + monospace pairing for terminal-inspired UI |
| CSS custom properties | Theme switching without runtime overhead |
| Design tokens in separate file | Single source of truth for all visual values |
| No UI component library | Full control over design, no bloat |
| `force-dynamic` on most pages | Avoids stale data — pages always fetch fresh data |

---

## API Decisions

| Decision | Rationale |
|----------|-----------|
| Server Actions for mutations | Simpler than API routes for form submissions |
| API Routes for data fetching | Client components need JSON endpoints |
| Zod for validation | Type-safe validation with good error messages |
| No client-side database access | All queries go through server — security |
| Supabase Auth for authentication | Managed auth with OAuth support |

---

## Current Routes

| Route | Type | Description |
|-------|------|-------------|
| `/` | Page | Homepage with hero, categories, stats, CTA |
| `/keyboards` | Page | Keyboard listing with filters |
| `/switches` | Page | Switch listing with filters |
| `/keycaps` | Page | Keycap listing with filters |
| `/mouse` | Page | Mouse listing with filters |
| `/products/[slug]` | Page | Product detail page |
| `/profile/[username]` | Page | User profile page |
| `/auth/login` | Page | Login page |
| `/auth/forgot-password` | Page | Password reset request |
| `/auth/reset-password` | Page | Password reset form |
| `/auth/verify-email` | Page | Email verification |
| `/auth/account-created` | Page | Post-registration |
| `/auth/callback` | Route | OAuth callback handler |
| `/admin` | Page | Admin dashboard |
| `/admin/products` | Page | Product management |
| `/admin/products/new` | Page | Create product |
| `/admin/products/[id]` | Page | Edit product |
| `/admin/vendors` | Page | Vendor management |
| `/admin/vendors/new` | Page | Create vendor |
| `/admin/vendors/[id]` | Page | Edit vendor |
| `/admin/brands` | Page | Brand management |
| `/admin/brands/new` | Page | Create brand |
| `/admin/brands/[id]` | Page | Edit brand |
| `/admin/categories` | Page | Category management |
| `/admin/categories/new` | Page | Create category |
| `/admin/categories/[id]` | Page | Edit category |
| `/admin/banners` | Page | Banner management |
| `/admin/banners/new` | Page | Create banner |
| `/admin/banners/[id]` | Page | Edit banner |
| `/admin/users` | Page | User listing |
| `/admin/votes` | Page | Vote management |
| `/admin/community` | Page | Community moderation |
| `/admin/settings` | Page | Site settings |
| `/api/products` | API | Product listing with filters |
| `/api/products/filters` | API | Filter options |
| `/api/switches` | API | Switch listing |
| `/api/switches/filters` | API | Switch filter options |
| `/api/keycaps` | API | Keycap listing |
| `/api/mouse` | API | Mouse listing |
| `/api/votes` | API | Placeholder |
| `/api/search` | API | Global search |
| `/api/upload` | API | Image upload |

---

## Important Components

| Component | File | Description |
|-----------|------|-------------|
| `Navbar` | `components/layout/navbar.tsx` | Main navigation with auth state, search, mobile menu |
| `Footer` | `components/layout/footer.tsx` | Site footer with links |
| `ProductCard` | `components/product/product-card.tsx` | Product card for listings |
| `VendorCard` | `components/product/vendor-card.tsx` | Vendor pricing card on product pages |
| `SpecTable` | `components/product/spec-table.tsx` | Specification display grouped by category |
| `VoteWidget` | `components/product/vote-widget.tsx` | Upvote/downvote buttons |
| `PriceHistoryChart` | `components/product/price-history-chart.tsx` | SVG price chart with interactivity |
| `SaveButtons` | `components/product/save-buttons.tsx` | Wishlist/Collection toggle |
| `FilterModal` | `components/product/filter-modal.tsx` | Keyboard filter slide-out panel |
| `HeroBanner` | `components/banner/hero-banner.tsx` | Banner carousel |
| `GlobalSearch` | `components/layout/global-search.tsx` | Nav search with dropdown |
| `AdminLayout` | `app/admin/layout.tsx` | Admin shell with sidebar |

---

## Recent Changes

| Date | Change |
|------|--------|
| 2026-07-14 | Specification engine v2 redesign (schema + documentation) |
| 2026-07-14 | Created comprehensive documentation system (PRD, Architecture, Rules, Phases, Design, Memory, Database, TODO) |

---

## Next Tasks

1. **Spec engine implementation** — Admin Specification Manager, dynamic product form, dynamic filter generation
2. **Admin middleware** — Add Next.js middleware to protect `/admin/*` routes (check admin email)
3. **Community contributions** (Phase 11) — User-submitted products and price updates
4. **Performance** (Phase 15) — Implement caching, optimize queries, add loading states
5. **SEO** (Phase 16) — Sitemap, robots.txt, structured data
6. **Testing** (Phase 17) — Set up Vitest/Jest, write tests

---

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXT_PUBLIC_APP_URL` | App base URL (for OAuth redirects) |
| `ADMIN_EMAILS` | Comma-separated list of admin email addresses |

---

## Tech Stack Summary

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16.2.10 | Framework |
| React | 19.2.4 | UI library |
| TypeScript | ^5 | Language |
| Prisma | 7.8.0 | ORM |
| PostgreSQL | — | Database |
| Supabase | ^2.110.2 | Auth + DB hosting |
| Tailwind CSS | 4 | Styling |
| Zod | 4.4.3 | Validation |
| lucide-react | 1.24.0 | Icons |
| next-themes | 0.4.6 | Dark/light mode |
| CVA | 0.7.1 | Component variants |
| clsx + tailwind-merge | — | Class utilities |
