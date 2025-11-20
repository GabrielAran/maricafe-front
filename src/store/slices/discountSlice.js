import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

const API_BASE_URL = 'http://127.0.0.1:4002'

// Helper to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('maricafe-token')
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
}

// Async thunks for API operations
export const createDiscount = createAsyncThunk(
  'discount/createDiscount',
  async ({ productId, discountPercentage }) => {
    const response = await axios.post(
      `${API_BASE_URL}/discounts/${productId}`,
      { discount_percentage: discountPercentage },
      { headers: getAuthHeaders() }
    )
    return response.data
  }
)

export const updateDiscount = createAsyncThunk(
  'discount/updateDiscount',
  async ({ discountId, discountPercentage }) => {
    const response = await axios.patch(
      `${API_BASE_URL}/discounts/${discountId}`,
      { discount_percentage: discountPercentage },
      { headers: getAuthHeaders() }
    )
    return { discountId, data: response.data }
  }
)

export const deleteDiscount = createAsyncThunk(
  'discount/deleteDiscount',
  async (discountId) => {
    await axios.delete(
      `${API_BASE_URL}/discounts/${discountId}`,
      { headers: getAuthHeaders() }
    )
    return discountId
  }
)

export const createBulkDiscounts = createAsyncThunk(
  'discount/createBulkDiscounts',
  async ({ productIds, discountPercentage }) => {
    const requests = productIds.map(productId =>
      axios.post(
        `${API_BASE_URL}/discounts/${productId}`,
        { discount_percentage: discountPercentage },
        { headers: getAuthHeaders() }
      )
    )
    const results = await Promise.all(requests)
    return { productIds, results: results.map(r => r.data) }
  }
)

export const updateBulkDiscounts = createAsyncThunk(
  'discount/updateBulkDiscounts',
  async ({ discountIds, discountPercentage }) => {
    const requests = discountIds.map(discountId =>
      axios.patch(
        `${API_BASE_URL}/discounts/${discountId}`,
        { discount_percentage: discountPercentage },
        { headers: getAuthHeaders() }
      )
    )
    const results = await Promise.all(requests)
    return { discountIds, results: results.map(r => r.data) }
  }
)

export const deleteBulkDiscounts = createAsyncThunk(
  'discount/deleteBulkDiscounts',
  async (discountIds) => {
    const requests = discountIds.map(discountId =>
      axios.delete(
        `${API_BASE_URL}/discounts/${discountId}`,
        { headers: getAuthHeaders() }
      )
    )
    await Promise.all(requests)
    return discountIds
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

