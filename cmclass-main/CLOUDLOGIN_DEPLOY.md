# Deploy CMClass Frontend on CloudLogin

## 1) Set production frontend env

Create `cmclass-main/.env.production` with:

```env
VITE_API_URL=https://cmclass-production.up.railway.app
VITE_BACKEND_URL=https://cmclass-production.up.railway.app
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
```

Notes:
- Do not add a port for Railway HTTPS domain.
- `VITE_API_URL` is the one used by the app.

## 2) Build static files

From `cmclass-main`:

```bash
npm install
npm run build:host
```

Output folder: `cmclass-main/dist`

## 3) Upload to CloudLogin hosting

Use File Manager or FTP in CloudLogin:

1. Open your website document root (usually `public_html`).
2. Delete old frontend files in that folder (keep backups if needed).
3. Upload the **contents** of `dist` (not the `dist` folder itself) into document root.
4. Confirm `.htaccess` was uploaded (required for React routes).

## 4) Backend CORS (Railway)

In Railway backend variables, set:

```env
FRONTEND_URL=https://us.cloudlogin.co
```

Then redeploy backend service.

## 5) Google login (if used)

In Google Cloud Console OAuth settings, add:
- Authorized JavaScript origin: `https://us.cloudlogin.co`
- Authorized redirect URI(s) if your flow uses them.

## 6) Quick checks

Open:
- `https://us.cloudlogin.co/`
- `https://us.cloudlogin.co/home`
- `https://us.cloudlogin.co/mes-commandes`

If direct route refresh shows 404, `.htaccess` is missing in web root.
