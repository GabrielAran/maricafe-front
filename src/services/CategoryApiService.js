// Category-specific API service for MVC architecture
const API_BASE_URL = 'http://127.0.0.1:4002'

export class CategoryApiService {
  static async fetchData(url, options = {}) {
    try {
      // Add authentication headers if available
      const token = localStorage.getItem('maricafe-token')
      if (token && !options.headers?.Authorization) {
        options.headers = {
          ...options.headers,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
      
      const response = await fetch(url, options)
      
      if (!response.ok) {
        if (response.status === 404) {
          return []
        }
        if (response.status === 401) {
          throw new Error('No autorizado. Por favor, inicia sesión nuevamente.')
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const text = await response.text()
      
      if (!text || text.trim() === '') {
        return []
      }
      
      const data = JSON.parse(text)
      return data ?? []
    } catch (error) {
      console.error('Category API Error:', error)
      if (error.message.includes('fetch') || 
          error.message.includes('NetworkError') || 
          error.message.includes('Failed to fetch') ||
          error.message.includes('ERR_CONNECTION_REFUSED')) {
        throw new Error('No se puede conectar con el servidor. Verifica que el backend esté ejecutándose.')
      }
      throw error
    }
  }

  // Get all categories
  static async getCategories() {
    const url = `${API_BASE_URL}/categories`
    return this.fetchData(url)
  }

  // Get category by ID
  static async getCategoryById(id) {
    return this.fetchData(`${API_BASE_URL}/categories/${id}`)
  }

  // Create new category
  static async createCategory(categoryData) {
    const url = `${API_BASE_URL}/categories`
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(categoryData)
    }
    return this.fetchData(url, options)
  }

  // Update category
  static async updateCategory(id, categoryData) {
    const url = `${API_BASE_URL}/categories/${id}`
    const options = {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(categoryData)
    }
    return this.fetchData(url, options)
  }

  // Delete category
  static async deleteCategory(id) {
    const url = `${API_BASE_URL}/categories/${id}`
    const options = {
      method: 'DELETE'
    }
    return this.fetchData(url, options)
  }
}
