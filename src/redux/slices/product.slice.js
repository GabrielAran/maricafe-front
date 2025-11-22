import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

// Backend base URL (same server as categories)
const API_BASE_URL = 'http://127.0.0.1:4002'

const getAuthHeaders = () => {
  const token = localStorage.getItem('maricafe-token')
  if (!token) return {}
  return {
    Authorization: `Bearer ${token}`,
  }
}

// 3.8 GET /products?sort=price,asc|desc
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (sort) => {
    const params = new URLSearchParams()
    if (sort) params.append('sort', sort)
    const query = params.toString()
    const url = query ? `${API_BASE_URL}/products?${query}` : `${API_BASE_URL}/products`

    const response = await axios.get(url, {
      headers: {
        ...getAuthHeaders(),
      },
    })
    return response.data
  }
)

// 3.2 GET /products/{id}
export const fetchProductById = createAsyncThunk(
  'products/fetchProductById',
  async (productId) => {
    const response = await axios.get(`${API_BASE_URL}/products/${productId}`, {
      headers: {
        ...getAuthHeaders(),
      },
    })
    return response.data
  }
)

// 3.5 GET /products/category/{categoryId}?sort=price,asc|desc
export const fetchProductsByCategory = createAsyncThunk(
  'products/fetchProductsByCategory',
  async ({ categoryId, sort }) => {
    const params = new URLSearchParams()
    if (sort) params.append('sort', sort)
    const query = params.toString()
    const url = query
      ? `${API_BASE_URL}/products/category/${categoryId}?${query}`
      : `${API_BASE_URL}/products/category/${categoryId}`

    const response = await axios.get(url, {
      headers: {
        ...getAuthHeaders(),
      },
    })
    return response.data
  }
)

// 3.1 GET /products/filterPrices
export const fetchProductsFilteredByPrice = createAsyncThunk(
  'products/fetchProductsFilteredByPrice',
  async ({ title, priceMin, priceMax }) => {
    const params = new URLSearchParams()
    if (title) params.append('title', title)
    if (priceMin !== undefined && priceMin !== null) params.append('priceMin', priceMin)
    if (priceMax !== undefined && priceMax !== null) params.append('priceMax', priceMax)

    const url = `${API_BASE_URL}/products/filterPrices?${params.toString()}`
    const response = await axios.get(url, {
      headers: {
        ...getAuthHeaders(),
      },
    })
    return response.data
  }
)

// 3.4 GET /products/attributes
export const fetchProductsByAttributes = createAsyncThunk(
  'products/fetchProductsByAttributes',
  async ({ title, description, priceMax }) => {
    const params = new URLSearchParams()
    if (title) params.append('title', title)
    if (description) params.append('description', description)
    if (priceMax !== undefined && priceMax !== null) params.append('priceMax', priceMax)

    const url = `${API_BASE_URL}/products/attributes?${params.toString()}`
    const response = await axios.get(url, {
      headers: {
        ...getAuthHeaders(),
      },
    })
    return response.data
  }
)

// 3.x GET /products/with-attributes
export const fetchProductsWithAttributes = createAsyncThunk(
  'products/fetchProductsWithAttributes',
  async (sort) => {
    const params = new URLSearchParams()
    if (sort) params.append('sort', sort)
    const query = params.toString()
    const url = query
      ? `${API_BASE_URL}/products/with-attributes?${query}`
      : `${API_BASE_URL}/products/with-attributes`

    const response = await axios.get(url, {
      headers: {
        ...getAuthHeaders(),
      },
    })
    return response.data
  }
)

// 3.x GET /products/filter-by-attributes
export const fetchProductsFilteredByAttributes = createAsyncThunk(
  'products/fetchProductsFilteredByAttributes',
  async ({ sort, categoryId, attributeFilters }) => {
    const params = new URLSearchParams()
    if (sort) params.append('sort', sort)
    if (categoryId) params.append('categoryId', categoryId)
    if (attributeFilters) params.append('attributeFilters', attributeFilters)

    const url = `${API_BASE_URL}/products/filter-by-attributes?${params.toString()}`
    const response = await axios.get(url, {
      headers: {
        ...getAuthHeaders(),
      },
    })
    return response.data
  }
)

// 4.1 POST /products
export const createProduct = createAsyncThunk(
  'products/createProduct',
  async (payload) => {
    const response = await axios.post(`${API_BASE_URL}/products`, payload, {
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      },
    })
    return response.data
  }
)

// 4.2 PUT /products/{id}
export const updateProduct = createAsyncThunk(
  'products/updateProduct',
  async ({ productId, data }) => {
    const response = await axios.put(`${API_BASE_URL}/products/${productId}`, data, {
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      },
    })
    return response.data
  }
)

// 4.3 DELETE /products/{id}
export const deleteProduct = createAsyncThunk(
  'products/deleteProduct',
  async (productId) => {
    const response = await axios.delete(`${API_BASE_URL}/products/${productId}`, {
      headers: {
        ...getAuthHeaders(),
      },
    })
    return response.data
  }
)

const initialState = {
  items: [],
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
        if (Array.isArray(page)) {
          state.items = page
        } else if (page && Array.isArray(page.content)) {
          state.items = page.content
        } else {
          state.items = []
        }
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
        const product = action.payload
        state.currentItem = product
        if (product && product.product_id != null) {
          const index = state.items.findIndex((p) => p.product_id === product.product_id)
          if (index !== -1) {
            state.items[index] = product
          } else {
            state.items.push(product)
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
        state.items = Array.isArray(action.payload) ? action.payload : []
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
        state.items = Array.isArray(action.payload) ? action.payload : []
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
        state.items = Array.isArray(action.payload) ? action.payload : []
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
        state.items = Array.isArray(action.payload) ? action.payload : []
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
        state.items = Array.isArray(action.payload) ? action.payload : []
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
          state.items.push(apiResponse.data)
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
          const updated = apiResponse.data
          const index = state.items.findIndex((p) => p.product_id === updated.product_id)
          if (index !== -1) {
            state.items[index] = updated
          }
          if (state.currentItem && state.currentItem.product_id === updated.product_id) {
            state.currentItem = updated
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
        state.items = state.items.filter((p) => p.product_id !== productId)
        if (state.currentItem && state.currentItem.product_id === productId) {
          state.currentItem = null
        }
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.pending = false
        state.error = action.error.message || null
      })
  },
})

export default productSlice.reducer
