import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { api } from '../api/axiosInstance'

import { buildAuthHeaders } from './user.slice'
import { normalizeOrder } from '../../utils/orderHelper.js'

// 4.1 POST /orders -> Crear orden del usuario autenticado
export const createOrder = createAsyncThunk(
  'order/createOrder',
  async (orderData, { getState }) => {
    const response = await api.post('/orders', orderData, {
      headers: buildAuthHeaders(getState(), true),
    })
    return response.data
  }
)

// PUT /orders/{id}/finalize -> Finalizar orden
export const finalizeOrder = createAsyncThunk(
  'order/finalizeOrder',
  async (orderId, { getState }) => {
    const response = await api.put(`/orders/${orderId}/finalize`, null, {
      headers: buildAuthHeaders(getState()),
    })
    return response.data
  }
)

// 4.2 GET /orders/user -> Listar órdenes del usuario autenticado
export const fetchUserOrders = createAsyncThunk(
  'order/fetchUserOrders',
  async (_, { getState }) => {
    const response = await api.get('/orders/user', {
      headers: buildAuthHeaders(getState()),
    })
    return response.data
  }
)

// 4.3 GET /orders/{id} -> Obtener una orden por id (solo ADMIN)
export const fetchOrderById = createAsyncThunk(
  'order/fetchOrderById',
  async (orderId, { getState }) => {
    const response = await api.get(`/orders/${orderId}`, {
      headers: buildAuthHeaders(getState()),
    })
    return response.data
  }
)

// 4.4 GET /orders/user/{id} -> Obtener una orden del usuario autenticado
export const fetchUserOrderById = createAsyncThunk(
  'order/fetchUserOrderById',
  async (orderId, { getState }) => {
    const response = await api.get(`/orders/user/${orderId}`, {
      headers: buildAuthHeaders(getState()),
    })
    return response.data
  }
)

// DELETE /orders/{id} -> Desactivar orden
export const deleteOrder = createAsyncThunk(
  'order/deleteOrder',
  async (orderId, { getState }) => {
    const response = await api.delete(`/orders/${orderId}`, {
      headers: buildAuthHeaders(getState()),
    })
    return response.data
  }
)

// GET /orders/admin/active -> Obtener todas las órdenes activas (solo ADMIN)
export const fetchActiveOrders = createAsyncThunk(
  'order/fetchActiveOrders',
  async (_, { getState }) => {
    const response = await api.get('/orders/admin/active', {
      headers: buildAuthHeaders(getState()),
    })
    return response.data
  }
)

// GET /orders/admin/inactive -> Obtener todas las órdenes inactivas (solo ADMIN)
export const fetchInactiveOrders = createAsyncThunk(
  'order/fetchInactiveOrders',
  async (_, { getState }) => {
    const response = await api.get('/orders/admin/inactive', {
      headers: buildAuthHeaders(getState()),
    })
    return response.data
  }
)

export const fetchAllOrders = createAsyncThunk(
  'order/fetchAllOrders',
  async (_, { getState }) => {
    const headers = buildAuthHeaders(getState())
    const [activeResponse, inactiveResponse] = await Promise.all([
      api.get('/orders/admin/active', { headers }),
      api.get('/orders/admin/inactive', { headers })
    ])
    const activeOrders = Array.isArray(activeResponse.data) ? activeResponse.data : []
    const inactiveOrders = Array.isArray(inactiveResponse.data) ? inactiveResponse.data : []

    const allOrders = [...activeOrders, ...inactiveOrders].sort((a, b) => {
      const dateA = new Date(a.order_date || a.createdAt || 0)
      const dateB = new Date(b.order_date || b.createdAt || 0)
      return dateB - dateA
    })
    return allOrders
  }
)

const initialState = {
  orders: [],
  pending: false,
  error: null,
  currentItem: null,
}

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Create order
    builder
      .addCase(createOrder.pending, (state) => {
        state.pending = true
        state.error = null
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.pending = false
        const normalized = normalizeOrder(action.payload)
        state.currentItem = normalized
        if (normalized && normalized.order_id != null) {
          const index = state.orders.findIndex((o) => o.order_id === normalized.order_id)
          if (index !== -1) {
            state.orders[index] = normalized
          } else {
            state.orders.push(normalized)
          }
        }
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.pending = false
        state.error = action.error.message || null
      })

    // Fetch user orders
    builder
      .addCase(fetchUserOrders.pending, (state) => {
        state.pending = true
        state.error = null
      })
      .addCase(fetchUserOrders.fulfilled, (state, action) => {
        state.pending = false
        const rawItems = Array.isArray(action.payload) ? action.payload : []
        state.orders = rawItems.map(normalizeOrder)
      })
      .addCase(fetchUserOrders.rejected, (state, action) => {
        state.pending = false
        state.error = action.error.message || null
      })

    // Fetch order by id (admin)
    builder
      .addCase(fetchOrderById.pending, (state) => {
        state.pending = true
        state.error = null
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.pending = false
        const normalized = normalizeOrder(action.payload)
        state.currentItem = normalized
        if (normalized && normalized.order_id != null) {
          const index = state.orders.findIndex((o) => o.order_id === normalized.order_id)
          if (index !== -1) {
            state.orders[index] = normalized
          } else {
            state.orders.push(normalized)
          }
        }
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.pending = false
        state.error = action.error.message || null
      })

    // Fetch user order by id
    builder
      .addCase(fetchUserOrderById.pending, (state) => {
        state.pending = true
        state.error = null
      })
      .addCase(fetchUserOrderById.fulfilled, (state, action) => {
        state.pending = false
        const normalized = normalizeOrder(action.payload)
        state.currentItem = normalized
        if (normalized && normalized.order_id != null) {
          const index = state.orders.findIndex((o) => o.order_id === normalized.order_id)
          if (index !== -1) {
            state.orders[index] = normalized
          } else {
            state.orders.push(normalized)
          }
        }
      })
      .addCase(fetchUserOrderById.rejected, (state, action) => {
        state.pending = false
        state.error = action.error.message || null
      })

    // Delete (cancel) order
    builder
      .addCase(deleteOrder.pending, (state) => {
        state.pending = true
        state.error = null
      })
      .addCase(deleteOrder.fulfilled, (state, action) => {
        state.pending = false
        const orderId = action.meta.arg

        // Update list
        const index = state.orders.findIndex((o) => o.order_id === orderId)
        if (index !== -1) {
          state.orders[index] = {
            ...state.orders[index],
            active: false,
          }
        }

        // Update detail if it's the same order
        if (state.currentItem && state.currentItem.order_id === orderId) {
          state.currentItem = {
            ...state.currentItem,
            active: false,
          }
        }
      })
      .addCase(deleteOrder.rejected, (state, action) => {
        state.pending = false
        state.error = action.error.message || null
      })

    // Finalize order
    builder
      .addCase(finalizeOrder.pending, (state) => {
        state.pending = true
        state.error = null
      })
      .addCase(finalizeOrder.fulfilled, (state, action) => {
        state.pending = false
        const normalized = normalizeOrder(action.payload)
        if (normalized && normalized.order_id != null) {
          const index = state.orders.findIndex((o) => o.order_id === normalized.order_id)
          if (index !== -1) {
            state.orders[index] = normalized
          } else {
            state.orders.push(normalized)
          }
        }
        if (state.currentItem && state.currentItem.order_id === normalized.order_id) {
          state.currentItem = normalized
        }
      })
      .addCase(finalizeOrder.rejected, (state, action) => {
        state.pending = false
        state.error = action.error.message || null
      })

    // Fetch active orders (admin)
    builder
      .addCase(fetchActiveOrders.pending, (state) => {
        state.pending = true
        state.error = null
      })
      .addCase(fetchActiveOrders.fulfilled, (state, action) => {
        state.pending = false
        const rawItems = Array.isArray(action.payload) ? action.payload : []
        state.orders = rawItems.map(normalizeOrder)
      })
      .addCase(fetchActiveOrders.rejected, (state, action) => {
        state.pending = false
        state.error = action.error.message || null
      })

    // Fetch inactive orders (admin)
    builder
      .addCase(fetchInactiveOrders.pending, (state) => {
        state.pending = true
        state.error = null
      })
      .addCase(fetchInactiveOrders.fulfilled, (state, action) => {
        state.pending = false
        const rawItems = Array.isArray(action.payload) ? action.payload : []
        state.orders = rawItems.map(normalizeOrder)
      })
      .addCase(fetchInactiveOrders.rejected, (state, action) => {
        state.pending = false
        state.error = action.error.message || null
      })

    // Fetch all orders (admin) - combines active and inactive
    builder
      .addCase(fetchAllOrders.pending, (state) => {
        state.pending = true
        state.error = null
      })
      .addCase(fetchAllOrders.fulfilled, (state, action) => {
        state.pending = false
        const rawItems = Array.isArray(action.payload) ? action.payload : []
        state.orders = rawItems.map(normalizeOrder)
      })
      .addCase(fetchAllOrders.rejected, (state, action) => {
        state.pending = false
        state.error = action.error.message || null
      })
  },
})

export default orderSlice.reducer

