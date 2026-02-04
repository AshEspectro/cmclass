# Admin Products CRUD Implementation - Complete Guide

## Overview
The Products admin panel has been completely refactored to use real backend APIs instead of hardcoded static data. Full CRUD (Create, Read, Update, Delete) operations are now available.

## Changes Made

### 1. Backend APIs (Already Existing)
The backend NestJS server already has all required admin endpoints:

**Product Endpoints:**
- `GET /admin/products` - List all products with pagination and search
- `GET /admin/products/:id` - Get a single product
- `POST /admin/products` - Create a new product
- `PATCH /admin/products/:id` - Update an existing product
- `DELETE /admin/products/:id` - Delete a product
- `POST /admin/products/upload` - Upload product images

**Category Endpoints:**
- `GET /admin/categories` - List all categories
- `POST /admin/categories` - Create a new category
- `PATCH /admin/categories/:id` - Update category
- `DELETE /admin/categories/:id` - Delete category

### 2. Frontend API Service
**File:** `cmclass-main/admin/services/api.ts`

Created a centralized API service with organized methods:
- `productsAPI.list()` - Fetch products with search and pagination
- `productsAPI.get()` - Fetch single product
- `productsAPI.create()` - Create new product
- `productsAPI.update()` - Update product
- `productsAPI.delete()` - Delete product
- `categoriesAPI.getAll()` - Fetch all categories
- `categoriesAPI.list()` - Fetch categories with pagination

**Authentication:** All API calls include JWT token from localStorage with Bearer header

### 3. Updated Products Component
**File:** `cmclass-main/admin/components/pages/Products.tsx`

#### Features Implemented:

**Display & Search:**
- ✅ Real product data fetched from backend on mount
- ✅ Search functionality with live filtering
- ✅ Pagination support (20 items per page)
- ✅ Loading states
- ✅ Error handling with user-friendly messages

**Create Products:**
- ✅ "Ajouter un Nouveau Produit" button opens modal form
- ✅ Form fields: Name, Price (€), Stock, Category, Description, Image URL, Label, In Stock checkbox
- ✅ Category dropdown loaded from backend
- ✅ Form validation (Name and Category required)
- ✅ Image preview capability
- ✅ Create button sends data to backend

**Edit Products:**
- ✅ Click edit icon on any product to open edit modal
- ✅ Form pre-fills with current product data
- ✅ All fields editable
- ✅ Updates sent to backend via PATCH request
- ✅ List refreshes after successful update

**Delete Products:**
- ✅ Delete icon on each product row
- ✅ Confirmation dialog before deletion
- ✅ Sends DELETE request to backend
- ✅ List refreshes after deletion
- ✅ Error handling if deletion fails

**Product Status:**
- ✅ "Actif" (Active) - Green badge for in-stock products with good stock
- ✅ "Stock Faible" (Low Stock) - Yellow badge when stock < 5
- ✅ "Rupture de Stock" (Out of Stock) - Red badge when not in stock

### 4. Data Structure

**Product Object:**
```typescript
{
  id: number;
  name: string;
  description?: string;
  productImage?: string;           // Main product image URL
  priceCents: number;               // Price in cents (divide by 100 for EUR)
  stock: number;
  inStock: boolean;
  category: {
    id: number;
    name: string;
  };
  label?: string;                  // e.g., "Best Seller", "Nouveau"
  images?: string[];               // Additional images
  longDescription?: string;
  mannequinImage?: string;
  colors?: any;                    // JSON color data
}
```

**Category Object:**
```typescript
{
  id: number;
  name: string;
}
```

## How to Use

### Starting the Application

1. **Backend:**
```bash
cd cmclass-backend-dev
npm install
npm run dev              # Runs on port 3000
```

2. **Frontend:**
```bash
cd cmclass-main
npm install
npm run dev             # Runs on port 5173
```

### Creating a Product

1. Click "Ajouter un Nouveau Produit"
2. Fill in the form:
   - **Nom du Produit** (required)
   - **Catégorie** (required) - Select from dropdown
   - **Prix (€)** - Enter in euros (converted to cents)
   - **Stock** - Number of units
   - **Description** - Brief description
   - **URL Image Produit** - Paste image URL
   - **Label** - Optional (e.g., "Best Seller")
   - **En Stock** - Checkbox for stock status
3. Click "Créer le Produit"
4. Product list refreshes automatically

### Editing a Product

1. Click the edit icon (pencil) on the product row
2. Update any fields needed
3. Click "Enregistrer les Modifications"
4. Product updates in real-time

### Deleting a Product

1. Click the delete icon (trash) on the product row
2. Confirm deletion in the popup dialog
3. Product is removed from list

### Searching Products

1. Type in the search box
2. Results filter in real-time
3. Search applies to product names and descriptions

## Error Handling

- ✅ Network errors display in red banner
- ✅ Form validation errors shown to user
- ✅ Authentication failures trigger proper error messages
- ✅ All errors can be dismissed with close button

## Environment Configuration

Make sure `VITE_BACKEND_URL` is set in `.env`:
```
VITE_BACKEND_URL=http://localhost:3000
```

If not set, defaults to `http://localhost:3000`

## No Static Data

- ❌ All hardcoded product data removed
- ❌ All hardcoded category data removed
- ✅ All data fetched from backend APIs
- ✅ Real CRUD operations only

## Technical Stack

- **Frontend:** React 18 + TypeScript
- **UI Components:** Radix UI primitives + Tailwind CSS
- **Icons:** lucide-react
- **State Management:** React hooks (useState, useEffect)
- **API:** Fetch API with JWT authentication
- **Backend:** NestJS with Prisma ORM

## Security

- ✅ JWT token required for all operations
- ✅ Tokens sent in Authorization header
- ✅ Backend validates user role (ADMIN required)
- ✅ All data validated server-side

## Next Steps (Optional Enhancements)

1. Add image upload functionality (multi-file)
2. Add product variants management
3. Add bulk operations (import/export CSV)
4. Add product templates
5. Add detailed analytics and reporting
6. Add product scheduling for future release
7. Add inventory tracking/low stock alerts
