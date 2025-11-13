# Redux Migration Guide

This guide outlines the gradual migration from Context API to Redux Toolkit.

## Understanding Redux Slices

**Domain Slices** (main business logic):
- `discountSlice` - Discount operations with async thunks ✅ DONE
- `authSlice` - User authentication and user state
- `cartSlice` - Shopping cart state

**Note**: We're using traditional Redux slices with `createSlice` and `createAsyncThunk` for all state management, including API operations. This gives explicit control over state structure.

## Current Status

✅ **Infrastructure Setup**
- Redux store configured
- Redux Provider added to app
- Discount slice migrated ✅

✅ **Completed Migrations**
- Discount slice - Traditional Redux slice with async thunks

## Migration Strategy

### ✅ Phase 1: Discount Slice (COMPLETED)

**What was done:**
- Created `src/store/slices/discountSlice.js` with async thunks
- Migrated `AdminDiscountManagement.jsx` to use Redux
- State structure: `state.discount.loading`, `state.discount.error`
- Uses `createAsyncThunk` for API operations

**Benefits:**
- Explicit state management
- Full control over state structure
- Traditional Redux patterns
- Easy to understand and debug

### Phase 2: Auth Slice (Next)

**Why start here:**
- **Foundational**: Cart and other features depend on it
- **Used everywhere**: 18 components use `useAuth`
- **Unlocks everything**: Once done, you can migrate cart and other features

**Status:** ⚠️ Ready to implement

**Steps:**
1. Create `src/store/slices/authSlice.js`
2. Migrate auth reducer logic from `src/context/AuthContext.jsx`
3. Create `src/hooks/useAppAuth.js` hook (mirrors `useAuth` API)
4. Update 18 components one by one (see Migration Targets below)
5. Keep AuthContext running in parallel during migration

**Key considerations:**
- Auth state needs to persist to localStorage (consider Redux Persist: `npm install redux-persist`)
- Auth provides: `user`, `token`, `isAuthenticated`, `loading`, `login()`, `logout()`, `register()`, `isAdmin()`, `updateUser()`, `getAuthHeaders()`
- This is the most important slice - everything else depends on it

### Phase 2: Cart Slice (After Auth)
**Why:** Depends on Auth state (user, token) - migrate Auth first

**Steps:**
1. Create `src/store/slices/cartSlice.js`
2. Migrate cart reducer logic from `src/context/CartContext.jsx`
3. Create `src/hooks/useAppCart.js` hook (mirrors `useCart` API)
4. Update 4 components one by one (see Migration Targets below)
5. Keep CartContext running in parallel during migration

**Key considerations:**
- Cart depends on Auth state (user, token) - migrate Auth first
- Uses `src/utils/cartPersistence.js` for localStorage
- Cart provides: `state.items`, `state.total`, `state.itemCount`, `dispatch()`
- Actions: `ADD_ITEM`, `REMOVE_ITEM`, `UPDATE_QUANTITY`, `CLEAR_CART`, `LOAD_CART`

### Phase 4: Other Services (Optional - Future)
**Consider:** Migrate service layer to Redux slices with async thunks
- `src/services/ProductService.js` → `productSlice.js`
- `src/services/AttributeService.js` → `attributeSlice.js`
- `src/services/OrderService.js` → `orderSlice.js`

**Pattern:** Use `createAsyncThunk` for API operations, `createSlice` for state management

## File Structure

```
maricafe-front/src/
├── store/                          # Redux store (new)
│   ├── store.js                    # ✅ Redux store configuration
│   ├── hooks.js                    # ✅ Typed Redux hooks
│   └── slices/                     # Redux slices (all state management)
│       ├── discountSlice.js        # ✅ Discount operations with async thunks
│       ├── authSlice.js            # TODO - User/authentication state
│       └── cartSlice.js            # TODO - Shopping cart state
├── hooks/                          # Custom hooks
│   ├── useProductService.js        # Existing service hooks
│   ├── useCategoryService.js       # Existing service hooks
│   ├── useAttributeService.js      # Existing service hooks
│   └── useIsMobile.js              # Existing utility hook
├── context/                        # Context API (keep during migration, remove after)
│   ├── ToastContext.jsx            # Keep in Context (optional to migrate later)
│   ├── AuthContext.jsx             # ⚠️ Migrate to authSlice
│   └── CartContext.jsx             # ⚠️ Migrate to cartSlice (after auth)
├── components/                     # React components
│   ├── Toast.jsx                   # Shared Toast component
│   ├── AddToCartButton.jsx         # Uses: useToast, useAuth, useCart
│   ├── CartSheet.jsx               # Uses: useToast, useAuth, useCart
│   ├── AdminOrdersManagement.jsx   # Uses: useToast
│   └── ...                         # Other components
├── pages/                          # Page components
│   ├── CheckoutPage.jsx            # Uses: useToast, useAuth, useCart
│   ├── LoginPage.jsx               # Uses: useAuth
│   ├── RegisterPage.jsx            # Uses: useAuth
│   ├── ProfilePage.jsx             # Uses: useAuth
│   └── ...                         # Other pages
├── services/                       # Service layer (consider RTK Query later)
│   ├── ProductService.js
│   ├── AttributeService.js
│   └── ...
├── utils/                          # Utility functions
│   └── cartPersistence.js          # Used by CartContext
├── App.jsx                         # Main app component
└── main.jsx                        # ✅ Updated with Redux Provider
```

## Migration Targets

### Auth Slice Migration (Phase 1 - START HERE)
**Files using `useAuth` (18 files):**
- `src/pages/LoginPage.jsx`
- `src/pages/RegisterPage.jsx`
- `src/pages/ProfilePage.jsx`
- `src/pages/CheckoutPage.jsx`
- `src/pages/HomePage.jsx`
- `src/pages/AdminPanel.jsx`
- `src/pages/OrderDetailsPage.jsx`
- `src/components/Header.jsx`
- `src/components/AddToCartButton.jsx`
- `src/components/CartSheet.jsx`
- `src/components/ProductViewNew.jsx`
- `src/components/AdminDashboard.jsx`
- `src/components/AdminProductManagement.jsx`
- `src/components/AdminCategoryManagement.jsx`
- `src/components/AdminDiscountManagement.jsx`
- `src/context/CartContext.jsx` (depends on Auth)

### Cart Slice Migration (Phase 2)
**Files using `useCart` (4 files):**
- `src/pages/CheckoutPage.jsx`
- `src/components/CartSheet.jsx`
- `src/components/AddToCartButton.jsx`

### Discount Slice Migration (✅ COMPLETED)
**Files migrated:**
- ✅ `src/components/AdminDiscountManagement.jsx` - Now uses Redux slice
- ✅ `src/store/slices/discountSlice.js` - Created with async thunks

## Best Practices

1. **Gradual Migration**: Keep both systems running during migration
2. **API Compatibility**: Create hooks that mirror Context API for easy migration
3. **Test Each Phase**: Don't move to next phase until current is fully tested
4. **One Component at a Time**: Migrate components individually
5. **Remove Old Code**: Once a Context is fully migrated, remove it

## Benefits of Redux

- **DevTools**: Time-travel debugging, state inspection
- **Predictable State**: Single source of truth
- **Better Performance**: Optimized re-renders with selectors
- **Middleware**: Easy to add logging, persistence, etc.
- **RTK Query**: Built-in API state management (future)

## Next Steps

1. **Install dependencies:**
   ```bash
   npm install @reduxjs/toolkit react-redux
   ```

2. **Next: Migrate Auth Slice**
   - Create `src/store/slices/authSlice.js`
   - Migrate reducer logic from `src/context/AuthContext.jsx`
   - Create `src/hooks/useAppAuth.js` hook
   - Start migrating components one by one (18 files)
   - Test thoroughly after each component

3. **Then continue with:**
   - Cart Slice (after Auth)
   - Other slices as needed (Products, Orders, etc.)

## Redux DevTools

Install Redux DevTools browser extension to:
- Inspect state changes
- Time-travel debug
- See action history
- Export/import state

## Migration Checklist

### Infrastructure Setup
- [x] Install Redux Toolkit and React-Redux
- [x] Create Redux store structure
- [x] Add Redux Provider to main.jsx

### Phase 1: Discount Slice (✅ COMPLETED)
- [x] Create `src/store/slices/discountSlice.js` with async thunks
- [x] Migrate `src/components/AdminDiscountManagement.jsx`
- [x] Test discount operations work correctly

### Phase 2: Auth Slice (Next)
- [ ] Create `src/store/slices/authSlice.js`
- [ ] Create `src/hooks/useAppAuth.js` hook
- [ ] Migrate 18 components using `useAuth`:
  - [ ] `src/pages/LoginPage.jsx`
  - [ ] `src/pages/RegisterPage.jsx`
  - [ ] `src/pages/ProfilePage.jsx`
  - [ ] `src/pages/CheckoutPage.jsx`
  - [ ] `src/pages/HomePage.jsx`
  - [ ] `src/pages/AdminPanel.jsx`
  - [ ] `src/pages/OrderDetailsPage.jsx`
  - [ ] `src/components/Header.jsx`
  - [ ] `src/components/AddToCartButton.jsx`
  - [ ] `src/components/CartSheet.jsx`
  - [ ] `src/components/ProductViewNew.jsx`
  - [ ] `src/components/AdminDashboard.jsx`
  - [ ] `src/components/AdminProductManagement.jsx`
  - [ ] `src/components/AdminCategoryManagement.jsx`
  - [ ] `src/components/AdminDiscountManagement.jsx`
  - [ ] `src/context/CartContext.jsx` (update to use Redux auth)
- [ ] Remove AuthProvider from App.jsx
- [ ] Delete `src/context/AuthContext.jsx`

### Phase 3: Cart Slice (After Auth)
- [ ] Create `src/store/slices/cartSlice.js`
- [ ] Create `src/hooks/useAppCart.js` hook
- [ ] Migrate 4 components using `useCart`:
  - [ ] `src/pages/CheckoutPage.jsx`
  - [ ] `src/components/CartSheet.jsx`
  - [ ] `src/components/AddToCartButton.jsx`
- [ ] Remove CartProvider from App.jsx
- [ ] Delete `src/context/CartContext.jsx`

### Phase 4: Other Slices (Optional)
- [ ] Product slice (if needed)
- [ ] Order slice (if needed)
- [ ] Other services as needed

## Questions?

- Redux Toolkit docs: https://redux-toolkit.js.org/
- Migration patterns: https://redux.js.org/usage/migrating-to-modern-redux
- RTK Query docs: https://redux-toolkit.js.org/rtk-query/overview

