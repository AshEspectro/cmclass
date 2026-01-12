Auth feature updates

- Added fields to `User` model in `prisma/schema.prisma`:
  - `resetPasswordToken` String? - hashed token for password resets
  - `resetPasswordExpires` DateTime? - expiry for reset token
  - `refreshToken` String? - hashed refresh token for "remember me"

Developer steps:
1. Run database migration locally:
   npx prisma migrate dev --name add-reset-refresh-fields
   npx prisma generate

2. Endpoints added:
   - POST /auth/login  (body: { email, password, remember? }) -> returns access_token; if remember=true a HttpOnly `refresh_token` cookie is set
   - POST /auth/refresh (no body required) -> reads `refresh_token` cookie (fallback to body) and returns { access_token }
   - POST /auth/logout  -> clears the `refresh_token` cookie and invalidates it server-side
   - POST /auth/forgot  (body: { email }) -> generates reset token and logs reset URL to console
   - POST /auth/reset   (body: { token, newPassword }) -> reset password

Note:
- The refresh token is stored hashed in DB and returned as an HttpOnly cookie when `remember` is used during login; in production use `secure: true` and consider SameSite adjustments.
- To test refresh via cookie with curl you can pass cookies using `-b`/`-c` or test from the browser. Example (curl cookie jar):
  1) Login and save cookies: curl -c cookies.txt -X POST http://localhost:3000/auth/login -H "Content-Type: application/json" -d '{"email":"espectro@example.com","password":"password123","remember":true}'
  2) Refresh using saved cookies: curl -b cookies.txt -X POST http://localhost:3000/auth/refresh

- OAuth / Social login
  - POST /auth/oauth (body: { provider: 'google', token: '<id_token>', remember?: true })
  - For Google you must supply the ID token (id_token) obtained from the Google Sign-In flow in the frontend.
  - Add env var: GOOGLE_CLIENT_ID (the OAuth client ID for your app). Install dependency: `npm i google-auth-library`.
  - The endpoint will find or create a user by email and return an `access_token`; when `remember=true` an HttpOnly `refresh_token` cookie is set.


Note:
- Currently reset tokens are logged to server console (for development). In production, send the reset URL via email.
- Refresh tokens are stored in DB (hashed) and matched on refresh.
