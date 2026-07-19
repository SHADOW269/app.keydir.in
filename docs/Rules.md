# KEYDIR — Coding Rules

> **Version:** 1.0
> **Last Updated:** 2026-07-14

These rules are mandatory for all contributions to KEYDIR. They are derived from the existing codebase conventions and must be followed without exception.

---

## Language & Runtime

| Rule | Detail |
|------|--------|
| **Always use TypeScript** | Every file must be `.ts` or `.tsx`. No `.js` files. |
| **Never use `any`** | Use proper types. If unsure, use `unknown` and narrow. |
| **Strict mode** | `tsconfig.json` has `strict: true`. Never disable it. |
| **ES2017 target** | Keep compatibility with the existing target. |

---

## Framework & ORM

| Rule | Detail |
|------|--------|
| **Always use Prisma ORM** | No raw SQL. No other ORMs. Prisma is the only data layer. |
| **Never use `any` with Prisma** | Use generated types (`Prisma.ProductWhereInput`, etc.). |
| **Always use Server Components** | Default to Server Components. Only add `'use client'` when interactivity is required. |
| **Use Server Actions** | For mutations (create, update, delete). Prefer over API routes for form submissions. |
| **Use API Routes** | For data fetching from client components (product listings, search, filters). |

---

## Component Rules

| Rule | Detail |
|------|--------|
| **Never duplicate components** | Before creating a new component, check if an equivalent exists. |
| **Reuse existing components** | Import and compose. Don't rebuild what's already built. |
| **Prefer composition** | Small, focused components composed together over monolithic ones. |
| **Follow existing naming** | Use the patterns already in the codebase (PascalCase for components, kebab for CSS classes). |
| **Colocate related files** | Keep admin forms in `components/admin/`, product components in `components/product/`, etc. |

---

## Styling Rules

| Rule | Detail |
|------|--------|
| **Never hardcode colors** | Always use CSS custom properties (`var(--yellow)`, `var(--green)`, etc.). |
| **Always use design tokens** | Reference `design-tokens.css` variables for spacing, fonts, borders, etc. |
| **Never create duplicate CSS** | Check `globals.css` and `design-tokens.css` before writing new styles. |
| **Follow existing design language** | The cyberpunk-industrial aesthetic with neo-brutalist shadows is intentional. |
| **Use Tailwind sparingly** | The project uses CSS classes primarily. Tailwind utility classes are used in admin/newer components only. |
| **No new CSS frameworks** | Tailwind CSS 4 is already installed. Do not add Bootstrap, Chakra, etc. |

---

## Validation Rules

| Rule | Detail |
|------|--------|
| **Always validate inputs** | Use Zod schemas for all user input validation. |
| **Use existing Zod schemas** | Check `src/lib/validations.ts` before creating new ones. |
| **Validate on server** | Server Actions and API Routes must validate before processing. |
| **Never trust client input** | Even if validated client-side, re-validate server-side. |

---

## Database Rules

| Rule | Detail |
|------|--------|
| **Never modify schema without docs** | Update `docs/Database.md` when changing `schema.prisma`. |
| **Use migrations** | Never manually alter the database. Use `prisma migrate`. |
| **Always update Memory.md** | After completing a feature, update `docs/Memory.md`. |
| **Cascade deletes** | Use `onDelete: Cascade` where appropriate (e.g., votes, specs, spec options). |
| **Index foreign keys** | Always add `@@index` for foreign key fields. |
| **Use cuid()** | Primary keys use `@default(cuid())`. Never use auto-increment. |
| **SpecField is the source of truth** | Never hardcode filter options, form fields, or spec display — always read from `SpecField` + `SpecOption`. |

---

## Performance Rules

| Rule | Detail |
|------|--------|
| **Keep pages performant** | Aim for < 2s load time. |
| **Optimize database queries** | Use `select` to fetch only needed fields. Avoid N+1 queries. |
| **Avoid unnecessary client rendering** | Server Components by default. Client only when needed. |
| **Use `take` and `select`** | Always limit query results. Never fetch entire tables. |
| **Lazy load heavy components** | Use `Suspense` boundaries for async data. |

---

## Security Rules

| Rule | Detail |
|------|--------|
| **Never expose secrets** | No API keys, passwords, or tokens in client-side code. |
| **Never log secrets** | Do not console.log environment variables. |
| **Always check auth** | Server Actions must verify authentication before mutations. |
| **Always check authorization** | Admin actions must verify admin email before processing. |
| **Sanitize user input** | Prevent XSS, SQL injection (Prisma helps, but validate anyway). |

---

## Route Rules

| Rule | Detail |
|------|--------|
| **Never break existing routes** | Check all references before modifying a route. |
| **Use slug-based URLs** | Products use `/products/[slug]`, profiles use `/profile/[username]`. |
| **Static routes for categories** | `/keyboards`, `/switches`, `/keycaps`, `/mouse`. |
| **Admin routes under `/admin/`** | All admin pages are nested under `/admin/`. |

---

## Documentation Rules

| Rule | Detail |
|------|--------|
| **Always update Memory.md** | After completing a feature, document what was done. |
| **Update Database.md** | When changing the schema. |
| **Update TODO.md** | When completing or discovering new tasks. |
| **No invented features** | Documentation must reflect what actually exists. |

---

## Git Rules

| Rule | Detail |
|------|--------|
| **Never commit secrets** | Check `.env` is in `.gitignore`. |
| **Never commit node_modules** | Verify `.gitignore` covers it. |
| **Descriptive commits** | Write clear, concise commit messages. |
| **One feature per commit** | Don't bundle unrelated changes. |

---

## Dependency Rules

| Rule | Detail |
|------|--------|
| **Do not introduce unnecessary dependencies** | Before adding a package, check if the functionality can be achieved with existing deps or stdlib. |
| **Current dependencies** | Next.js, React, Prisma, Supabase, Tailwind, Zod, lucide-react, next-themes, CVA, clsx, tailwind-merge. |
| **No UI component libraries** | Do not add shadcn/ui, Radix, Headless UI, etc. Build components using existing design tokens. |
| **No animation libraries** | Use CSS animations and transitions. Do not add Framer Motion, GSAP, etc. |
