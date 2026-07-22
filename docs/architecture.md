# Architecture

## Overview

KeyDir is a Next.js 16 application using the App Router, Prisma 7 ORM, Supabase for authentication, and Cloudinary for image hosting. The architecture follows a server-first approach with Server Components by default.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Vercel Edge                          │
├─────────────────────────────────────────────────────────────┤
│                      Next.js App                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   Server    │  │   Client    │  │   API       │         │
│  │  Components │  │  Components │  │   Routes    │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
├─────────────────────────────────────────────────────────────┤
│                      Services Layer                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │    Auth     │  │   Scraper   │  │   Image     │         │
│  │   (Supabase)│  │  (Cheerio/  │  │(Cloudinary) │         │
│  │             │  │  Playwright) │  │             │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
├─────────────────────────────────────────────────────────────┤
│                      Data Layer                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   Prisma    │  │  PostgreSQL │  │   Redis     │         │
│  │    ORM      │  │  (Supabase) │  │   (Cache)   │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

## Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | Next.js 16, React 19 | UI framework |
| **Styling** | Tailwind CSS 4, CSS Modules | Styling |
| **Database** | PostgreSQL 17 | Data storage |
| **ORM** | Prisma 7 | Database access |
| **Auth** | Supabase Auth | User authentication |
| **Images** | Cloudinary | Image hosting |
| **Scraping** | Cheerio, Playwright | Price data collection |
| **Deployment** | Vercel | Hosting |

## Application Architecture

### Server Components (Default)

All components are Server Components by default. They run on the server and have direct access to:
- Database queries
- Environment variables
- Server-side APIs

```typescript
// src/app/page.tsx
export default async function HomePage() {
  const products = await prisma.product.findMany({
    take: 10,
    include: { brand: true }
  });
  
  return <ProductList products={products} />;
}
```

### Client Components (Interactive)

Only add `'use client'` when interactivity is needed:
- Form inputs
- State management
- Event handlers
- Browser APIs

```typescript
// src/components/ui/button.tsx
'use client';

export function Button({ onClick, children }) {
  return <button onClick={onClick}>{children}</button>;
}
```

### Server Actions (Mutations)

For data mutations, use Server Actions:

```typescript
// src/lib/admin/actions.ts
'use server';

export async function createProduct(formData: FormData) {
  const name = formData.get('name') as string;
  
  await prisma.product.create({
    data: { name, slug: slugify(name) }
  });
  
  revalidatePath('/admin/products');
}
```

### API Routes (Client Data Fetching)

For client-side data fetching:

```typescript
// src/app/api/products/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  
  const products = await prisma.product.findMany({
    where: { productType: category }
  });
  
  return NextResponse.json(products);
}
```

## Data Flow

### 1. Page Load (Server)

```
Request → Next.js Router → Server Component → Prisma Query → Database → Render HTML → Response
```

### 2. Client Interaction

```
User Action → Client Component → Server Action/API Route → Prisma Query → Database → Revalidate → Re-render
```

### 3. Background Jobs

```
Vercel Cron → API Route → Scraper → Vendor Website → Parse → Database Update
```

## Module Structure

### `src/app/` - Pages & Routes

```
app/
├── page.tsx                 # Homepage
├── layout.tsx               # Root layout
├── admin/                   # Admin dashboard
│   ├── page.tsx            # Admin home
│   ├── products/           # Product management
│   ├── vendors/            # Vendor management
│   └── ...
├── api/                     # API routes
│   ├── products/           # Product endpoints
│   ├── upload/             # Image upload
│   └── cron/               # Background jobs
├── auth/                    # Authentication pages
├── keyboards/               # Keyboard catalog
├── switches/                # Switch catalog
├── keycaps/                 # Keycap catalog
├── mouse/                   # Mouse catalog
├── products/                # Product pages
└── profile/                 # User profiles
```

### `src/components/` - UI Components

```
components/
├── admin/                   # Admin components
│   ├── dashboard/          # Dashboard widgets
│   └── hooks/              # Admin hooks
├── auth/                    # Auth forms
├── banner/                  # Banner components
├── compare/                 # Comparison tools
├── home/                    # Homepage sections
├── layout/                  # Layout components
├── product/                 # Product cards/details
├── profile/                 # Profile components
├── shared/                  # Shared utilities
└── ui/                      # Base UI components
```

### `src/lib/` - Business Logic

```
lib/
├── admin/                   # Admin server actions
├── auth/                    # Auth server actions
├── scraper/                 # Web scraping engine
│   ├── index.ts            # Main scraper
│   ├── cheerio.ts          # Static scraping
│   ├── playwright.ts       # Dynamic scraping
│   └── custom/             # Custom scrapers
├── services/                # Business logic
│   ├── image-service.ts    # Image operations
│   ├── pricing-service.ts  # Price calculations
│   └── product-service.ts  # Product operations
├── supabase/                # Supabase clients
│   ├── server.ts           # Server client
│   └── client.ts           # Browser client
├── prisma.ts                # Prisma client
├── cloudinary.ts           # Cloudinary config
└── ...                      # Other utilities
```

## Key Patterns

### 1. Prisma Client Singleton

```typescript
// src/lib/prisma.ts
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

### 2. Supabase SSR Client

```typescript
// src/lib/supabase/server.ts
export async function createClient() {
  const cookieStore = await cookies();
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), ... } }
  );
}
```

### 3. Server Action Pattern

```typescript
'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createAction(data: FormData) {
  // Validate
  const validated = schema.parse(Object.fromEntries(data));
  
  // Database operation
  await prisma.model.create({ data: validated });
  
  // Revalidate and redirect
  revalidatePath('/path');
  redirect('/path');
}
```

### 4. API Route Pattern

```typescript
export async function GET(request: Request) {
  try {
    const data = await fetchData();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
```

## Security Architecture

### Authentication Flow

```
User → Login Page → Supabase Auth → JWT Token → Cookie → Server Component → Profile Data
```

### Authorization

1. **Public Routes:** No auth required
2. **Protected Routes:** Require authenticated user
3. **Admin Routes:** Require admin email verification

### Data Validation

- **Client-side:** Zod schemas for form validation
- **Server-side:** Re-validate all inputs in Server Actions/API Routes

## Performance Architecture

### Caching Strategy

- **ISR:** Product pages revalidate every 60 seconds
- **Static:** Homepage, category pages
- **Dynamic:** Admin dashboard, user profiles

### Database Optimization

- **Indexes:** On frequently queried fields
- **Select:** Only fetch needed fields
- **Take:** Limit query results
- **Include:** Avoid N+1 queries

### Image Optimization

- **Cloudinary:** Auto-format, auto-quality
- **Next.js Image:** Responsive images, lazy loading
- **CDN:** Edge caching

## Monitoring & Observability

### Logging

- Server errors in Vercel logs
- Scraper logs with `SCRAPER_DEBUG=true`
- Database queries in development

### Metrics

- Vercel Analytics for Core Web Vitals
- Supabase Dashboard for database metrics
- Cloudinary Dashboard for image usage

## Scalability Considerations

### Horizontal Scaling

- Vercel auto-scales serverless functions
- Supabase handles database connections
- Cloudinary handles image delivery

### Database Scaling

- Connection pooling via Supabase
- Read replicas for heavy queries
- Archive old data (PriceHistory)

### Cost Optimization

- Lazy loading reduces initial load
- Image optimization reduces bandwidth
- Cron jobs run only when needed

## Troubleshooting

See `docs/troubleshooting.md` for common issues and solutions.
