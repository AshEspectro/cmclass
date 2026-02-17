# 🌩️ Cloudinary Quick Reference

## Environment Variables (Required)

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

⚠️ **Don't forget to add these to Railway!**

---

## Upload Endpoints

All upload endpoints now use Cloudinary automatically:

### 1. Product Images
```
POST /admin/products/upload
Authorization: Bearer {token}
Content-Type: multipart/form-data
Body: file (10MB max)
```

### 2. Category Images
```
POST /admin/categories/upload
Authorization: Bearer {token}
Content-Type: multipart/form-data
Body: file (10MB max)
```

### 3. Brand Logo
```
POST /admin/brand/upload
Authorization: Bearer {token}
Content-Type: multipart/form-data
Body: file (10MB max)
```

### 4. Hero Images
```
POST /admin/hero/upload
Authorization: Bearer {token}
Content-Type: multipart/form-data
Body: file (16MB max, PNG/JPG/WebP only)
```

### 5. Hero Videos
```
POST /admin/hero/upload-video
Authorization: Bearer {token}
Content-Type: multipart/form-data
Body: file (100MB max, MP4/WebM/OGG only)
```

---

## Response Format

All endpoints return:

```json
{
  "url": "https://res.cloudinary.com/your_cloud_name/image/upload/v1234567890/cmclass/products/abc123.jpg"
}
```

This URL can be saved directly to your database and used in your frontend.

---

## Benefits

✅ **Persistent** - Files survive Railway restarts  
✅ **Fast** - Delivered via global CDN  
✅ **Optimized** - Auto WebP/AVIF conversion  
✅ **Scalable** - No server storage concerns  

---

## Get Your Credentials

1. Go to: https://console.cloudinary.com/
2. Copy from "Account Details" section
3. Add to `.env` AND Railway environment variables

---

## Testing Locally

```bash
# Start the backend
npm run dev

# Test upload (replace with your JWT token and file path)
curl -X POST http://localhost:3000/admin/products/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@./test-image.jpg"
```

---

## Troubleshooting

**Problem**: "Upload failed"  
**Solution**: Check Cloudinary credentials in `.env`

**Problem**: "Cannot find module 'cloudinary'"  
**Solution**: Run `npm install`

**Problem**: Files not appearing  
**Solution**: Check Cloudinary Media Library at https://console.cloudinary.com/console/media_library

---

For full documentation, see [CLOUDINARY_SETUP.md](./CLOUDINARY_SETUP.md)
