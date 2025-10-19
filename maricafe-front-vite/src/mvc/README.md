# 🏗️ MVC Architecture - Maricafe Frontend

This directory implements a Model-View-Controller (MVC) architecture for the Maricafe frontend application, specifically for product management.

## 📁 Directory Structure

```
src/mvc/
├── models/           # Data models and state management
│   └── ProductModel.js
├── controllers/      # Business logic and user interactions
│   └── ProductController.js
├── views/           # React components (Views)
│   └── ProductView.jsx
├── hooks/           # Custom React hooks for MVC integration
│   └── useProductController.js
├── index.js         # Exports for easy importing
└── README.md        # This documentation
```

## 🎯 Architecture Overview

### **Model (ProductModel.js)**
- **Purpose**: Manages product data and state
- **Responsibilities**:
  - Data fetching from API
  - State management (products, loading, error, filters)
  - Data transformation (backend → frontend format)
  - Filtering and sorting logic
  - Observer pattern for state changes

### **Controller (ProductController.js)**
- **Purpose**: Handles business logic and user interactions
- **Responsibilities**:
  - Orchestrates Model operations
  - Manages user interactions
  - Business logic (search, filtering, validation)
  - Data formatting and utilities
  - Error handling

### **View (ProductView.jsx)**
- **Purpose**: React component that renders the UI
- **Responsibilities**:
  - User interface rendering
  - User interaction handling
  - Props management
  - Responsive design

### **Hook (useProductController.js)**
- **Purpose**: React integration layer
- **Responsibilities**:
  - Connects React components to MVC architecture
  - Manages React state synchronization
  - Provides clean API for components

## 🔄 Data Flow

```
User Interaction → View → Controller → Model → API Service → Backend
                ↑                                    ↓
                ← State Update ← Notification ← Data Response
```

1. **User interacts** with the View (clicks, filters, etc.)
2. **View calls** Controller methods
3. **Controller orchestrates** Model operations
4. **Model fetches** data from API Service
5. **API Service** communicates with Backend
6. **Model updates** state and notifies observers
7. **Controller** receives state updates
8. **View re-renders** with new data

## 🚀 Usage Examples

### Basic Usage in a Page Component

```jsx
import React from 'react'
import ProductView from '../mvc/views/ProductView.jsx'

export default function ProductosPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1>Nuestros Productos</h1>
      <ProductView 
        pageType="all"
        showFilters={true}
        showSorting={true}
        showCategoryFilter={true}
      />
    </div>
  )
}
```

### Using the Controller Directly

```jsx
import { useProductController } from '../mvc/hooks/useProductController.js'

function CustomProductComponent() {
  const {
    products,
    loading,
    error,
    loadProducts,
    updateFilters,
    getFilteredProducts
  } = useProductController()

  // Use controller methods...
}
```

### Using Model and Controller Separately

```jsx
import { ProductModel } from '../mvc/models/ProductModel.js'
import { ProductController } from '../mvc/controllers/ProductController.js'

// Create instances
const model = new ProductModel()
const controller = new ProductController()

// Use them...
```

## 🎛️ ProductView Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `pageType` | string | `'all'` | Page type: 'all', 'tortas', 'tazas' |
| `showFilters` | boolean | `true` | Show filter panel |
| `showSorting` | boolean | `true` | Show sorting options |
| `showCategoryFilter` | boolean | `true` | Show category filter |

## 🔧 Controller Methods

### Data Loading
- `loadProducts()` - Load all products
- `loadProductsByCategory(categoryId)` - Load products by category
- `loadFilteredProducts(title, priceMin, priceMax)` - Load filtered products
- `getProductById(id)` - Get single product
- `loadProductsForPage(pageType)` - Load products for specific page type

### Filtering & Sorting
- `updateFilters(filters)` - Update filter state
- `applyFilters(filters)` - Apply filters and get results
- `getFilteredProducts()` - Get currently filtered products
- `getProductsByCategoryName(categoryName)` - Get products by category name

### Utilities
- `formatPrice(price)` - Format price for display
- `isProductAvailable(product)` - Check product availability
- `getProductAvailabilityStatus(product)` - Get availability status
- `getProductStats()` - Get product statistics
- `searchProducts(searchTerm)` - Search products

### Error Handling
- `clearError()` - Clear current error
- `retry()` - Retry last operation

## 🎨 Model State

```javascript
{
  products: [],           // Array of product objects
  loading: false,         // Loading state
  error: null,           // Error message
  filters: {             // Current filters
    category: 'all',
    vegan: false,
    sinTacc: false,
    sort: 'featured'
  }
}
```

## 🔄 Observer Pattern

The Model uses an observer pattern to notify components of state changes:

```javascript
// Subscribe to changes
const unsubscribe = model.subscribe((newState) => {
  console.log('State updated:', newState)
})

// Unsubscribe
unsubscribe()
```

## 🚫 Benefits of This Architecture

### ✅ **Separation of Concerns**
- **Model**: Data and business logic
- **View**: UI and user interactions  
- **Controller**: Orchestration and coordination

### ✅ **Reusability**
- Same Model/Controller can be used by different Views
- Easy to create new product-related components
- Consistent data handling across the app

### ✅ **Testability**
- Each layer can be tested independently
- Clear interfaces between components
- Easy to mock dependencies

### ✅ **Maintainability**
- Changes to one layer don't affect others
- Clear responsibility boundaries
- Easy to debug and modify

### ✅ **Scalability**
- Easy to add new features
- Can extend to other entities (User, Order, etc.)
- Consistent patterns across the application

## 🔮 Future Extensions

This MVC pattern can be extended to other entities:

```
src/mvc/
├── models/
│   ├── ProductModel.js
│   ├── UserModel.js
│   ├── OrderModel.js
│   └── CategoryModel.js
├── controllers/
│   ├── ProductController.js
│   ├── UserController.js
│   ├── OrderController.js
│   └── CategoryController.js
└── views/
    ├── ProductView.jsx
    ├── UserView.jsx
    ├── OrderView.jsx
    └── CategoryView.jsx
```

## 📝 Notes

- This architecture maintains compatibility with React's component model
- All components still use React hooks and lifecycle methods
- The MVC pattern is implemented using JavaScript classes and functions
- No external state management libraries are required
- Fully compatible with the existing academic restrictions
