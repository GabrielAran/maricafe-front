// API service for connecting with maricafe-back
const API_BASE_URL = 'http://localhost:4002'

// API service functions
export class ApiService {
  static async fetchData(url, options = {}) {
    try {
      const response = await fetch(url, options)
      if (!response.ok) {
        // If 404, return empty array (no data found)
        if (response.status === 404) {
          return []
        }
        // For other HTTP errors, throw error
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      // Handle empty responses safely
      const text = await response.text()
      if (!text) return []
      const data = JSON.parse(text)
      return data ?? []
    } catch (error) {
      console.error('API Error:', error)
      // If it's a network error (backend down), throw error to show error message
      if (error.message.includes('fetch') || 
          error.message.includes('NetworkError') || 
          error.message.includes('Failed to fetch') ||
          error.message.includes('ERR_CONNECTION_REFUSED')) {
        throw new Error('No se puede conectar con el servidor. Verifica que el backend esté ejecutándose.')
      }
      throw error
    }
  }





  // Get all discounts (solo ADMIN)
  static async getDiscounts(authHeaders) {
    return this.fetchData(`${API_BASE_URL}/discounts`, {
      headers: authHeaders
    })
  }

  // Create discount (solo ADMIN)
  static async createDiscount(discountData, authHeaders) {
    return this.fetchData(`${API_BASE_URL}/discounts`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(discountData)
    })
  }

  // Update discount (solo ADMIN)
  static async updateDiscount(discountId, discountData, authHeaders) {
    return this.fetchData(`${API_BASE_URL}/discounts/${discountId}`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify(discountData)
    })
  }

  // Delete discount (solo ADMIN)
  static async deleteDiscount(discountId, authHeaders) {
    return this.fetchData(`${API_BASE_URL}/discounts/${discountId}`, {
      method: 'DELETE',
      headers: authHeaders
    })
  }


  // Create category (solo ADMIN)
  static async createCategory(categoryData, authHeaders) {
    return this.fetchData(`${API_BASE_URL}/categories`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(categoryData)
    })
  }

  // Update category (solo ADMIN)
  static async updateCategory(categoryId, categoryData, authHeaders) {
    return this.fetchData(`${API_BASE_URL}/categories/${categoryId}`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify(categoryData)
    })
  }

  // Delete category (solo ADMIN)
  static async deleteCategory(categoryId, authHeaders) {
    return this.fetchData(`${API_BASE_URL}/categories/${categoryId}`, {
      method: 'DELETE',
      headers: authHeaders
    })
  }

  // Create order (requiere autenticación USER)
  static async createOrder(orderData, authHeaders) {
    return this.fetchData(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(orderData)
    })
  }

  // Get user orders (requiere autenticación USER)
  static async getUserOrders(authHeaders) {
    return this.fetchData(`${API_BASE_URL}/orders/user`, {
      headers: authHeaders
    })
  }

  // Get order by ID (solo ADMIN)
  static async getOrderById(orderId, authHeaders) {
    return this.fetchData(`${API_BASE_URL}/orders/${orderId}`, {
      headers: authHeaders
    })
  }

  // Get active orders (solo ADMIN)
  static async getActiveOrders(authHeaders) {
    return this.fetchData(`${API_BASE_URL}/orders/admin/active`, {
      headers: authHeaders
    })
  }

  // Get inactive orders (solo ADMIN)
  static async getInactiveOrders(authHeaders) {
    return this.fetchData(`${API_BASE_URL}/orders/admin/inactive`, {
      headers: authHeaders
    })
  }

  // Delete order (solo ADMIN)
  static async deleteOrder(orderId, authHeaders) {
    return this.fetchData(`${API_BASE_URL}/orders/${orderId}`, {
      method: 'DELETE',
      headers: authHeaders
    })
  }

  // Get all users (solo ADMIN)
  static async getUsers(authHeaders) {
    return this.fetchData(`${API_BASE_URL}/users`, {
      headers: authHeaders
    })
  }

  // Get user by ID (solo ADMIN)
  static async getUserById(userId, authHeaders) {
    return this.fetchData(`${API_BASE_URL}/users/${userId}`, {
      headers: authHeaders
    })
  }

  // Update user (USER puede modificar su perfil, ADMIN puede modificar cualquiera)
  static async updateUser(userId, userData, authHeaders) {
    return this.fetchData(`${API_BASE_URL}/users/${userId}`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify(userData)
    })
  }

  // Delete user (solo ADMIN)
  static async deleteUser(userId, authHeaders) {
    return this.fetchData(`${API_BASE_URL}/users/${userId}`, {
      method: 'DELETE',
      headers: authHeaders
    })
  }

  // Change password
  static async changePassword(userId, passwordData, authHeaders) {
    return this.fetchData(`${API_BASE_URL}/users/${userId}/change-password`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify(passwordData)
    })
  }

}

// Utility function to transform backend data to frontend format
export function transformProduct(backendProduct) {
  // Backend returns ProductDTO with these field names:
  // product_id, title, description, price, category, stock, discount_percentage, new_price
  const nombre = backendProduct.title || ''
  const descripcion = backendProduct.description || ''
  const text = (nombre + ' ' + descripcion).toLowerCase()
  
  return {
    id: backendProduct.product_id,
    nombre: nombre,
    categoria: backendProduct.category?.name?.toLowerCase() || 'general',
    precio: backendProduct.new_price || backendProduct.price, // Usar precio con descuento si existe
    precioOriginal: backendProduct.price,
    descuento: backendProduct.discount_percentage || 0,
    imagen: "/placeholder-product.jpg", // Se manejará con las imágenes del backend
    descripcion: descripcion,
    vegana: text.includes('vegan') || text.includes('vegana'),
    sinTacc: text.includes('tacc') || text.includes('gluten') || text.includes('celiac'),
    destacado: text.includes('pride') || text.includes('rainbow') || text.includes('arcoíris'),
    stock: backendProduct.stock
  }
}
