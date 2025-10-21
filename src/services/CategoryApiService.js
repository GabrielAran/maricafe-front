// Category-specific API service for MVC architecture
const API_BASE_URL = 'http://localhost:4002'

export class CategoryApiService {
  static async fetchData(url, options = {}) {
    try {
      console.log('CategoryApiService: fetchData called with URL:', url, 'Options:', options)
      const response = await fetch(url, options)
      console.log('CategoryApiService: fetch response status:', response.status, 'ok:', response.ok)
      
      if (!response.ok) {
        if (response.status === 404) {
          return []
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
    console.log('CategoryApiService: getCategories called with URL:', url)
    return this.fetchData(url)
  }

  // Get category by ID
  static async getCategoryById(id) {
    return this.fetchData(`${API_BASE_URL}/categories/${id}`)
  }
}
