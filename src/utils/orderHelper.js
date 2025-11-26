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

/**
 * Format date with time for display (Argentina timezone)
 * @param {string} dateString - Date string to format
 * @returns {string} Formatted date string
 */
export function formatOrderDate(dateString) {
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

/**
 * Get status badge CSS class for styling
 * @param {string} status - Order status
 * @returns {string} CSS class string
 */
export function getStatusBadgeClass(status) {
  switch (status?.toLowerCase()) {
    case 'completed':
    case 'delivered':
      return '!bg-green-100 !text-green-800'
    case 'pending':
    case 'confirmado':
    case 'confirmed':
    case 'confirmada':
      return '!bg-green-100 !text-green-800'  // Confirmada en verde
    case 'processing':
      return '!bg-yellow-100 !text-yellow-800'
    case 'cancelled':
      return '!bg-red-100 !text-red-800'
    case 'shipped':
      return '!bg-blue-100 !text-blue-800'
    default:
      return '!bg-gray-100 !text-gray-800'
  }
}

/**
 * Get display name for order status
 * @param {string} status - Order status
 * @returns {string} Display name for the status
 */
export function getStatusDisplayName(status) {
  switch (status?.toLowerCase()) {
    case 'completed':
      return 'Completada'
    case 'delivered':
      return 'Entregada'
    case 'pending':
    case 'confirmado':
    case 'confirmed':
    case 'confirmada':
      return 'Confirmada'
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

