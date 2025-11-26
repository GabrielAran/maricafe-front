import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { api } from '../api/axiosInstance'

import { buildAuthHeaders } from './user.slice'
import {
  normalizeOverviewStats,
  normalizeProductsByCategory,
  normalizeLowStockProduct,
  normalizeTopSellingProduct,
  normalizeTopSpendingUser,
  normalizeDiscountedProduct,
} from '../../utils/adminStatsHelper.js'

// GET /admin/stats/overview
export const fetchOverviewStats = createAsyncThunk(
  'adminStats/fetchOverviewStats',
  async (_, { getState }) => {
    const res = await api.get('/admin/stats/overview', {
      headers: buildAuthHeaders(getState()),
    })
    return res.data
  }
)

// GET /admin/stats/products-by-category
export const fetchProductsByCategory = createAsyncThunk(
  'adminStats/fetchProductsByCategory',
  async (_, { getState }) => {
    const res = await api.get('/admin/stats/products-by-category', {
      headers: buildAuthHeaders(getState()),
    })
    return res.data
  }
)

// GET /admin/stats/low-stock-products
export const fetchLowStockProducts = createAsyncThunk(
  'adminStats/fetchLowStockProducts',
  async (_, { getState }) => {
    const res = await api.get('/admin/stats/low-stock-products', {
      headers: buildAuthHeaders(getState()),
    })
    return res.data
  }
)

// GET /admin/stats/top-selling-products
export const fetchTopSellingProducts = createAsyncThunk(
  'adminStats/fetchTopSellingProducts',
  async (_, { getState }) => {
    const res = await api.get('/admin/stats/top-selling-products', {
      headers: buildAuthHeaders(getState()),
    })
    return res.data
  }
)

// GET /admin/stats/top-spending-users
export const fetchTopSpendingUsers = createAsyncThunk(
  'adminStats/fetchTopSpendingUsers',
  async (_, { getState }) => {
    const res = await api.get('/admin/stats/top-spending-users', {
      headers: buildAuthHeaders(getState()),
    })
    return res.data
  }
)

// GET /admin/stats/discounted-products
export const fetchDiscountedProducts = createAsyncThunk(
  'adminStats/fetchDiscountedProducts',
  async (_, { getState }) => {
    const res = await api.get('/admin/stats/discounted-products', {
      headers: buildAuthHeaders(getState()),
    })
    return res.data
  }
)

const initialState = {
  overview: {},
  productsByCategory: {},
  lowStockProducts: [],
  topSellingProducts: [],
  topSpendingUsers: [],
  discountedProducts: [],
  pending: false,
  error: null,
}

const adminStatsSlice = createSlice({
  name: 'adminStats',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Fetch overview stats
    builder
      .addCase(fetchOverviewStats.pending, (state) => {
        state.pending = true
        state.error = null
      })
      .addCase(fetchOverviewStats.fulfilled, (state, action) => {
        state.pending = false
        const apiResponse = action.payload
        if (apiResponse && apiResponse.data) {
          state.overview = normalizeOverviewStats(apiResponse.data)
        }
      })
      .addCase(fetchOverviewStats.rejected, (state, action) => {
        state.pending = false
        state.error = action.error.message || null
      })

    // Fetch products by category
    builder
      .addCase(fetchProductsByCategory.pending, (state) => {
        state.pending = true
        state.error = null
      })
      .addCase(fetchProductsByCategory.fulfilled, (state, action) => {
        state.pending = false
        const apiResponse = action.payload
        if (apiResponse && apiResponse.data) {
          state.productsByCategory = normalizeProductsByCategory(apiResponse.data)
        }
      })
      .addCase(fetchProductsByCategory.rejected, (state, action) => {
        state.pending = false
        state.error = action.error.message || null
      })

    // Fetch low stock products
    builder
      .addCase(fetchLowStockProducts.pending, (state) => {
        state.pending = true
        state.error = null
      })
      .addCase(fetchLowStockProducts.fulfilled, (state, action) => {
        state.pending = false
        const apiResponse = action.payload
        if (apiResponse && apiResponse.data) {
          const rawItems = Array.isArray(apiResponse.data) ? apiResponse.data : []
          state.lowStockProducts = rawItems.map(normalizeLowStockProduct).filter(item => item !== null)
        }
      })
      .addCase(fetchLowStockProducts.rejected, (state, action) => {
        state.pending = false
        state.error = action.error.message || null
      })

    // Fetch top selling products
    builder
      .addCase(fetchTopSellingProducts.pending, (state) => {
        state.pending = true
        state.error = null
      })
      .addCase(fetchTopSellingProducts.fulfilled, (state, action) => {
        state.pending = false
        const apiResponse = action.payload
        if (apiResponse && apiResponse.data) {
          const rawItems = Array.isArray(apiResponse.data) ? apiResponse.data : []
          state.topSellingProducts = rawItems.map(normalizeTopSellingProduct).filter(item => item !== null)
        }
      })
      .addCase(fetchTopSellingProducts.rejected, (state, action) => {
        state.pending = false
        state.error = action.error.message || null
      })

    // Fetch top spending users
    builder
      .addCase(fetchTopSpendingUsers.pending, (state) => {
        state.pending = true
        state.error = null
      })
      .addCase(fetchTopSpendingUsers.fulfilled, (state, action) => {
        state.pending = false
        const apiResponse = action.payload
        if (apiResponse && apiResponse.data) {
          const rawItems = Array.isArray(apiResponse.data) ? apiResponse.data : []
          state.topSpendingUsers = rawItems.map(normalizeTopSpendingUser).filter(item => item !== null)
        }
      })
      .addCase(fetchTopSpendingUsers.rejected, (state, action) => {
        state.pending = false
        state.error = action.error.message || null
      })

    // Fetch discounted products
    builder
      .addCase(fetchDiscountedProducts.pending, (state) => {
        state.pending = true
        state.error = null
      })
      .addCase(fetchDiscountedProducts.fulfilled, (state, action) => {
        state.pending = false
        const apiResponse = action.payload
        if (apiResponse && apiResponse.data) {
          const rawItems = Array.isArray(apiResponse.data) ? apiResponse.data : []
          state.discountedProducts = rawItems.map(normalizeDiscountedProduct).filter(item => item !== null)
        }
      })
      .addCase(fetchDiscountedProducts.rejected, (state, action) => {
        state.pending = false
        state.error = action.error.message || null
      })
  },
})

export default adminStatsSlice.reducer

// Selectors
export const selectOverviewStats = (state) => state.adminStats.overview
export const selectProductsByCategory = (state) => state.adminStats.productsByCategory
export const selectLowStockProducts = (state) => state.adminStats.lowStockProducts
export const selectTopSellingProducts = (state) => state.adminStats.topSellingProducts
export const selectTopSpendingUsers = (state) => state.adminStats.topSpendingUsers
export const selectDiscountedProducts = (state) => state.adminStats.discountedProducts
export const selectAdminStatsPending = (state) => state.adminStats.pending
export const selectAdminStatsError = (state) => state.adminStats.error

