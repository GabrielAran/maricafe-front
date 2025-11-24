import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { api } from '../api/axiosInstance'

import { buildAuthHeaders } from './user.slice'

// EP2: 3.6 POST /discounts/{productId}
export const createDiscount = createAsyncThunk(
  'discount/createDiscount',
  async ({ productId, discountPercentage }, { getState }) => {
    const res = await api.post(
      `/discounts/${productId}`,
      { discount_percentage: discountPercentage },
      { headers: buildAuthHeaders(getState(), true) }
    )
    return res.data
  }
)

// EP3: 3.7 PATCH /discounts/{discountId}
export const updateDiscount = createAsyncThunk(
  'discount/updateDiscount',
  async ({ discountId, discountPercentage }, { getState }) => {
    const res = await api.patch(
      `/discounts/${discountId}`,
      { discount_percentage: discountPercentage },
      { headers: buildAuthHeaders(getState(), true) }
    )
    return res.data
  }
)

// EP1: DELETE /discounts/{discountId}
export const deleteDiscount = createAsyncThunk(
  'discount/deleteDiscount',
  async (discountId, { getState }) => {
    const res = await api.delete(
      `/discounts/${discountId}`,
      { headers: buildAuthHeaders(getState()) }
    )
    return res.data
  }
)

const initialState = {
  discounts: [],
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
          state.discounts.push(apiResponse.data)
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
          const index = state.discounts.findIndex((d) => d.discount_id === updated.discount_id)
          if (index !== -1) {
            state.discounts[index] = updated
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
        state.discounts = state.discounts.filter((d) => d.discount_id !== discountId)
      })
      .addCase(deleteDiscount.rejected, (state, action) => {
        state.pending = false
        state.error = action.error.message || null
      })
  },
})

export default discountSlice.reducer

