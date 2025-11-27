import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { api } from '../api/axiosInstance'
import { buildAuthHeaders } from './user.slice'
import { normalizeProduct } from '../../utils/productHelpers.js'

// 3.8 GET /products?sort=price,asc|desc
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (sort, { getState }) => {
    const params = new URLSearchParams()
    if (sort) params.append('sort', sort)
    const query = params.toString()
    const url = query ? `/products?${query}` : `/products`

    const response = await api.get(url, {
      headers: buildAuthHeaders(getState()),
    })
    return response.data
  }
)

// 3.2 GET /products/{id}
export const fetchProductById = createAsyncThunk(
  'products/fetchProductById',
  async (productId, { getState }) => {
    const response = await api.get(`/products/${productId}`, {
      headers: buildAuthHeaders(getState()),
    })
    return response.data
  }
)

// 3.5 GET /products/category/{categoryId}?sort=price,asc|desc
export const fetchProductsByCategory = createAsyncThunk(
  'products/fetchProductsByCategory',
  async ({ categoryId, sort }, { getState }) => {
    const params = new URLSearchParams()
    if (sort) params.append('sort', sort)
    const query = params.toString()
    const url = query
      ? `/products/category/${categoryId}?${query}`
      : `/products/category/${categoryId}`

    const response = await api.get(url, {
      headers: buildAuthHeaders(getState()),
    })
    return response.data
  }
)

// 3.1 GET /products/filterPrices
export const fetchProductsFilteredByPrice = createAsyncThunk(
  'products/fetchProductsFilteredByPrice',
  async ({ title, priceMin, priceMax }, { getState }) => {
    const params = new URLSearchParams()
    if (title) params.append('title', title)
    if (priceMin !== undefined && priceMin !== null) params.append('priceMin', priceMin)
    if (priceMax !== undefined && priceMax !== null) params.append('priceMax', priceMax)

    const url = `/products/filterPrices?${params.toString()}`
    const response = await api.get(url, {
      headers: buildAuthHeaders(getState()),
    })
    return response.data
  }
)

// 3.4 GET /products/attributes
export const fetchProductsByAttributes = createAsyncThunk(
  'products/fetchProductsByAttributes',
  async ({ title, description, priceMax }, { getState }) => {
    const params = new URLSearchParams()
    if (title) params.append('title', title)
    if (description) params.append('description', description)
    if (priceMax !== undefined && priceMax !== null) params.append('priceMax', priceMax)

    const url = `/products/attributes?${params.toString()}`
    const response = await api.get(url, {
      headers: buildAuthHeaders(getState()),
    })
    return response.data
  }
)

// 3.x GET /products/with-attributes
export const fetchProductsWithAttributes = createAsyncThunk(
  'products/fetchProductsWithAttributes',
  async (sort, { getState }) => {
    const params = new URLSearchParams()
    if (sort) params.append('sort', sort)
    const query = params.toString()
    const url = query
      ? `/products/with-attributes?${query}`
      : `/products/with-attributes`

    const response = await api.get(url, {
      headers: buildAuthHeaders(getState()),
    })
    return response.data
  }
)

// 3.x GET /products/filter-by-attributes
export const fetchProductsFilteredByAttributes = createAsyncThunk(
  'products/fetchProductsFilteredByAttributes',
  async ({ sort, categoryId, attributeFilters }, { getState }) => {
    const params = new URLSearchParams()
    if (sort) params.append('sort', sort)
    if (categoryId) params.append('categoryId', categoryId)
    if (attributeFilters) params.append('attributeFilters', attributeFilters)

    const url = `/products/filter-by-attributes?${params.toString()}`
    const response = await api.get(url, {
      headers: buildAuthHeaders(getState()),
    })
    return response.data
  }
)

// 4.1 POST /products
export const createProduct = createAsyncThunk(
  'products/createProduct',
  async (payload, { getState }) => {
    const response = await api.post('/products', payload, {
      headers: buildAuthHeaders(getState(), true),
    })
    return response.data
  }
)

// 4.2 PUT /products/{id}
export const updateProduct = createAsyncThunk(
  'products/updateProduct',
  async ({ productId, data }, { getState }) => {
    const response = await api.put(`/products/${productId}`, data, {
      headers: buildAuthHeaders(getState(), true),
    })
    return response.data
  }
)

// 4.3 DELETE /products/{id}
export const deleteProduct = createAsyncThunk(
  'products/deleteProduct',
  async (productId, { getState }) => {
    const response = await api.delete(`/products/${productId}`, {
      headers: buildAuthHeaders(getState()),
    })
    return response.data
  }
)

const initialState = {
  products: [],
  pending: false,
  error: null,
  currentItem: null,
}

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // List / basic fetch
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.pending = true
        state.error = null
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.pending = false
        const page = action.payload
        const rawItems = Array.isArray(page)
          ? page
          : page?.content ?? []
        state.products = rawItems.map(normalizeProduct)
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.pending = false
        state.error = action.error.message || null
      })

    // By id
    builder
      .addCase(fetchProductById.pending, (state) => {
        state.pending = true
        state.error = null
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.pending = false
        const normalized = normalizeProduct(action.payload)
        state.currentItem = normalized
        if (normalized && normalized.id != null) {
          const index = state.products.findIndex((p) => p.id === normalized.id)
          if (index !== -1) {
            state.products[index] = normalized
          } else {
            state.products.push(normalized)
          }
        }
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.pending = false
        state.error = action.error.message || null
      })

    // By category
    builder
      .addCase(fetchProductsByCategory.pending, (state) => {
        state.pending = true
        state.error = null
      })
      .addCase(fetchProductsByCategory.fulfilled, (state, action) => {
        state.pending = false
        const rawItems = Array.isArray(action.payload) ? action.payload : []
        state.products = rawItems.map(normalizeProduct)
      })
      .addCase(fetchProductsByCategory.rejected, (state, action) => {
        state.pending = false
        state.error = action.error.message || null
      })

    // Filter by price
    builder
      .addCase(fetchProductsFilteredByPrice.pending, (state) => {
        state.pending = true
        state.error = null
      })
      .addCase(fetchProductsFilteredByPrice.fulfilled, (state, action) => {
        state.pending = false
        const rawItems = Array.isArray(action.payload) ? action.payload : []
        state.products = rawItems.map(normalizeProduct)
      })
      .addCase(fetchProductsFilteredByPrice.rejected, (state, action) => {
        state.pending = false
        state.error = action.error.message || null
      })

    // Filter by simple attributes
    builder
      .addCase(fetchProductsByAttributes.pending, (state) => {
        state.pending = true
        state.error = null
      })
      .addCase(fetchProductsByAttributes.fulfilled, (state, action) => {
        state.pending = false
        const rawItems = Array.isArray(action.payload) ? action.payload : []
        state.products = rawItems.map(normalizeProduct)
      })
      .addCase(fetchProductsByAttributes.rejected, (state, action) => {
        state.pending = false
        state.error = action.error.message || null
      })

    // Products with attributes
    builder
      .addCase(fetchProductsWithAttributes.pending, (state) => {
        state.pending = true
        state.error = null
      })
      .addCase(fetchProductsWithAttributes.fulfilled, (state, action) => {
        state.pending = false
        const rawItems = Array.isArray(action.payload) ? action.payload : []
        state.products = rawItems.map(normalizeProduct)
      })
      .addCase(fetchProductsWithAttributes.rejected, (state, action) => {
        state.pending = false
        state.error = action.error.message || null
      })

    // Filter by advanced attributes
    builder
      .addCase(fetchProductsFilteredByAttributes.pending, (state) => {
        state.pending = true
        state.error = null
      })
      .addCase(fetchProductsFilteredByAttributes.fulfilled, (state, action) => {
        state.pending = false
        const rawItems = Array.isArray(action.payload) ? action.payload : []
        state.products = rawItems.map(normalizeProduct)
      })
      .addCase(fetchProductsFilteredByAttributes.rejected, (state, action) => {
        state.pending = false
        state.error = action.error.message || null
      })

    // Create
    builder
      .addCase(createProduct.pending, (state) => {
        state.pending = true
        state.error = null
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.pending = false
        const apiResponse = action.payload
        if (apiResponse && apiResponse.data) {
          state.products.push(normalizeProduct(apiResponse.data))
        }
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.pending = false
        state.error = action.error.message || null
      })

    // Update
    builder
      .addCase(updateProduct.pending, (state) => {
        state.pending = true
        state.error = null
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.pending = false
        const apiResponse = action.payload
        if (apiResponse && apiResponse.data && apiResponse.data.product_id != null) {
          const normalized = normalizeProduct(apiResponse.data)
          const index = state.products.findIndex((p) => p.id === normalized.id)
          if (index !== -1) {
            state.products[index] = normalized
          }
          if (state.currentItem && state.currentItem.id === normalized.id) {
            state.currentItem = normalized
          }
        }
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.pending = false
        state.error = action.error.message || null
      })

    // Delete
    builder
      .addCase(deleteProduct.pending, (state) => {
        state.pending = true
        state.error = null
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.pending = false
        const productId = action.meta.arg
        // Soft delete: marcar producto como inactivo en el estado
        const product = state.products.find((p) => p.id === productId)
        if (product) {
          product.active = false
        }
        if (state.currentItem && state.currentItem.id === productId) {
          state.currentItem = { ...state.currentItem, active: false }
        }
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.pending = false
        state.error = action.error.message || null
      })
  },
})

export default productSlice.reducer

// Selectors
export const selectProducts = (state) => state.products.products
export const selectProductPending = (state) => state.products.pending
export const selectProductError = (state) => state.products.error
export const selectCurrentProduct = (state) => state.products.currentItem
