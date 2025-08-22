# Products List Page

**Route**: `/dashboard/products`  
**Status**: 🚧 Partial Implementation  
**File**: `src/app/dashboard/products/page.tsx`

## Overview

Product catalog management interface with comprehensive product listing, filtering, search, and bulk operations.

## Current Implementation

### Data Sources
- **Products**: Mock data with 10+ sample products (HP Pavilion laptop, Samsung Galaxy, headphones, etc.)
- **Categories**: Mock categories (Electronics, Clothing, Books, etc.)
- **Stock Levels**: Mock inventory data
- **Ratings**: Mock customer ratings (4.5-4.8 stars)

### UI Components

#### Header Section
- **Page Title**: "Products" with product count
- **Add Product Button**: Links to `/dashboard/products/add`
- **Search Bar**: Product name/SKU search functionality
- **Filter Controls**: Category, status, and advanced filters

#### Product Table
| Column | Data | Implementation |
|--------|------|----------------|
| **Product** | Name, image, link to detail | ✅ Implemented |
| **Price** | Formatted currency | ✅ Implemented |
| **Category** | Product category badge | ✅ Implemented |
| **Stock** | Inventory count with status | ✅ Implemented |
| **SKU** | Product identifier | ✅ Implemented |
| **Rating** | Star rating display | ✅ Implemented |
| **Actions** | Edit, delete, more options | 📋 Mock |

#### Summary Cards
- **Total Sales**: $30,230 with trend indicator
- **Number of Sales**: 982 with monthly change
- **Affiliate**: $4,530 with growth percentage
- **Discounts**: $2,230 with trend data

### Controls and Actions

| Control | Function | Implementation Status |
|---------|----------|----------------------|
| **Add Product** | Navigate to product creation | ✅ Working route |
| **Search Products** | Filter by name/SKU | 📋 Frontend only |
| **Category Filter** | Filter by product category | 📋 Frontend only |
| **Status Filter** | Filter by stock status | 📋 Frontend only |
| **Bulk Actions** | Select multiple products | 📋 Mock |
| **Export Data** | Download product list | 📋 Mock |
| **Product Actions** | Edit, delete, duplicate | 📋 Mock |
| **Stock Management** | Update inventory levels | 📋 Mock |

## Payload Collections Integration

### Currently Used
- **None** - All data is currently mocked

### Should Be Integrated

#### Primary Collections
- **Products**: Main product catalog
  - Fields: name, description, price, images, category, stock, sku
  - Relationships: Categories, Media, Tenants
  
- **Categories**: Product categorization
  - Fields: name, slug, description, parent
  - Relationships: Products

- **Media**: Product images and assets
  - Fields: filename, url, alt, dimensions
  - Relationships: Products

#### Supporting Collections
- **Orders**: For sales metrics calculation
- **Invoices**: For revenue analytics
- **ProductAnalytics**: Performance tracking
- **Inventory**: Stock management and tracking

## API Endpoints Needed

### Product Management
```typescript
GET /api/products?tenant=:tenantId&limit=50&page=1
POST /api/products
PUT /api/products/:id  
DELETE /api/products/:id
```

### Product Operations
```typescript
GET /api/products/search?q=:query&tenant=:tenantId
GET /api/products/categories?tenant=:tenantId
POST /api/products/bulk-update
POST /api/products/bulk-delete
```

### Analytics Integration
```typescript
GET /api/products/analytics?period=month&tenant=:tenantId
GET /api/products/top-selling?limit=10&tenant=:tenantId
GET /api/products/low-stock?threshold=10&tenant=:tenantId
```

## Configuration Modals

### Bulk Actions Modal
- **Trigger**: Selecting multiple products + bulk action button
- **Fields**: Action type (update price, change category, update stock)
- **Backend**: Batch update operations
- **Status**: 📋 Not implemented

### Product Filter Modal
- **Trigger**: Advanced filter button
- **Fields**: Price range, stock level, rating, date added
- **Backend**: Complex query filtering
- **Status**: 📋 Not implemented

### Export Configuration Modal
- **Trigger**: Export button
- **Fields**: Format (CSV, Excel), columns, filters
- **Backend**: Generate and download product data
- **Status**: 📋 Not implemented

### Stock Alert Modal
- **Trigger**: Low stock notifications
- **Fields**: Reorder quantity, supplier info, automatic reordering
- **Backend**: Inventory management system
- **Status**: 📋 Not implemented

## Mock Data Structure

### Product Structure
```typescript
interface Product {
  id: number
  name: string
  image: string
  price: string
  category: string
  stock: number
  sku: string
  rating: number
  status: "Active" | "Out of Stock" | "Discontinued"
}
```

### Sample Products
- **HP Pavilion 15.6 inch Gaming Laptop** - $960.99, Electronics, Stock: 8
- **Samsung SM-A715 Galaxy A71S** - $350, Electronics, Stock: 25
- **Schwarzer KH5105 513 Bügeleisenhörer** - $300, Electronics, Stock: 27
- Various other electronics, clothing, and books

## Integration Roadmap

### Phase 1: Basic Integration
1. Connect to Products collection
2. Implement real product CRUD operations
3. Add category filtering with Categories collection
4. Basic search functionality

### Phase 2: Advanced Features
1. Real stock management
2. Bulk operations
3. Product analytics integration
4. Image upload and management

### Phase 3: Business Intelligence
1. Sales performance analytics
2. Inventory optimization
3. Demand forecasting
4. Automated reordering

## Technical Implementation

### Search Functionality
```typescript
// Current: Frontend filtering only
const filteredProducts = products.filter(product =>
  product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
  product.sku.toLowerCase().includes(searchTerm.toLowerCase())
)

// Needed: Backend search with Payload
const searchProducts = async (query: string) => {
  const response = await fetch(`/api/products/search?q=${query}`)
  return response.json()
}
```

### Category Filtering
```typescript
// Current: Mock categories
const categories = ["All", "Electronics", "Clothing", "Books"]

// Needed: Real categories from Payload
const loadCategories = async () => {
  const response = await fetch('/api/categories')
  return response.json()
}
```

## Related Pages
- **Add Product**: `/dashboard/products/add` - Product creation form
- **Product Detail**: `/dashboard/products/[id]` - Individual product management
- **E-commerce Dashboard**: `/dashboard/ecommerce` - Sales analytics overview
- **Orders**: `/dashboard/orders` - Order management linked to products

## Dependencies

- `recharts`: Analytics charts and data visualization
- `framer-motion`: Page animations and transitions
- `lucide-react`: Icons for actions and status
- ShadCN UI: Table, Card, Button, Badge, Input, Select components
- Next.js: Image optimization and routing
