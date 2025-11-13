import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

const API_BASE_URL = 'http://127.0.0.1:4002'

// Helper to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('maricafe-token')
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
}

// Helper to handle API responses
const fetchData = async (url, options = {}) => {
  try {
    const response = await fetch(url, options)
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }
    const text = await response.text()
    if (!text) return null
    return JSON.parse(text)
  } catch (error) {
    console.error('API Error:', error)
    throw error
  }
}

// Async thunks for API operations
export const createDiscount = createAsyncThunk(
  'discount/createDiscount',
  async ({ productId, discountPercentage }, { rejectWithValue }) => {
    try {
      const data = await fetchData(`${API_BASE_URL}/discounts/${productId}`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ discount_percentage: discountPercentage })
      })
      return data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const updateDiscount = createAsyncThunk(
  'discount/updateDiscount',
  async ({ discountId, discountPercentage }, { rejectWithValue }) => {
    try {
      const data = await fetchData(`${API_BASE_URL}/discounts/${discountId}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ discount_percentage: discountPercentage })
      })
      return { discountId, data }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const deleteDiscount = createAsyncThunk(
  'discount/deleteDiscount',
  async (discountId, { rejectWithValue }) => {
    try {
      await fetchData(`${API_BASE_URL}/discounts/${discountId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      })
      return discountId
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const createBulkDiscounts = createAsyncThunk(
  'discount/createBulkDiscounts',
  async ({ productIds, discountPercentage }, { rejectWithValue }) => {
    try {
      const promises = productIds.map(productId =>
        fetchData(`${API_BASE_URL}/discounts/${productId}`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ discount_percentage: discountPercentage })
        })
      )
      const results = await Promise.all(promises)
      return { productIds, results }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const updateBulkDiscounts = createAsyncThunk(
  'discount/updateBulkDiscounts',
  async ({ discountIds, discountPercentage }, { rejectWithValue }) => {
    try {
      const promises = discountIds.map(discountId =>
        fetchData(`${API_BASE_URL}/discounts/${discountId}`, {
          method: 'PATCH',
          headers: getAuthHeaders(),
          body: JSON.stringify({ discount_percentage: discountPercentage })
        })
      )
      const results = await Promise.all(promises)
      return { discountIds, results }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const deleteBulkDiscounts = createAsyncThunk(
  'discount/deleteBulkDiscounts',
  async (discountIds, { rejectWithValue }) => {
    try {
      const promises = discountIds.map(discountId =>
        fetchData(`${API_BASE_URL}/discounts/${discountId}`, {
          method: 'DELETE',
          headers: getAuthHeaders()
        })
      )
      await Promise.all(promises)
      return discountIds
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// Initial state
const initialState = {
  // Note: Discounts are stored on products, not separately
  // This slice mainly manages loading/error states for discount operations
  loading: false,
  error: null,
  lastOperation: null, // Track last operation for UI feedback
}

// Discount slice
const discountSlice = createSlice({
  name: 'discount',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearLastOperation: (state) => {
      state.lastOperation = null
    }
  },
  extraReducers: (builder) => {
    // Create discount
    builder
      .addCase(createDiscount.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createDiscount.fulfilled, (state, action) => {
        state.loading = false
        state.lastOperation = { type: 'create', data: action.payload }
      })
      .addCase(createDiscount.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

    // Update discount
    builder
      .addCase(updateDiscount.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateDiscount.fulfilled, (state, action) => {
        state.loading = false
        state.lastOperation = { type: 'update', data: action.payload }
      })
      .addCase(updateDiscount.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

    // Delete discount
    builder
      .addCase(deleteDiscount.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteDiscount.fulfilled, (state, action) => {
        state.loading = false
        state.lastOperation = { type: 'delete', discountId: action.payload }
      })
      .addCase(deleteDiscount.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

    // Bulk create discounts
    builder
      .addCase(createBulkDiscounts.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createBulkDiscounts.fulfilled, (state, action) => {
        state.loading = false
        state.lastOperation = { type: 'bulkCreate', data: action.payload }
      })
      .addCase(createBulkDiscounts.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

    // Bulk update discounts
    builder
      .addCase(updateBulkDiscounts.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateBulkDiscounts.fulfilled, (state, action) => {
        state.loading = false
        state.lastOperation = { type: 'bulkUpdate', data: action.payload }
      })
      .addCase(updateBulkDiscounts.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

    // Bulk delete discounts
    builder
      .addCase(deleteBulkDiscounts.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteBulkDiscounts.fulfilled, (state, action) => {
        state.loading = false
        state.lastOperation = { type: 'bulkDelete', discountIds: action.payload }
      })
      .addCase(deleteBulkDiscounts.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  }
})

export const { clearError, clearLastOperation } = discountSlice.actions
export default discountSlice.reducer

