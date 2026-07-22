# Troubleshooting Guide

## Common Issues

### Development Server Won't Start

**Symptoms:** `npm run dev` fails or hangs

**Solutions:**

1. **Port already in use:**
   ```bash
   # Find and kill process on port 3000
   lsof -ti:3000 | xargs kill -9
   ```

2. **Missing environment variables:**
   ```bash
   # Check .env file exists
   cp .env.example .env
   # Fill in required values
   ```

3. **Node modules issue:**
   ```bash
   rm -rf node_modules
   npm install
   ```

4. **TypeScript errors:**
   ```bash
   npx tsc --noEmit
   ```

### Database Connection Errors

**Symptoms:** `Can't reach database server` or `Connection refused`

**Solutions:**

1. **Check DATABASE_URL:**
   ```bash
   # Verify in .env
   grep DATABASE_URL .env
   ```

2. **Test connection:**
   ```bash
   npx prisma db push
   ```

3. **Check Supabase status:**
   - Go to Supabase dashboard
   - Check if project is paused
   - Verify connection string

4. **Reset migrations:**
   ```bash
   npx prisma migrate reset
   npx prisma db seed
   ```

### Prisma Client Errors

**Symptoms:** `PrismaClientKnownRequestError` or `PrismaClientUnknownRequestError`

**Solutions:**

1. **Regenerate client:**
   ```bash
   npx prisma generate
   ```

2. **Check schema:**
   ```bash
   npx prisma validate
   ```

3. **Reset database:**
   ```bash
   npx prisma migrate reset
   ```

### Authentication Issues

**Symptoms:** Login fails, session not persisting

**Solutions:**

1. **Check Supabase keys:**
   ```bash
   # Verify in .env
   grep NEXT_PUBLIC_SUPABASE .env
   ```

2. **Clear cookies:**
   - Open browser DevTools
   - Go to Application > Cookies
   - Delete all cookies for localhost

3. **Check auth callback:**
   - Ensure `/auth/callback` route exists
   - Verify redirect URLs in Supabase dashboard

4. **Email not confirmed:**
   - Check Supabase auth settings
   - Disable email confirmation for development

### Image Upload Failures

**Symptoms:** Upload returns error, images not saving

**Solutions:**

1. **Check Cloudinary credentials:**
   ```bash
   grep CLOUDINARY .env
   ```

2. **Verify upload preset:**
   - Go to Cloudinary dashboard
   - Check upload presets
   - Ensure preset is set to unsigned

3. **Check file size:**
   - Max 5MB for products
   - Max 10MB for banners

4. **Check folder exists:**
   - Ensure `products/` folder exists in Cloudinary

### Build Errors

**Symptoms:** `npm run build` fails

**Solutions:**

1. **TypeScript errors:**
   ```bash
   npx tsc --noEmit
   ```

2. **ESLint errors:**
   ```bash
   npm run lint
   ```

3. **Missing dependencies:**
   ```bash
   npm install
   ```

4. **Clear build cache:**
   ```bash
   rm -rf .next
   npm run build
   ```

### Scraper Not Working

**Symptoms:** Price updates not happening, scraper errors

**Solutions:**

1. **Enable debug mode:**
   ```bash
   # In .env
   SCRAPER_DEBUG=true
   ```

2. **Check vendor configuration:**
   ```sql
   SELECT * FROM "Vendor" WHERE "scraperEnabled" = true;
   ```

3. **Test scraper manually:**
   ```bash
   curl -X GET http://localhost:3000/api/cron/update-prices \
     -H "Authorization: Bearer YOUR_CRON_SECRET"
   ```

4. **Check for Cloudflare protection:**
   - Some sites block scrapers
   - Enable `cloudflareProtected` flag
   - Use Playwright instead of Cheerio

### Performance Issues

**Symptoms:** Slow page loads, high TTFB

**Solutions:**

1. **Check database queries:**
   ```bash
   # Enable query logging
   DEBUG=prisma:query npm run dev
   ```

2. **Optimize images:**
   - Use Next.js Image component
   - Enable Cloudinary auto-format
   - Implement lazy loading

3. **Check for N+1 queries:**
   - Use `include` instead of multiple queries
   - Use `select` to fetch only needed fields

4. **Enable caching:**
   - Use `revalidate` for ISR
   - Implement Redis caching for heavy queries

### Deployment Issues

**Symptoms:** Vercel deployment fails

**Solutions:**

1. **Check build logs:**
   - Go to Vercel dashboard
   - Check function logs

2. **Verify environment variables:**
   - Ensure all required vars are set
   - Check for typos

3. **Check Node.js version:**
   - Ensure Node.js 20+ is selected

4. **Clear build cache:**
   - Redeploy with clean cache

### CSS/Styling Issues

**Symptoms:** Styles not loading, layout broken

**Solutions:**

1. **Check CSS imports:**
   - Ensure `globals.css` is imported in layout
   - Check `design-tokens.css` variables

2. **Clear browser cache:**
   - Hard refresh (Ctrl+Shift+R)
   - Clear browser cache

3. **Check Tailwind config:**
   ```bash
   npx tailwindcss --help
   ```

4. **Verify PostCSS config:**
   - Ensure `postcss.config.mjs` exists

## Debugging Tools

### Browser DevTools

- **Console:** Check for JavaScript errors
- **Network:** Monitor API calls
- **Application:** Check cookies, local storage

### Server Logs

```bash
# Development
npm run dev

# Production (Vercel)
# Check Vercel dashboard > Logs
```

### Database Queries

```bash
# Enable Prisma logging
DEBUG=prisma:query npm run dev

# Use Prisma Studio
npx prisma studio
```

### Network Debugging

```bash
# Test API endpoint
curl -X GET http://localhost:3000/api/products

# Test with headers
curl -X GET http://localhost:3000/api/products \
  -H "Content-Type: application/json"
```

## Error Messages

### `PrismaClientInitializationError`

**Cause:** Database connection failed

**Fix:** Check DATABASE_URL and Supabase status

### `NEXT_REDIRECT`

**Cause:** Server-side redirect in Server Component

**Fix:** Use `redirect()` from `next/navigation`

### `hydration-error`

**Cause:** Server/client HTML mismatch

**Fix:** Ensure consistent rendering, use `useEffect` for client-only code

### `CORS-error`

**Cause:** Cross-origin request blocked

**Fix:** Check API route CORS headers

### `413 Payload Too Large`

**Cause:** Request body too large

**Fix:** Increase body size limit or compress data

## Getting Help

1. Check this troubleshooting guide
2. Search existing GitHub issues
3. Create a new issue with:
   - Error message
   - Steps to reproduce
   - Environment details
   - Screenshots if applicable

## Environment Checklist

Before reporting an issue, verify:

- [ ] Node.js 20+ installed
- [ ] npm 9+ installed
- [ ] `.env` file configured
- [ ] Database migrations applied
- [ ] Dependencies installed (`npm install`)
- [ ] Development server running (`npm run dev`)
