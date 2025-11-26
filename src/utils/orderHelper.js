/**
 * Order normalization and utility functions
 */

/**
 * Normalizes a backend order to frontend format
 * Transforms backend order structure to the format expected by the UI
 * 
 * @param {Object} backendOrder - Order object from backend API
 * @returns {Object} Normalized order object for frontend use
 */
export function normalizeOrder(backendOrder) {
  // Handle nested response structure (some endpoints return { data: {...} })
  const order = backendOrder?.data || backendOrder || {}
  
  // Normalize order items
  const items = (order.items || []).map(item => ({
    name: item.name,
    quantity: item.quantity,
    price: item.unit_price,
    total: (item.quantity || 1) * (item.unit_price || 0)
  }))

  return {
    id: order.order_id || order.id,
    order_id: order.order_id || order.id,
    userId: order.user_id,
    userName: order.user_name || 'Usuario desconocido',
    userEmail: order.user_email || '',
    total: order.total_price || 0,
    total_price: order.total_price || 0,
    status: order.active !== false ? 'pending' : 'cancelled',
    active: order.active !== false,
    createdAt: order.order_date || order.createdAt,
    order_date: order.order_date || order.createdAt,
    items: items,
    deliveryAddress: order.delivery_address || '',
    pickup_location: order.pickup_location || '',
    notes: order.notes || ''
  }
}

