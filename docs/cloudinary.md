# Cloudinary Integration

## Overview

KeyDir uses Cloudinary for image hosting and management. All product images, banners, and user uploads are stored on Cloudinary.

## Configuration

### Environment Variables

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Client Setup

```typescript
// src/lib/cloudinary.ts
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export { cloudinary };
```

## Image Upload

### Upload API Route

**Endpoint:** `POST /api/upload`

**Request:**
```typescript
const formData = new FormData();
formData.append('file', file);
formData.append('folder', 'products');

const response = await fetch('/api/upload', {
  method: 'POST',
  body: formData,
});
```

**Response:**
```typescript
{
  url: "https://res.cloudinary.com/...",
  publicId: "products/abc123"
}
```

### Upload Folders

| Folder | Description |
|--------|-------------|
| `products/` | Product images |
| `banners/` | Homepage banners |
| `avatars/` | User profile pictures |
| `brands/` | Brand logos |

## Image Transformations

### Automatic Optimizations

Cloudinary automatically:
- Formats images to WebP/AVIF
- Compresses without quality loss
- Resizes based on device

### Manual Transformations

```typescript
// Thumbnail
cloudinary.url(publicId, {
  width: 200,
  height: 200,
  crop: 'fill',
  format: 'webp'
});

// Product card
cloudinary.url(publicId, {
  width: 400,
  height: 300,
  crop: 'limit',
  format: 'webp'
});

// Full size
cloudinary.url(publicId, {
  width: 1200,
  height: 1200,
  crop: 'limit',
  format: 'webp'
});
```

## Image Deletion

### Delete API Route

**Endpoint:** `DELETE /api/images/delete`

**Request:**
```typescript
const response = await fetch('/api/images/delete', {
  method: 'DELETE',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ publicId: 'products/abc123' }),
});
```

### Batch Deletion

```typescript
const publicIds = ['products/abc123', 'products/def456'];

const response = await fetch('/api/images/delete', {
  method: 'DELETE',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ publicIds }),
});
```

## Upload Presets

### Recommended Presets

1. **Product Images**
   - Max size: 5MB
   - Allowed formats: jpg, png, webp
   - Auto-optimization: enabled

2. **Banner Images**
   - Max size: 10MB
   - Allowed formats: jpg, png, webp
   - Auto-optimization: enabled

3. **User Avatars**
   - Max size: 2MB
   - Allowed formats: jpg, png, webp
   - Auto-optimization: enabled

## Folder Structure

```
keydir/
├── products/
│   ├── keyboards/
│   ├── switches/
│   ├── keycaps/
│   └── mice/
├── banners/
├── avatars/
└── brands/
```

## Best Practices

### Image Quality

- Use `quality: auto` for automatic optimization
- Set `format: auto` for modern formats (WebP, AVIF)
- Limit dimensions to what's needed

### Security

- Never expose API secret in client code
- Use signed URLs for private content
- Validate file types before upload

### Performance

- Use responsive images with `srcset`
- Implement lazy loading
- Cache images with proper headers

### Cost Optimization

- Delete unused images
- Use appropriate transformations
- Monitor usage in Cloudinary dashboard

## Common Tasks

### Adding Product Image

```typescript
// 1. Upload image
const formData = new FormData();
formData.append('file', imageFile);
formData.append('folder', `products/${category}`);

const { url, publicId } = await fetch('/api/upload', {
  method: 'POST',
  body: formData,
}).then(r => r.json());

// 2. Save to database
await prisma.product.update({
  where: { id: productId },
  data: { imageUrl: url }
});
```

### Updating Banner

```typescript
// 1. Upload new banner
const formData = new FormData();
formData.append('file', bannerFile);
formData.append('folder', 'banners');

const { url } = await fetch('/api/upload', {
  method: 'POST',
  body: formData,
}).then(r => r.json());

// 2. Update banner record
await prisma.banner.update({
  where: { id: bannerId },
  data: { desktopImage: url }
});
```

## Troubleshooting

### Upload Fails

1. Check file size limits
2. Verify API credentials
3. Ensure correct folder exists
4. Check network connectivity

### Images Not Loading

1. Verify image URL is correct
2. Check Cloudinary domain is allowed in `next.config.ts`
3. Ensure image exists in Cloudinary
4. Check for CORS issues

### Slow Loading

1. Use appropriate image sizes
2. Enable auto-format
3. Implement lazy loading
4. Use CDN caching

## Monitoring

### Cloudinary Dashboard

- Monitor usage and bandwidth
- Check transformation usage
- Review error logs

### Vercel Integration

- Enable Cloudinary plugin in Vercel
- Automatic image optimization
- Edge caching
