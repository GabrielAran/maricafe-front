import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { api } from '../api/axiosInstance'
import { buildAuthHeaders } from './user.slice'
import {
  fetchProducts,
  fetchProductById,
  fetchProductsByCategory,
  fetchProductsFilteredByPrice,
  fetchProductsByAttributes,
  fetchProductsWithAttributes,
  fetchProductsFilteredByAttributes,
} from './product.slice.js'

/**
 * Extracts discount entities from raw backend product payloads
 * @param {Array|Object} payload - Raw backend product data (before normalization)
 * @returns {Array} Array of discount entities
 */
function extractDiscountsFromProductPayload(payload) {
  // Handle paginated response
  const rawItems = Array.isArray(payload) 
    ? payload 
    : payload?.content ?? []
  
  if (!Array.isArray(rawItems)) return []
  
  const discounts = []
  const discountMap = new Map() // Use Map to deduplicate by discount_id
  
  rawItems.forEach(product => {
    // Backend product has discount_id and discount_percentage fields
    if (product.discount_id != null && product.discount_percentage != null && product.discount_percentage > 0) {
      const discountId = product.discount_id
      // Only add if not already in map (deduplicate)
      if (!discountMap.has(discountId)) {
        const discount = {
          discount_id: discountId,
          product_id: product.product_id,
          discount_percentage: product.discount_percentage,
        }
        discounts.push(discount)
        discountMap.set(discountId, discount)
      }
    }
  })
  
  return discounts
}

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

// Bulk create discounts for multiple products
export const createBulkDiscounts = createAsyncThunk(
  'discount/createBulkDiscounts',
  async ({ productIds, discountPercentage }, { getState }) => {
    const promises = productIds.map(productId =>
      api.post(
        `/discounts/${productId}`,
        { discount_percentage: discountPercentage },
        { headers: buildAuthHeaders(getState(), true) }
      )
    )
    const results = await Promise.all(promises)
    return results.map(res => res.data)
  }
)

// Bulk delete discounts
export const deleteBulkDiscounts = createAsyncThunk(
  'discount/deleteBulkDiscounts',
  async (discountIds, { getState }) => {
    const promises = discountIds.map(discountId =>
      api.delete(
        `/discounts/${discountId}`,
        { headers: buildAuthHeaders(getState()) }
      )
    )
    const results = await Promise.all(promises)
    return results.map(res => res.data)
  }
)

const initialState = {
  discounts: [],
  // Map of product_id -> discount info for quick lookup and merging with products
  productDiscounts: {}, // { [productId]: { discount_id, discount_percentage } }
  pending: false,
  error: null,
}

const discountSlice = createSlice({
  name: 'discount',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Derive discounts from product fetch operations
    // These are the primary source of discount data for the storefront
    // Discounts are extracted from product payloads and merged into discountSlice
    
    builder
      .addCase(fetchProducts.fulfilled, (state, action) => {
        const extractedDiscounts = extractDiscountsFromProductPayload(action.payload)
        // Merge extracted discounts with existing ones (update existing, add new)
        extractedDiscounts.forEach(discount => {
          const existingIndex = state.discounts.findIndex(
            d => d.discount_id === discount.discount_id
          )
          if (existingIndex !== -1) {
            state.discounts[existingIndex] = discount
          } else {
            state.discounts.push(discount)
          }
          // Update productDiscounts map for quick lookup
          if (discount.product_id != null) {
            state.productDiscounts[discount.product_id] = {
              discount_id: discount.discount_id,
              discount_percentage: discount.discount_percentage,
            }
          }
        })
      })

    builder
      .addCase(fetchProductById.fulfilled, (state, action) => {
        // Single product - extract discount if present
        const product = action.payload
        if (product && product.discount_id != null && product.discount_percentage != null && product.discount_percentage > 0) {
          const discount = {
            discount_id: product.discount_id,
            product_id: product.product_id,
            discount_percentage: product.discount_percentage,
          }
          const existingIndex = state.discounts.findIndex(
            d => d.discount_id === discount.discount_id
          )
          if (existingIndex !== -1) {
            state.discounts[existingIndex] = discount
          } else {
            state.discounts.push(discount)
          }
          // Update productDiscounts map
          if (discount.product_id != null) {
            state.productDiscounts[discount.product_id] = {
              discount_id: discount.discount_id,
              discount_percentage: discount.discount_percentage,
            }
          }
        }
      })

    builder
      .addCase(fetchProductsByCategory.fulfilled, (state, action) => {
        const extractedDiscounts = extractDiscountsFromProductPayload(action.payload)
        extractedDiscounts.forEach(discount => {
          const existingIndex = state.discounts.findIndex(
            d => d.discount_id === discount.discount_id
          )
          if (existingIndex !== -1) {
            state.discounts[existingIndex] = discount
          } else {
            state.discounts.push(discount)
          }
          // Update productDiscounts map
          if (discount.product_id != null) {
            state.productDiscounts[discount.product_id] = {
              discount_id: discount.discount_id,
              discount_percentage: discount.discount_percentage,
            }
          }
        })
      })

    builder
      .addCase(fetchProductsFilteredByPrice.fulfilled, (state, action) => {
        const extractedDiscounts = extractDiscountsFromProductPayload(action.payload)
        extractedDiscounts.forEach(discount => {
          const existingIndex = state.discounts.findIndex(
            d => d.discount_id === discount.discount_id
          )
          if (existingIndex !== -1) {
            state.discounts[existingIndex] = discount
          } else {
            state.discounts.push(discount)
          }
          // Update productDiscounts map
          if (discount.product_id != null) {
            state.productDiscounts[discount.product_id] = {
              discount_id: discount.discount_id,
              discount_percentage: discount.discount_percentage,
            }
          }
        })
      })

    builder
      .addCase(fetchProductsByAttributes.fulfilled, (state, action) => {
        const extractedDiscounts = extractDiscountsFromProductPayload(action.payload)
        extractedDiscounts.forEach(discount => {
          const existingIndex = state.discounts.findIndex(
            d => d.discount_id === discount.discount_id
          )
          if (existingIndex !== -1) {
            state.discounts[existingIndex] = discount
          } else {
            state.discounts.push(discount)
          }
          // Update productDiscounts map
          if (discount.product_id != null) {
            state.productDiscounts[discount.product_id] = {
              discount_id: discount.discount_id,
              discount_percentage: discount.discount_percentage,
            }
          }
        })
      })

    builder
      .addCase(fetchProductsWithAttributes.fulfilled, (state, action) => {
        const extractedDiscounts = extractDiscountsFromProductPayload(action.payload)
        extractedDiscounts.forEach(discount => {
          const existingIndex = state.discounts.findIndex(
            d => d.discount_id === discount.discount_id
          )
          if (existingIndex !== -1) {
            state.discounts[existingIndex] = discount
          } else {
            state.discounts.push(discount)
          }
          // Update productDiscounts map
          if (discount.product_id != null) {
            state.productDiscounts[discount.product_id] = {
              discount_id: discount.discount_id,
              discount_percentage: discount.discount_percentage,
            }
          }
        })
      })

    builder
      .addCase(fetchProductsFilteredByAttributes.fulfilled, (state, action) => {
        const extractedDiscounts = extractDiscountsFromProductPayload(action.payload)
        extractedDiscounts.forEach(discount => {
          const existingIndex = state.discounts.findIndex(
            d => d.discount_id === discount.discount_id
          )
          if (existingIndex !== -1) {
            state.discounts[existingIndex] = discount
          } else {
            state.discounts.push(discount)
          }
          // Update productDiscounts map
          if (discount.product_id != null) {
            state.productDiscounts[discount.product_id] = {
              discount_id: discount.discount_id,
              discount_percentage: discount.discount_percentage,
            }
          }
        })
      })

    // Admin discount CRUD operations
    // These update discounts immediately for admin UI, but storefront should refetch products
    
    builder
      .addCase(createDiscount.pending, (state) => {
        state.pending = true
        state.error = null
      })
      .addCase(createDiscount.fulfilled, (state, action) => {
        state.pending = false
        const apiResponse = action.payload
        if (apiResponse && apiResponse.data) {
          const discount = apiResponse.data
          // Add discount to local state for admin UI
          const existingIndex = state.discounts.findIndex(
            (d) => d.discount_id === discount.discount_id
          )
          if (existingIndex === -1) {
            state.discounts.push(discount)
          }
          // Update productDiscounts map for immediate UI updates
          if (discount.product_id != null) {
            state.productDiscounts[discount.product_id] = {
              discount_id: discount.discount_id,
              discount_percentage: discount.discount_percentage,
            }
          }
        }
      })
      .addCase(createDiscount.rejected, (state, action) => {
        state.pending = false
        state.error = action.error.message || null
      })

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
          } else {
            state.discounts.push(updated)
          }
          // Update productDiscounts map for immediate UI updates
          if (updated.product_id != null) {
            state.productDiscounts[updated.product_id] = {
              discount_id: updated.discount_id,
              discount_percentage: updated.discount_percentage,
            }
          }
        }
      })
      .addCase(updateDiscount.rejected, (state, action) => {
        state.pending = false
        state.error = action.error.message || null
      })

    builder
      .addCase(deleteDiscount.pending, (state) => {
        state.pending = true
        state.error = null
      })
      .addCase(deleteDiscount.fulfilled, (state, action) => {
        state.pending = false
        const discountId = action.meta.arg
        // Find the discount to get product_id before removing
        const discount = state.discounts.find((d) => d.discount_id === discountId)
        state.discounts = state.discounts.filter((d) => d.discount_id !== discountId)
        // Remove from productDiscounts map
        if (discount && discount.product_id != null) {
          delete state.productDiscounts[discount.product_id]
        }
      })
      .addCase(deleteDiscount.rejected, (state, action) => {
        state.pending = false
        state.error = action.error.message || null
      })

    builder
      .addCase(createBulkDiscounts.pending, (state) => {
        state.pending = true
        state.error = null
      })
      .addCase(createBulkDiscounts.fulfilled, (state, action) => {
        state.pending = false
        const results = action.payload
        if (Array.isArray(results)) {
          results.forEach(result => {
            if (result && result.data) {
              const discount = result.data
              const existingIndex = state.discounts.findIndex(
                (d) => d.discount_id === discount.discount_id
              )
              if (existingIndex === -1) {
                state.discounts.push(discount)
              }
              // Update productDiscounts map for immediate UI updates
              if (discount.product_id != null) {
                state.productDiscounts[discount.product_id] = {
                  discount_id: discount.discount_id,
                  discount_percentage: discount.discount_percentage,
                }
              }
            }
          })
        }
      })
      .addCase(createBulkDiscounts.rejected, (state, action) => {
        state.pending = false
        state.error = action.error.message || null
      })

    builder
      .addCase(deleteBulkDiscounts.pending, (state) => {
        state.pending = true
        state.error = null
      })
      .addCase(deleteBulkDiscounts.fulfilled, (state, action) => {
        state.pending = false
        const discountIds = action.meta.arg
        if (Array.isArray(discountIds)) {
          // Find discounts to get product_ids before removing
          const discountsToRemove = state.discounts.filter(
            (d) => discountIds.includes(d.discount_id)
          )
          state.discounts = state.discounts.filter(
            (d) => !discountIds.includes(d.discount_id)
          )
          // Remove from productDiscounts map
          discountsToRemove.forEach(discount => {
            if (discount.product_id != null) {
              delete state.productDiscounts[discount.product_id]
            }
          })
        }
      })
      .addCase(deleteBulkDiscounts.rejected, (state, action) => {
        state.pending = false
        state.error = action.error.message || null
      })
  },
})

export default discountSlice.reducer

// Selectors
export const selectDiscounts = (state) => state.discount.discounts
export const selectDiscountPending = (state) => state.discount.pending
export const selectDiscountError = (state) => state.discount.error
export const selectProductDiscounts = (state) => state.discount.productDiscounts

