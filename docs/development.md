# Development Guide

## Prerequisites

- Node.js 20+
- npm 9+
- PostgreSQL 17 (via Supabase)
- Git

## Getting Started

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-org/app.keydir.in.git
   cd app.keydir.in
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Fill in the required values
   ```

4. **Run database migrations:**
   ```bash
   npx prisma migrate dev
   ```

5. **Seed the database:**
   ```bash
   npx prisma db seed
   ```

6. **Start the development server:**
   ```bash
   npm run dev
   ```

The app will be available at `http://localhost:3000`.

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## Project Structure

```
app.keydir.in/
├── prisma/
│   ├── schema.prisma      # Database schema
│   ├── seed.ts            # Seed data
│   └── migrations/        # Database migrations
├── src/
│   ├── app/               # Next.js App Router pages
│   │   ├── admin/         # Admin dashboard
│   │   ├── api/           # API routes
│   │   ├── auth/          # Authentication pages
│   │   ├── keyboards/     # Keyboard catalog
│   │   ├── keycaps/       # Keycaps catalog
│   │   ├── mouse/         # Mouse catalog
│   │   ├── products/      # Product pages
│   │   ├── profile/       # User profiles
│   │   └── switches/      # Switch catalog
│   ├── components/        # React components
│   │   ├── admin/         # Admin components
│   │   ├── auth/          # Auth components
│   │   ├── banner/        # Banner components
│   │   ├── compare/       # Compare components
│   │   ├── home/          # Homepage components
│   │   ├── layout/        # Layout components
│   │   ├── product/       # Product components
│   │   ├── profile/       # Profile components
│   │   ├── shared/        # Shared components
│   │   └── ui/            # UI components
│   ├── lib/               # Utility libraries
│   │   ├── admin/         # Admin server actions
│   │   ├── auth/          # Auth server actions
│   │   ├── scraper/       # Web scraping engine
│   │   ├── services/      # Business logic
│   │   ├── supabase/      # Supabase client setup
│   │   └── ...            # Other utilities
│   └── types/             # TypeScript types
├── docs/                  # Documentation
├── public/                # Static assets
└── supabase/              # Supabase configuration
```

## Development Workflow

### Creating a New Feature

1. Create a new branch: `git checkout -b feature/your-feature`
2. Make your changes following the coding rules in `docs/Rules.md`
3. Test your changes locally
4. Run `npm run lint` to check for errors
5. Commit with a descriptive message
6. Push and create a pull request

### Database Changes

1. Modify `prisma/schema.prisma`
2. Run `npx prisma migrate dev --name your-migration-name`
3. Update `docs/database.md` with the changes

### Adding New Components

1. Check existing components first
2. Place in the appropriate directory under `src/components/`
3. Follow the existing naming conventions

## Environment Variables

See `.env.example` for all required and optional environment variables.

## Testing

Currently, there are no automated tests. Manual testing is required.

## Code Style

- TypeScript strict mode
- ESLint with Next.js core-web-vitals
- Prettier (if configured)
- Follow existing code patterns

## Common Tasks

### Adding a New Product Category

1. Add the category to the `Product` model in `prisma/schema.prisma`
2. Create a new page under `src/app/[category]/`
3. Add API routes under `src/app/api/[category]/`
4. Create components under `src/components/[category]/`
5. Update the navigation and homepage

### Adding a New Admin Feature

1. Create the page under `src/app/admin/[feature]/`
2. Add server actions under `src/lib/admin/`
3. Create components under `src/components/admin/`
4. Update the admin dashboard

### Modifying the Scraper

1. Edit files in `src/lib/scraper/`
2. Test with `SCRAPER_DEBUG=true`
3. Check vendor configurations in the database

## Troubleshooting

See `docs/troubleshooting.md` for common issues and solutions.
