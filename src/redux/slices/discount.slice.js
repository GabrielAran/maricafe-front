import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

const API_BASE_URL = 'http://127.0.0.1:4002'

const getAuthHeaders = () => {
  const token = localStorage.getItem('maricafe-token')
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
}

// EP2: 3.6 POST /discounts/{productId}
export const createDiscount = createAsyncThunk(
  'discount/createDiscount',
  async ({ productId, discountPercentage }) => {
    const res = await axios.post(
      `${API_BASE_URL}/discounts/${productId}`,
      { discount_percentage: discountPercentage },
      { headers: getAuthHeaders() }
    )
    return res.data
  }
)

// EP3: 3.7 PATCH /discounts/{discountId}
export const updateDiscount = createAsyncThunk(
  'discount/updateDiscount',
  async ({ discountId, discountPercentage }) => {
    const res = await axios.patch(
      `${API_BASE_URL}/discounts/${discountId}`,
      { discount_percentage: discountPercentage },
      { headers: getAuthHeaders() }
    )
    return res.data
  }
)

// EP1: DELETE /discounts/{discountId}
export const deleteDiscount = createAsyncThunk(
  'discount/deleteDiscount',
  async (discountId) => {
    const res = await axios.delete(
      `${API_BASE_URL}/discounts/${discountId}`,
      { headers: getAuthHeaders() }
    )
    return res.data
  }
)

const initialState = {
  items: [],
  pending: false,
  error: null,
}

const discountSlice = createSlice({
  name: 'discount',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Create
    builder
      .addCase(createDiscount.pending, (state) => {
        state.pending = true
        state.error = null
      })
      .addCase(createDiscount.fulfilled, (state, action) => {
        state.pending = false
        const apiResponse = action.payload
        if (apiResponse && apiResponse.data) {
          state.items.push(apiResponse.data)
        }
      })
      .addCase(createDiscount.rejected, (state, action) => {
        state.pending = false
        state.error = action.error.message || null
      })

    // Update
    builder
      .addCase(updateDiscount.pending, (state) => {
        state.pending = true
        state.error = null
      })
      .addCase(updateDiscount.fulfilled, (state, action) => {
        state.pending = false
        const apiResponse = action.payload
        if (apiResponse && apiResponse.data && apiResponse.data.discount_id != null) {
          const updated = apiResponse.data
          const index = state.items.findIndex((d) => d.discount_id === updated.discount_id)
          if (index !== -1) {
            state.items[index] = updated
          }
        }
      })
      .addCase(updateDiscount.rejected, (state, action) => {
        state.pending = false
        state.error = action.error.message || null
      })

    // Delete
    builder
      .addCase(deleteDiscount.pending, (state) => {
        state.pending = true
        state.error = null
      })
      .addCase(deleteDiscount.fulfilled, (state, action) => {
        state.pending = false
        const discountId = action.meta.arg
        state.items = state.items.filter((d) => d.discount_id !== discountId)
      })
      .addCase(deleteDiscount.rejected, (state, action) => {
        state.pending = false
        state.error = action.error.message || null
      })
  },
})

export default discountSlice.reducer

