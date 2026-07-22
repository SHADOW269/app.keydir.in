# KeyDir

A community-driven directory of mechanical keyboards, switches, keycaps, and peripherals available in India. Compare prices across vendors, track price history, and discover the best deals.

## Features

- **Product Catalog** — Keyboards, switches, keycaps, and mice with detailed specs
- **Price Comparison** — Compare prices across multiple Indian vendors
- **Price History** — Track price changes over time with interactive charts
- **Vendor Management** — Vendor profiles with scraper support for automated price updates
- **Community Voting** — Upvote/downvote products, wishlists, and collections
- **Admin Dashboard** — Full CRUD for products, vendors, brands, banners, and users
- **Authentication** — Email/password and OAuth (Google, Discord) via Supabase
- **Banner System** — Scheduled announcements with location targeting
- **Product Comparison** — Side-by-side spec comparison
- **Dark/Light Theme** — Cyberpunk-industrial aesthetic with theme toggle

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16 | React framework (App Router) |
| React | 19 | UI library |
| TypeScript | 5 | Type safety |
| Prisma | 7 | ORM |
| PostgreSQL | — | Database (via Supabase) |
| Supabase | — | Authentication + hosting |
| Tailwind CSS | 4 | Styling |
| Zod | 4 | Validation |
| Cloudinary | — | Image uploads |
| Cheerio / Playwright | — | Price scraping |

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── admin/              # Admin dashboard pages
│   ├── api/                # API routes
│   ├── auth/               # Authentication pages
│   ├── keyboards/          # Keyboard category page
│   ├── switches/           # Switch category page
│   ├── keycaps/            # Keycap category page
│   ├── mouse/              # Mouse category page
│   ├── products/           # Product detail pages
│   ├── profile/            # User profile pages
│   └── compare/            # Product comparison
├── components/             # React components
│   ├── admin/              # Admin panel components
│   ├── product/            # Product display components
│   ├── banner/             # Banner components
│   ├── auth/               # Authentication components
│   ├── layout/             # Layout (navbar, footer)
│   ├── profile/            # Profile components
│   └── shared/             # Shared/reusable components
├── lib/                    # Utility functions and services
│   ├── admin/              # Admin server actions
│   ├── auth/               # Authentication helpers
│   ├── scraper/            # Price scraping logic
│   ├── services/           # Business logic services
│   └── supabase/           # Supabase client setup
└── types/                  # TypeScript type definitions
prisma/
├── schema.prisma           # Database schema
├── seed.ts                 # Database seed script
└── migrations/             # Database migrations
public/
├── logos/                  # Static logos
└── uploads/                # User-uploaded images (gitignored)
docs/                       # Project documentation
```

## Requirements

- Node.js 18+
- npm
- PostgreSQL database (via Supabase)
- Cloudinary account (for image uploads)

## Local Development Setup

### 1. Clone the repository

```bash
git clone https://github.com/your-org/app.keydir.in.git
cd app.keydir.in
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create `.env.local`

Copy the example and fill in your values:

```bash
cp .env.example .env.local
```

See [Environment Variables](#environment-variables) below for details on each variable.

### 4. Set up the database

**Option A: Remote Supabase (recommended)**

1. Create a project at [supabase.com](https://supabase.com)
2. Copy the connection string from Settings > Database
3. Set `DATABASE_URL` in `.env.local`

**Option B: Local PostgreSQL**

Ensure PostgreSQL is running locally and set `DATABASE_URL` accordingly.

### 5. Run Prisma migrations

```bash
npx prisma generate
npx prisma migrate dev
```

> Use `migrate dev` during development (creates migration files). Use `db push` only for quick prototyping (no migration files).

### 6. Seed the database

```bash
npx prisma db seed
```

This populates initial brands, vendors, and sample products.

### 7. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DATABASE_URL` | Yes | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous/public key | `eyJhbG...` |
| `NEXT_PUBLIC_APP_URL` | Yes | App base URL for OAuth redirects | `http://localhost:3000` |
| `ADMIN_EMAILS` | Yes | Comma-separated admin email addresses | `admin@example.com` |
| `CLOUDINARY_CLOUD_NAME` | Yes | Cloudinary cloud name | `your-cloud` |
| `CLOUDINARY_API_KEY` | Yes | Cloudinary API key | `123456789` |
| `CLOUDINARY_API_SECRET` | Yes | Cloudinary API secret | `your-secret` |
| `DELETE_PASSWORD` | No | Password required for delete operations | `your-password` |
| `CRON_SECRET` | No | Bearer token for cron job authentication | `your-secret` |
| `NEXT_PUBLIC_ADMIN_EMAILS` | No | Public admin emails (for client-side UI) | `admin@example.com` |
| `SCRAPER_DEBUG` | No | Enable scraper debug logging | `true` |

## Cloudinary Setup

1. Create a free account at [cloudinary.com](https://cloudinary.com)
2. Go to the Dashboard to find:
   - **Cloud Name** → `CLOUDINARY_CLOUD_NAME`
   - **API Key** → `CLOUDINARY_API_KEY`
   - **API Secret** → `CLOUDINARY_API_SECRET`
3. Image uploads go through `/api/upload` and are stored in your Cloudinary media library
4. Product and banner images are uploaded via the admin panel

## Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Go to Settings > API to find:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **Anon Public Key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Enable Auth providers (Email/Password, Google, Discord) in Authentication > Providers
4. Configure OAuth redirect URLs to point to your app's `/auth/callback`

Supabase is used for **authentication only**. All data queries go through Prisma/PostgreSQL directly.

## Deployment

### Vercel

1. Push to GitHub
2. Import the repository in [vercel.com](https://vercel.com)
3. Set all environment variables in the Vercel dashboard
4. Deploy — Vercel auto-detects Next.js

**Build settings:**
- Build Command: `npm run build`
- Install Command: `npm install`

**Prisma on Vercel:**
- `prisma generate` runs automatically as a `postinstall` script
- Migrations should be run locally before deploying, or via a CI/CD step

**Cron jobs:**
- `vercel.json` configures a cron job at `/api/cron/update-prices` (runs every 6 hours)
- Requires `CRON_SECRET` to be set in Vercel environment variables

## Database

The database uses PostgreSQL via Prisma ORM. Key models:

- **Product** — Core product with name, slug, type, and SEO fields
- **Brand** — Product brand/manufacturer
- **Vendor** — Store/vendor with website and scraper config
- **VendorProduct** — Links vendors to products with pricing, availability, and scraper tracking
- **PriceHistory** — Historical price records for each vendor product
- **KeyboardSpec / SwitchSpec / KeycapSpec / MouseSpec** — Category-specific specifications
- **Vote** — Community upvotes/downvotes
- **Banner** — Scheduled promotional banners
- **Profile** — User profiles with social links and reputation
- **Contribution / Badge / UserXP** — Community reputation system

See `prisma/schema.prisma` for the full schema.

## Building for Production

```bash
npm run build
npm start
```

The app starts on port 3000 by default.

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |

## Troubleshooting

**Prisma Client out of date**

After pulling new migrations:

```bash
npx prisma generate
npx prisma migrate dev
```

**Cloudinary upload failures**

- Verify `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` are set correctly
- Check your Cloudinary account storage limits

**Supabase connection issues**

- Ensure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` match your Supabase project
- Verify the database is accessible from your network

**Build failures**

- Run `npx prisma generate` to regenerate the Prisma client
- Clear the `.next` cache: `rm -rf .next`
- Ensure all environment variables are set

**Scraper not working**

- Set `SCRAPER_DEBUG=true` to enable verbose logging
- Check vendor scraper configuration in the admin panel
- Some sites may require Playwright (`scraperEngine: "playwright"`) instead of Cheerio

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes (`git commit -m 'Add my feature'`)
4. Push to the branch (`git push origin feature/my-feature`)
5. Open a Pull Request

See `docs/Rules.md` for coding conventions.

## License

Private — All rights reserved.
