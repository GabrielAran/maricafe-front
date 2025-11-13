# Redux Slice vs RTK Query API - When to Use Each

## The Key Difference

**Redux Slice (`createSlice`)** = For **local application state**
- State lives in Redux store
- You control the state directly
- Examples: auth state, cart state, UI state

**RTK Query API (`createApi`)** = For **server state / API calls**
- State comes from the server
- You fetch/modify via API calls
- Examples: discounts, products, orders

## Why Discount Uses RTK Query (API)

Discounts are **server-managed data**:
- They're stored in the database
- You fetch them from the API
- You create/update/delete them via API calls
- You don't manage discount state locally

## Comparison

### ❌ What a Discount SLICE would look like (NOT what we want):

```javascript
// discountSlice.js - This would be WRONG for discounts
import { createSlice } from '@reduxjs/toolkit'

const discountSlice = createSlice({
  name: 'discount',
  initialState: {
    discounts: [],  // But where do these come from? The server!
    loading: false,
    error: null
  },
  reducers: {
    setDiscounts: (state, action) => {
      state.discounts = action.payload  // How do we get this data?
    },
    // ... but we still need API calls to fetch/update
  }
})
```

**Problem**: You'd still need to make API calls separately, manage loading states manually, handle caching yourself, etc.

### ✅ What RTK Query API looks like (What we have):

```javascript
// discountApi.js - This is CORRECT for discounts
export const discountApi = createApi({
  reducerPath: 'discountApi',
  baseQuery: fetchBaseQuery({ baseUrl: API_BASE_URL }),
  endpoints: (builder) => ({
    createDiscount: builder.mutation({
      query: ({ productId, discountPercentage }) => ({
        url: `/discounts/${productId}`,
        method: 'POST',
        body: { discount_percentage: discountPercentage },
      }),
    }),
  }),
})
```

**Benefits**: 
- Automatic API calls
- Built-in loading/error states
- Automatic caching
- Cache invalidation
- Request deduplication

## When to Use Each

### Use **Redux Slice** (`createSlice`) for:
- ✅ **Auth state** - user, token, isAuthenticated (local state)
- ✅ **Cart state** - items in cart (local state, synced to localStorage)
- ✅ **UI state** - modals, toasts, theme (local state)

### Use **RTK Query API** (`createApi`) for:
- ✅ **Discounts** - server data, API operations
- ✅ **Products** - server data, fetched from API
- ✅ **Orders** - server data, fetched from API
- ✅ **Categories** - server data, fetched from API

## Real Example: Auth vs Discount

### Auth (Slice) - Local State
```javascript
// authSlice.js
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,           // Local state
    token: null,          // Local state
    isAuthenticated: false // Local state
  },
  reducers: {
    login: (state, action) => {
      state.user = action.payload.user
      state.token = action.payload.token
      state.isAuthenticated = true
    }
  }
})
```

### Discount (API) - Server State
```javascript
// discountApi.js
export const discountApi = createApi({
  endpoints: (builder) => ({
    createDiscount: builder.mutation({
      query: (data) => ({
        url: '/discounts',
        method: 'POST',
        body: data
      })
    })
  })
})
```

## Summary

- **Discount = RTK Query API** ✅ (server data, API operations)
- **Auth = Redux Slice** ✅ (local state, user session)
- **Cart = Redux Slice** ✅ (local state, shopping cart)

The discount implementation is correct! It's an API because discounts are server-managed data, not local application state.

