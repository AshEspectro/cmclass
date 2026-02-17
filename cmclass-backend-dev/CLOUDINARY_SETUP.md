# Cloudinary Integration - Setup Guide

## ✅ What's Been Done

Your NestJS backend has been successfully integrated with Cloudinary for production-ready file uploads!

### Features Implemented:
- ✅ **Persistent Storage**: Files are stored on Cloudinary's CDN, not on Railway's ephemeral filesystem
- ✅ **Automatic Optimization**: Images are automatically optimized (quality, format, compression)
- ✅ **CDN Delivery**: Files are delivered through Cloudinary's global CDN for fast access
- ✅ **Format Auto-Detection**: Automatic format conversion (WebP, AVIF) for better performance
- ✅ **Video Support**: Videos are also supported with the same benefits

### Modified Files:
1. **src/cloudinary/cloudinary.service.ts** - Core Cloudinary upload service
2. **src/cloudinary/cloudinary.module.ts** - Cloudinary module
3. **src/app.module.ts** - Registered Cloudinary module globally
4. **src/admin/product.controller.ts** - Updated to use Cloudinary
5. **src/admin/category.controller.ts** - Updated to use Cloudinary
6. **src/admin/brand.controller.ts** - Updated to use Cloudinary
7. **src/admin/hero.controller.ts** - Updated to use Cloudinary (images & videos)
8. **.env** - Added Cloudinary configuration

---

## 🚀 Setup Instructions

### Step 1: Create a Cloudinary Account

1. Go to [Cloudinary](https://cloudinary.com/)
2. Click "Sign Up for Free"
3. Complete the registration

### Step 2: Get Your Cloudinary Credentials

1. After logging in, go to your [Cloudinary Dashboard](https://console.cloudinary.com/)
2. You'll see your credentials in the **Account Details** section:
   - **Cloud Name**
   - **API Key**
   - **API Secret**

### Step 3: Update Environment Variables

Update your `.env` file with your actual Cloudinary credentials:

```env
# Cloudinary Configuration (for persistent file uploads)
CLOUDINARY_CLOUD_NAME=your_actual_cloud_name
CLOUDINARY_API_KEY=your_actual_api_key
CLOUDINARY_API_SECRET=your_actual_api_secret
```

### Step 4: Update Railway Environment Variables

**IMPORTANT**: You must also add these environment variables to your Railway project:

1. Go to your Railway project dashboard
2. Click on your backend service
3. Go to the **Variables** tab
4. Add the following variables:
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`

### Step 5: Test the Integration

Test the upload endpoints:

```bash
# Test product upload
curl -X POST http://localhost:3000/admin/products/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@/path/to/image.jpg"

# Expected response:
# { "url": "https://res.cloudinary.com/your_cloud_name/image/upload/v1234567890/cmclass/products/abc123.jpg" }
```

---

## 📂 File Organization on Cloudinary

Your files will be organized in the following structure on Cloudinary:

```
cmclass/
├── products/      # Product images
├── categories/    # Category images
├── brand/         # Brand logos
└── hero/          # Hero section images and videos
```

---

## 🎨 Automatic Optimizations

Cloudinary automatically applies these optimizations:

1. **Quality Optimization**: `quality: auto:good`
   - Reduces file size while maintaining visual quality
   
2. **Format Optimization**: `fetch_format: auto`
   - Automatically converts to WebP or AVIF for supported browsers
   - Falls back to original format for older browsers

3. **CDN Delivery**: All files are delivered through Cloudinary's global CDN

---

## 🔧 Advanced Configuration (Optional)

### Custom Transformations

You can modify the upload transformations in `src/cloudinary/cloudinary.service.ts`:

```typescript
transformation: [
  { quality: 'auto:good' },
  { fetch_format: 'auto' },
  { width: 1920, crop: 'limit' }, // Limit max width
  { dpr: 'auto' }, // Auto device pixel ratio
]
```

### File Size Limits

Current limits:
- Images: 10MB (configurable in each controller)
- Videos: 100MB (hero section)

To change limits, update the `FileInterceptor` configuration in the respective controller.

---

## 🔒 Security Best Practices

1. **Never commit** your `.env` file or Cloudinary credentials to Git
2. **Use environment variables** for all sensitive data
3. **Rotate your API secrets** periodically in production
4. Consider enabling [signed uploads](https://cloudinary.com/documentation/upload_images#signed_uploads) for additional security

---

## 📊 Migration Strategy (If You Have Existing Files)

If you have existing files in `public/uploads/`, you have two options:

### Option 1: Upload Existing Files to Cloudinary (Recommended)

Create a migration script to upload existing files:

```typescript
// scripts/migrate-to-cloudinary.ts
import { CloudinaryService } from '../src/cloudinary/cloudinary.service';
import * as fs from 'fs';
import * as path from 'path';

async function migrateFiles() {
  const cloudinary = new CloudinaryService();
  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  
  // Read all files recursively and upload to Cloudinary
  // Update database URLs accordingly
}
```

### Option 2: Keep Both Systems

Keep the static file serving for existing files and use Cloudinary for new uploads. The current implementation already does this automatically.

---

## 🐛 Troubleshooting

### "Upload failed" Error
- Check that your Cloudinary credentials are correct
- Verify the file size is within limits
- Check Cloudinary dashboard for error logs

### "Cannot find module 'cloudinary'" Error
- Run: `npm install cloudinary@2`

### Files Not Appearing on Cloudinary
- Verify environment variables are set correctly
- Check Cloudinary dashboard → Media Library

### CORS Issues
- Cloudinary URLs should work cross-origin by default
- If issues persist, check Cloudinary settings

---

## 📚 Useful Resources

- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Node.js SDK Reference](https://cloudinary.com/documentation/node_integration)
- [Image Transformations](https://cloudinary.com/documentation/image_transformations)
- [Video Transformations](https://cloudinary.com/documentation/video_manipulation_and_delivery)

---

## 🎉 Success!

You're all set! Your uploads will now:
- ✅ Persist across Railway deployments
- ✅ Load faster with CDN delivery
- ✅ Be automatically optimized
- ✅ Scale without storage concerns

Happy coding! 🚀
