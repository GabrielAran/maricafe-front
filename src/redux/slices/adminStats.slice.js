import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

const API_BASE_URL = 'http://127.0.0.1:4002'

const getAuthHeaders = () => {
  const token = localStorage.getItem('maricafe-token')
  if (!token) return {}
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  }
}

// GET /admin/stats/overview
export const fetchOverviewStats = createAsyncThunk(
  'adminStats/fetchOverviewStats',
  async () => {
    const res = await axios.get(`${API_BASE_URL}/admin/stats/overview`, {
      headers: getAuthHeaders(),
    })
    return res.data
  }
)

// GET /admin/stats/products-by-category
export const fetchProductsByCategory = createAsyncThunk(
  'adminStats/fetchProductsByCategory',
  async () => {
    const res = await axios.get(`${API_BASE_URL}/admin/stats/products-by-category`, {
      headers: getAuthHeaders(),
    })
    return res.data
  }
)

// GET /admin/stats/low-stock-products
export const fetchLowStockProducts = createAsyncThunk(
  'adminStats/fetchLowStockProducts',
  async () => {
    const res = await axios.get(`${API_BASE_URL}/admin/stats/low-stock-products`, {
      headers: getAuthHeaders(),
    })
    return res.data
  }
)

// GET /admin/stats/top-selling-products
export const fetchTopSellingProducts = createAsyncThunk(
  'adminStats/fetchTopSellingProducts',
  async () => {
    const res = await axios.get(`${API_BASE_URL}/admin/stats/top-selling-products`, {
      headers: getAuthHeaders(),
    })
    return res.data
  }
)

// GET /admin/stats/top-spending-users
export const fetchTopSpendingUsers = createAsyncThunk(
  'adminStats/fetchTopSpendingUsers',
  async () => {
    const res = await axios.get(`${API_BASE_URL}/admin/stats/top-spending-users`, {
      headers: getAuthHeaders(),
    })
    return res.data
  }
)

// GET /admin/stats/discounted-products
export const fetchDiscountedProducts = createAsyncThunk(
  'adminStats/fetchDiscountedProducts',
  async () => {
    const res = await axios.get(`${API_BASE_URL}/admin/stats/discounted-products`, {
      headers: getAuthHeaders(),
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
          state.overview = apiResponse.data
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
          state.productsByCategory = apiResponse.data
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
          state.lowStockProducts = Array.isArray(apiResponse.data) ? apiResponse.data : []
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
          state.topSellingProducts = Array.isArray(apiResponse.data) ? apiResponse.data : []
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
          state.topSpendingUsers = Array.isArray(apiResponse.data) ? apiResponse.data : []
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
          state.discountedProducts = Array.isArray(apiResponse.data) ? apiResponse.data : []
        }
      })
      .addCase(fetchDiscountedProducts.rejected, (state, action) => {
        state.pending = false
        state.error = action.error.message || null
      })
  },
})

export default adminStatsSlice.reducer

