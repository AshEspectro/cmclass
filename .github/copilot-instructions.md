# CMClass Copilot Instructions

## Project Overview
CMClass is a luxury fashion e-commerce platform with separate **backend** (NestJS) and **frontend** (React) applications. The project emphasizes minimal aesthetics, African creativity, and user role-based access control.

**Workspace Structure:**
- `cmclass-backend-dev/` - NestJS API server (port 3000, default)
- `cmclass-main/` - React/Vite frontend (port 5173, default)
- Database: PostgreSQL with Prisma ORM

## Backend Architecture (NestJS)

### Core Modules & Dependencies
- **Auth Module** (`src/auth/`) - JWT-based authentication with refresh token rotation, role-based guards
- **Admin Module** (`src/admin/`) - Protected routes for managing users, products, categories, brands, campaigns
- **Prisma Module** (`src/prisma/`) - Global database service injected into all modules
- **Key Services:** AuthService, CategoryService, ProductService, BrandService, MailService

### Database Schema (Prisma)
Key models with relations:
- **User** - Roles: SUPER_ADMIN, ADMIN, MODERATOR, SUPPORT, USER; stores `refreshToken` (hashed)
- **Category** - Hierarchical (parentId), can have children, slug-based routing
- **Product** - Links to categories via ProductCategory join table
- **ProductVariant** - SKU-based variants (colors, sizes)
- **Brand** - Singleton (one brand per instance), stores primary/secondary colors (#007B8A primary)
- **AuditLog** - Tracks admin actions with actorId, targetUserId, meta JSON
- **SignupRequest** - Signup workflow with PENDING/APPROVED/DENIED status

### Authentication Flow
1. **Login** → `POST /auth/login` → Returns access_token (1h TTL) + optional refresh_token (30d)
2. **Refresh** → `POST /auth/refresh` → Compares hashed stored token with submitted token
3. **JWT Strategy** - Extracts from Bearer token, validates signature using `JWT_SECRET` env var
4. **Guards** - `JwtAuthGuard` (authentication), `RolesGuard` (authorization via `@Roles()` decorator)
5. **Cookies** - Refresh tokens stored in HttpOnly cookies; CORS configured to `FRONTEND_URL`

### File Upload Pattern
- Static assets served from `/public` directory (brand/, categories/, products/ subdirs)
- Use `@UseInterceptors(FileInterceptor())` and Multer for file handling
- Paths resolved with environment variable `BACKEND_URL`

### Environment Variables (Backend)
```
DATABASE_URL=postgresql://user:pass@localhost:5432/cmclass
JWT_SECRET=your-secret-key
FRONTEND_URL=http://localhost:5173
PORT=3000
HOST=0.0.0.0
BACKEND_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your-google-id
```

## Frontend Architecture (React + Vite)

### Key Folders
- `src/pages/` - Page components (Home, ProductDetail, Login, etc.)
- `src/components/` - Reusable UI components (Navbar, Footer, Card, Button)
- `src/contexts/` - Global state (AuthContext, CartContext, WishlistContext)
- `src/hooks/` - Custom hooks (useConditionalNavbar, etc.)
- `src/data/` - Static data (products_cat array)
- `admin/components/` - Admin dashboard UI (ContentManager, etc.)

### Component Patterns
- **Functional Components** with hooks (useState, useContext)
- **UI Library** - Radix UI primitives (Dialog, Select, Accordion, etc.) + custom Card/Button wrappers
- **Styling** - Tailwind CSS with custom color scheme (#007B8A as primary teal)
- **Icons** - lucide-react library

### Routing
- Client-side routing via React Router
- Protected routes wrapper (`<ProtectedRoute>`) checks AuthContext
- Admin panel at `/admin` (Index component imports from `../admin/Admin`)

### Authentication Context Pattern
```typescript
const { user, login, logout, token } = useContext(AuthContext);
```
- Stores JWT token, user data, and role
- Token stored in localStorage or sessionStorage
- Refresh token handling via refresh endpoint

### API Integration
- Calls to `http://localhost:3000` (or `VITE_BACKEND_URL`)
- Bearer token in Authorization header
- CORS enabled on backend for frontend origin

## Development Workflows

### Start Both Servers
**Backend:**
```bash
cd cmclass-backend-dev
npm install
npm run prisma:migrate  # Run pending migrations
npm run dev            # Starts on port 3000
```

**Frontend:**
```bash
cd cmclass-main
npm install
npm run dev           # Starts on port 5173
```

### Database Migrations
```bash
cd cmclass-backend-dev
npm run prisma:generate   # Regenerate Prisma client
npm run prisma:migrate    # Create/run migrations
npm run prisma:studio    # Open Prisma Studio GUI (http://localhost:5555)
npm run seed             # Run seed.ts script
```

### Build & Deploy
- **Frontend:** `npm run build` → produces `dist/` folder (Vite)
- **Backend:** No build required (ts-node), but use Dockerfile for production
- Vercel config in both package roots (vercel.json)

## Project-Specific Patterns

### Admin Controllers (NestJS)
- Controllers inherit from admin.module.ts
- All endpoints require `@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles('ADMIN')`
- Returns standardized response with metadata

### DTO Validation
- Use `class-validator` and `class-transformer` for DTO classes
- Nest's `ValidationPipe` applied globally in main.ts with `whitelist: true`

### Error Handling
- NestJS throws HttpException subclasses (BadRequestException, UnauthorizedException, NotFoundException)
- Global error logging in main.ts (unhandledRejection, uncaughtException)

### Content Management
- Homepage blocks managed in `ContentManager.tsx` (admin/components/pages/)
- Campaigns, hero sections, brand messaging all stored in Brand/Campaign models

### Color Scheme
- Primary: #007B8A (teal)
- Focus states, buttons, active elements use this color
- Tailwind class: `focus:border-[#007B8A]`, `bg-[#007B8A]`

## Critical Files Reference
- Backend entry: [cmclass-backend-dev/src/main.ts](cmclass-backend-dev/src/main.ts)
- Auth logic: [cmclass-backend-dev/src/auth/auth.service.ts](cmclass-backend-dev/src/auth/auth.service.ts)
- Database schema: [cmclass-backend-dev/prisma/schema.prisma](cmclass-backend-dev/prisma/schema.prisma)
- Frontend entry: [cmclass-main/src/main.tsx](cmclass-main/src/main.tsx)
- Admin dashboard: [cmclass-main/admin/Admin.tsx](cmclass-main/admin/Admin.tsx)
- Content manager: [cmclass-main/admin/components/pages/ContentManager.tsx](cmclass-main/admin/components/pages/ContentManager.tsx)

## Common Tasks for AI Agents

**Adding a new admin feature:**
1. Create DTO in `src/admin/dto/`
2. Add controller method in `src/admin/{feature}.controller.ts` with `@Roles()` guard
3. Implement service logic in `src/admin/{feature}.service.ts`
4. Register in `AdminModule` imports/providers
5. Create React component in `admin/components/pages/` and wire to AuthContext

**Adding a new data model:**
1. Define model in `schema.prisma`
2. Run `npm run prisma:migrate -- --name <description>`
3. Create service + controller in admin module
4. Wire up CRUD endpoints

**Updating frontend components:**
- Use Radix UI + Tailwind patterns already established
- Follow ContentManager.tsx structure for form layouts
- Always integrate with AuthContext for user data

## Notes
- French UI language in admin components (labels, buttons, placeholders)
- Monorepo structure (root package.json may coordinate scripts)
- Seed script available for initial data seeding
- Asset uploads trigger file serve from `/public` on backend
