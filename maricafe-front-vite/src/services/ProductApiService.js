// Product-specific API service for MVC architecture
const API_BASE_URL = 'http://localhost:4002'

export class ProductApiService {
  static async fetchData(url, options = {}) {
    try {
      console.log('ProductApiService: fetchData called with URL:', url, 'Options:', options)
      const response = await fetch(url, options)
      console.log('ProductApiService: fetch response status:', response.status, 'ok:', response.ok)
      
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
      console.error('Product API Error:', error)
      if (error.message.includes('fetch') || 
          error.message.includes('NetworkError') || 
          error.message.includes('Failed to fetch') ||
          error.message.includes('ERR_CONNECTION_REFUSED')) {
        throw new Error('No se puede conectar con el servidor. Verifica que el backend esté ejecutándose.')
      }
      throw error
    }
  }

  // Get all products with optional sorting
  static async getProducts(sort) {
    // Request all products without pagination
    const url = sort ? `${API_BASE_URL}/products?sort=${sort}&size=1000` : `${API_BASE_URL}/products?size=1000`
    console.log('ProductApiService: getProducts called with URL:', url)
    return this.fetchData(url)
  }

  // Get products by category with sorting
  static async getProductsByCategory(categoryId, sort) {
    const url = sort 
      ? `${API_BASE_URL}/products/category/${categoryId}?sort=${sort}`
      : `${API_BASE_URL}/products/category/${categoryId}`
    return this.fetchData(url)
  }

  // Get product by ID
  static async getProductById(id) {
    return this.fetchData(`${API_BASE_URL}/products/${id}`)
  }

  // Get products with filters
  static async getProductsFiltered(title, priceMin, priceMax) {
    const params = new URLSearchParams()
    if (title) params.append('title', title)
    if (priceMin !== undefined) params.append('priceMin', priceMin)
    if (priceMax !== undefined) params.append('priceMax', priceMax)
    
    const url = `${API_BASE_URL}/products/attributes?${params.toString()}`
    return this.fetchData(url)
  }

  // Get product images
  static async getProductImages(productId) {
    return this.fetchData(`${API_BASE_URL}/products/${productId}/images`)
  }

  // Get image by ID
  static async getImageById(imageId) {
    return this.fetchData(`${API_BASE_URL}/images/${imageId}`)
  }

  // Create product (ADMIN only)
  static async createProduct(productData, authHeaders) {
    return this.fetchData(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(productData)
    })
  }

  // Update product (ADMIN only)
  static async updateProduct(productId, productData, authHeaders) {
    return this.fetchData(`${API_BASE_URL}/products/${productId}`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify(productData)
    })
  }

  // Delete product (ADMIN only)
  static async deleteProduct(productId, authHeaders) {
    return this.fetchData(`${API_BASE_URL}/products/${productId}`, {
      method: 'DELETE',
      headers: authHeaders
    })
  }

  // Upload image (ADMIN only)
  static async uploadImage(imageData, authHeaders) {
    return this.fetchData(`${API_BASE_URL}/images`, {
      method: 'POST',
      headers: authHeaders,
      body: imageData
    })
  }
}
