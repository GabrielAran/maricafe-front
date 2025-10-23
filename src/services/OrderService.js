import { ApiService } from './api.js'

export class OrderService {
  constructor() {
    this.orders = []
    this.loading = false
    this.error = null
    this.observers = []
  }

  // Observer pattern for state updates
  subscribe(callback) {
    this.observers.push(callback)
    return () => {
      this.observers = this.observers.filter(obs => obs !== callback)
    }
  }

  notify() {
    this.observers.forEach(callback => callback({
      orders: this.orders,
      loading: this.loading,
      error: this.error
    }))
  }

  // Get authentication headers
  getAuthHeaders() {
    const token = localStorage.getItem('maricafe-token')
    if (!token) {
      throw new Error('No hay token de autenticación')
    }
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }

  // Load all orders (active and inactive)
  async loadOrders() {
    try {
      this.loading = true
      this.error = null
      this.notify()

      const authHeaders = this.getAuthHeaders()
      
      // Fetch both active and inactive orders
      const [activeOrders, inactiveOrders] = await Promise.all([
        ApiService.getActiveOrders(authHeaders),
        ApiService.getInactiveOrders(authHeaders)
      ])

      // Transform and combine orders
      const transformedActiveOrders = activeOrders.map(order => this.transformOrder(order))
      const transformedInactiveOrders = inactiveOrders.map(order => this.transformOrder(order))
      
      // Combine and sort orders by date (newest first)
      const allOrders = [...transformedActiveOrders, ...transformedInactiveOrders]
      this.orders = allOrders.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0)
        const dateB = new Date(b.createdAt || 0)
        return dateB - dateA
      })

      console.log('OrderService: Loaded orders:', this.orders.length)
      this.error = null
    } catch (error) {
      console.error('OrderService: Error loading orders:', error)
      this.error = error.message
    } finally {
      this.loading = false
      this.notify() // Move notify here to ensure loading state is always updated
    }
  }

  // Get order by ID
  async getOrderById(orderId) {
    try {
      const authHeaders = this.getAuthHeaders()
      return await ApiService.getOrderById(orderId, authHeaders)
    } catch (error) {
      console.error('OrderService: Error getting order:', error)
      throw error
    }
  }

  // Cancel order (restores stock)
  async deleteOrder(orderId) {
    try {
      const authHeaders = this.getAuthHeaders()
      await ApiService.deleteOrder(orderId, authHeaders)
      
      // Update order status in local state instead of removing
      this.orders = this.orders.map(order => 
        order.id === orderId 
          ? { ...order, status: 'cancelled', active: false }
          : order
      )
      this.notify()
      
      console.log('OrderService: Order cancelled:', orderId)
    } catch (error) {
      console.error('OrderService: Error cancelling order:', error)
      throw error
    }
  }

  // Transform order data for display
  transformOrder(backendOrder) {
    const items = (backendOrder.items || []).map(item => ({
      name: item.name,
      quantity: item.quantity,
      price: item.unit_price,
      total: (item.quantity || 1) * (item.unit_price || 0)
    }));

    return {
      id: backendOrder.order_id || backendOrder.id,
      userId: backendOrder.user_id,
      userName: backendOrder.user_name || 'Usuario desconocido',
      userEmail: backendOrder.user_email || '',
      total: backendOrder.total_price || 0,
      status: backendOrder.active ? 'pending' : 'cancelled',
      createdAt: backendOrder.order_date,
      items: items,
      deliveryAddress: backendOrder.delivery_address || '',
      notes: backendOrder.notes || ''
    }
  }

  // Format date for display
  formatDate(dateString) {
    if (!dateString) return 'Fecha no disponible'
    
    // Create a date object in Argentina timezone
    const date = new Date(dateString + '-03:00') // Add Argentina offset
    return date.toLocaleString('es-AR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  }

  // Format currency for display
  formatCurrency(amount) {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount).replace('ARS', '$')
  }

  // Get status badge class
  getStatusBadgeClass(status) {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-green-100 text-green-800'  // Confirmado en verde
      case 'processing':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'shipped':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Get status display name
  getStatusDisplayName(status) {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'Completada'
      case 'delivered':
        return 'Entregada'
      case 'pending':
        return 'Confirmado'
      case 'processing':
        return 'Procesando'
      case 'cancelled':
        return 'Cancelada'
      case 'shipped':
        return 'Enviada'
      default:
        return status || 'Desconocido'
    }
  }
}

// Create singleton instance
export const orderService = new OrderService()
