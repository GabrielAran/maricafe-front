import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { api } from '../api/axiosInstance'

import { buildAuthHeaders } from './user.slice'

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

const initialState = {
  items: [],
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
        const apiResponse = action.payload
        if (apiResponse && apiResponse.data) {
          state.items.push(apiResponse.data)
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
        state.items = Array.isArray(action.payload) ? action.payload : []
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
        const order = action.payload
        state.currentItem = order
        if (order && order.order_id != null) {
          const index = state.items.findIndex((o) => o.order_id === order.order_id)
          if (index !== -1) {
            state.items[index] = order
          } else {
            state.items.push(order)
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
        const order = action.payload
        state.currentItem = order
        if (order && order.order_id != null) {
          const index = state.items.findIndex((o) => o.order_id === order.order_id)
          if (index !== -1) {
            state.items[index] = order
          } else {
            state.items.push(order)
          }
        }
      })
      .addCase(fetchUserOrderById.rejected, (state, action) => {
        state.pending = false
        state.error = action.error.message || null
      })

    // Delete order
    builder
      .addCase(deleteOrder.pending, (state) => {
        state.pending = true
        state.error = null
      })
      .addCase(deleteOrder.fulfilled, (state, action) => {
        state.pending = false
        const orderId = action.meta.arg
        state.items = state.items.filter((o) => o.order_id !== orderId)
        if (state.currentItem && state.currentItem.order_id === orderId) {
          state.currentItem = null
        }
      })
      .addCase(deleteOrder.rejected, (state, action) => {
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
        state.items = Array.isArray(action.payload) ? action.payload : []
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
        state.items = Array.isArray(action.payload) ? action.payload : []
      })
      .addCase(fetchInactiveOrders.rejected, (state, action) => {
        state.pending = false
        state.error = action.error.message || null
      })
  },
})

export default orderSlice.reducer

