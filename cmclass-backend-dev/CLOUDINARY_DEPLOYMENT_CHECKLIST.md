# ✅ Cloudinary Deployment Checklist

Use this checklist to ensure your Cloudinary integration is properly configured and deployed.

---

## 📋 Pre-Deployment Checklist

### 1. Cloudinary Account Setup
- [ ] Created Cloudinary account at https://cloudinary.com/
- [ ] Verified email address
- [ ] Logged into Cloudinary dashboard
- [ ] Located Cloud Name, API Key, and API Secret

### 2. Local Environment Setup
- [ ] Updated `.env` file with Cloudinary credentials:
  ```env
  CLOUDINARY_CLOUD_NAME=your_actual_cloud_name
  CLOUDINARY_API_KEY=your_actual_api_key
  CLOUDINARY_API_SECRET=your_actual_api_secret
  ```
- [ ] Verified `.env` is in `.gitignore` (never commit secrets!)
- [ ] Dependencies installed (`npm install` completed successfully)

### 3. Code Verification
- [ ] Build succeeds: `npm run build` ✅ (Already verified!)
- [ ] No TypeScript errors
- [ ] No lint errors

### 4. Local Testing
- [ ] Backend starts successfully: `npm run dev`
- [ ] Can access upload endpoint (with authentication)
- [ ] Test upload returns Cloudinary URL
- [ ] Uploaded file appears in Cloudinary Media Library
- [ ] Cloudinary URL is accessible in browser

### 5. Railway Environment Setup
- [ ] Logged into Railway dashboard
- [ ] Selected correct project
- [ ] Selected backend service
- [ ] Added environment variables in Variables tab:
  - [ ] `CLOUDINARY_CLOUD_NAME`
  - [ ] `CLOUDINARY_API_KEY`
  - [ ] `CLOUDINARY_API_SECRET`

### 6. Git Preparation
- [ ] All changes committed:
  ```bash
  git add .
  git commit -m "feat: integrate Cloudinary for persistent file uploads"
  ```
- [ ] `.env` is NOT committed (check with `git status`)
- [ ] Ready to push

---

## 🚀 Deployment Steps

### Step 1: Push to Git
```bash
git push origin main
```
- [ ] Push successful
- [ ] No errors

### Step 2: Monitor Railway Deployment
- [ ] Railway detects changes
- [ ] Build starts automatically
- [ ] Build completes successfully
- [ ] Deployment successful

### Step 3: Verify Deployment
- [ ] Backend is running (check Railway logs)
- [ ] No startup errors in logs
- [ ] Health check passes (if configured)

---

## 🧪 Post-Deployment Testing

### Test 1: Upload via API
```bash
# Replace with your production URL and JWT token
curl -X POST https://your-app.up.railway.app/admin/products/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@./test-image.jpg"
```

Expected response:
```json
{
  "url": "https://res.cloudinary.com/YOUR_CLOUD_NAME/image/upload/v1234567890/cmclass/products/abc123.jpg"
}
```

- [ ] Upload endpoint responds (status 200 or 201)
- [ ] Response contains Cloudinary URL
- [ ] URL starts with `https://res.cloudinary.com/`

### Test 2: Verify File in Cloudinary
- [ ] Go to https://console.cloudinary.com/console/media_library
- [ ] File appears in `cmclass/products/` folder
- [ ] File is accessible
- [ ] Metadata is correct

### Test 3: Test File Accessibility
- [ ] Open Cloudinary URL in browser
- [ ] Image/video loads correctly
- [ ] No CORS errors
- [ ] Loading is fast

### Test 4: Test All Upload Endpoints

**Products**
```bash
curl -X POST https://your-app.up.railway.app/admin/products/upload \
  -H "Authorization: Bearer TOKEN" -F "file=@test.jpg"
```
- [ ] ✅ Works

**Categories**
```bash
curl -X POST https://your-app.up.railway.app/admin/categories/upload \
  -H "Authorization: Bearer TOKEN" -F "file=@test.jpg"
```
- [ ] ✅ Works

**Brand**
```bash
curl -X POST https://your-app.up.railway.app/admin/brand/upload \
  -H "Authorization: Bearer TOKEN" -F "file=@test.jpg"
```
- [ ] ✅ Works

**Hero Images**
```bash
curl -X POST https://your-app.up.railway.app/admin/hero/upload \
  -H "Authorization: Bearer TOKEN" -F "file=@test.jpg"
```
- [ ] ✅ Works

**Hero Videos**
```bash
curl -X POST https://your-app.up.railway.app/admin/hero/upload-video \
  -H "Authorization: Bearer TOKEN" -F "file=@test.mp4"
```
- [ ] ✅ Works

### Test 5: Frontend Integration
- [ ] Frontend can upload files
- [ ] Upload progress works (if implemented)
- [ ] Cloudinary URLs are saved to database
- [ ] Images display correctly in frontend
- [ ] No broken image links

---

## 🔍 Verification Checklist

### Railway Logs Check
- [ ] No error messages about Cloudinary
- [ ] No "Cannot find module 'cloudinary'" errors
- [ ] No authentication errors
- [ ] Upload requests appear in logs

### Cloudinary Dashboard Check
- [ ] Files appear in Media Library
- [ ] Organized in correct folders (`cmclass/products/`, etc.)
- [ ] Storage usage is tracking correctly
- [ ] Bandwidth usage is normal

### Performance Check
- [ ] Images load quickly (< 1 second)
- [ ] CDN is being used (check response headers)
- [ ] Images are optimized (check file sizes)
- [ ] Auto format conversion working (WebP for modern browsers)

---

## 🐛 Troubleshooting Guide

### Issue: "Upload failed" in production

**Check:**
- [ ] Cloudinary credentials are set in Railway
- [ ] Credentials are correct (no typos)
- [ ] Cloudinary account is active
- [ ] API keys haven't been regenerated

**Fix:**
1. Verify Railway environment variables
2. Check Cloudinary dashboard for errors
3. Regenerate API keys if needed
4. Update Railway variables
5. Redeploy

---

### Issue: "Cannot find module 'cloudinary'"

**Check:**
- [ ] `cloudinary` is in `package.json` dependencies
- [ ] Railway build logs show `npm install` completed

**Fix:**
1. Verify `package.json` includes `"cloudinary": "^2.0.0"`
2. Trigger rebuild on Railway
3. Check build logs

---

### Issue: Files upload but return 404

**Check:**
- [ ] Cloudinary URL is correctly formatted
- [ ] File visibility is set to public
- [ ] No typos in cloud name

**Fix:**
1. Check Cloudinary Media Library
2. Verify file exists
3. Test URL in browser directly
4. Check Cloudinary settings

---

### Issue: High latency on file access

**Check:**
- [ ] CDN is enabled (should be by default)
- [ ] Using `secure_url` from response
- [ ] Not using proxy or custom domain incorrectly

**Fix:**
1. Verify URL starts with `https://res.cloudinary.com/`
2. Check CDN settings in Cloudinary dashboard
3. Test from multiple locations

---

## 📊 Monitoring

### Daily Checks
- [ ] Check Railway logs for upload errors
- [ ] Monitor Cloudinary usage dashboard
- [ ] Verify storage quota isn't exceeded

### Weekly Checks
- [ ] Review bandwidth usage
- [ ] Check for failed uploads
- [ ] Optimize large files if needed

### Monthly Checks
- [ ] Review Cloudinary bill (if on paid plan)
- [ ] Clean up unused files
- [ ] Update file organization if needed

---

## 🎯 Success Criteria

Your Cloudinary integration is successful if:

- [x] ✅ Build completes without errors
- [ ] ✅ All upload endpoints work in production
- [ ] ✅ Files persist after Railway restart
- [ ] ✅ Images load quickly via CDN
- [ ] ✅ Automatic optimizations are applied
- [ ] ✅ No errors in Railway logs
- [ ] ✅ No errors in Cloudinary dashboard
- [ ] ✅ Frontend displays images correctly

---

## 📝 Final Notes

### Before Going Live:
1. Ensure all environment variables are set
2. Test all upload endpoints
3. Verify file organization in Cloudinary
4. Check frontend integration
5. Monitor logs for 24 hours

### After Going Live:
1. Monitor Cloudinary usage
2. Set up alerts for quota limits
3. Implement regular backups if needed
4. Document any custom transformations
5. Train team on Cloudinary dashboard

---

## 🎉 Congratulations!

If all checkboxes are marked ✅, your Cloudinary integration is complete and production-ready!

Your uploads are now:
- ✅ Persistent across deployments
- ✅ Delivered via global CDN
- ✅ Automatically optimized
- ✅ Production-ready
- ✅ Scalable

---

## 📚 Quick Links

- **Cloudinary Dashboard**: https://console.cloudinary.com/
- **Media Library**: https://console.cloudinary.com/console/media_library
- **Usage Reports**: https://console.cloudinary.com/console/usage
- **API Documentation**: https://cloudinary.com/documentation/node_integration
- **Support**: https://support.cloudinary.com/

---

Keep this checklist for future deployments and updates!
