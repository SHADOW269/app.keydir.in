# Deployment Guide

## Overview

KeyDir is deployed on Vercel with Supabase for authentication and PostgreSQL database.

## Prerequisites

- Vercel account
- Supabase project
- Cloudinary account
- GitHub repository

## Environment Variables

Set these in Vercel dashboard under **Settings > Environment Variables**:

### Required

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string from Supabase |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `NEXT_PUBLIC_APP_URL` | Production URL (e.g., `https://app.keydir.in`) |
| `ADMIN_EMAILS` | Comma-separated admin emails |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |

### Optional

| Variable | Description |
|----------|-------------|
| `DELETE_PASSWORD` | Password for product deletion |
| `CRON_SECRET` | Secret for cron job authentication |
| `NEXT_PUBLIC_ADMIN_EMAILS` | Admin emails (client-side) |
| `SCRAPER_DEBUG` | Enable scraper debug logging |

## Deployment Steps

### 1. Connect Repository

1. Go to Vercel dashboard
2. Click **Add New > Project**
3. Import your GitHub repository
4. Vercel auto-detects Next.js

### 2. Configure Environment Variables

1. In project settings, go to **Environment Variables**
2. Add all required variables
3. Set appropriate environments (Production, Preview, Development)

### 3. Deploy

1. Push to `main` branch triggers production deployment
2. Push to other branches creates preview deployments
3. Vercel auto-builds and deploys

### 4. Database Setup

1. Run migrations on production:
   ```bash
   npx prisma migrate deploy
   ```
2. Seed initial data if needed:
   ```bash
   npx prisma db seed
   ```

## Vercel Configuration

### vercel.json

```json
{
  "crons": [
    {
      "path": "/api/cron/update-prices",
      "schedule": "0 */6 * * *"
    }
  ]
}
```

This runs the price update cron job every 6 hours.

### Build Settings

- **Build Command:** `npm run build`
- **Output Directory:** `.next`
- **Install Command:** `npm install`

## Supabase Setup

### 1. Create Project

1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Note the project URL and keys

### 2. Configure Auth

1. Go to **Authentication > Providers**
2. Enable Email/Password
3. Enable Google OAuth (optional)
4. Enable Discord OAuth (optional)

### 3. Database

1. Go to **SQL Editor**
2. Run Prisma migrations or use `prisma migrate deploy`

## Cloudinary Setup

1. Create account at [cloudinary.com](https://cloudinary.com)
2. Get cloud name, API key, and API secret
3. Configure upload presets for:
   - Product images
   - Banner images
   - User avatars

## Custom Domain

1. In Vercel, go to **Settings > Domains**
2. Add your custom domain
3. Configure DNS records as shown
4. SSL is automatic

## Cron Jobs

### Price Update Job

- **Endpoint:** `/api/cron/update-prices`
- **Schedule:** Every 6 hours
- **Authentication:** Bearer token with `CRON_SECRET`
- **Function:** Scrapes vendor websites for price updates

### Manual Trigger

```bash
curl -X GET https://app.keydir.in/api/cron/update-prices \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

## Monitoring

### Vercel Analytics

- Enable in **Settings > Analytics**
- Monitor Core Web Vitals
- Track page performance

### Supabase Dashboard

- Monitor database performance
- Check auth logs
- Review API usage

## Production Checklist

- [ ] All environment variables set
- [ ] Database migrations applied
- [ ] Cloudinary configured
- [ ] Auth providers enabled
- [ ] Custom domain configured
- [ ] SSL working
- [ ] Cron jobs running
- [ ] Error monitoring set up

## Rollback

If issues occur:

1. **Vercel:** Go to **Deployments** and promote a previous deployment
2. **Database:** Run `npx prisma migrate resolve --rolled-back MIGRATION_NAME`
3. **Code:** Revert commits and push

## Performance Optimization

### Vercel Settings

- Enable **Edge Network**
- Configure **ISR** (Incremental Static Regeneration)
- Set appropriate **Cache Control** headers

### Database

- Use connection pooling
- Add indexes for frequently queried fields
- Monitor slow queries

## Troubleshooting

See `docs/troubleshooting.md` for common deployment issues.
