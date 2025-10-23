// Product-specific API service for MVC architecture
const API_BASE_URL = 'http://127.0.0.1:4002'

export class ProductApiService {
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
    return this.fetchData(url)
  }

  // Get products with attributes for filtering
  static async getProductsWithAttributes(sort) {
    const url = sort ? `${API_BASE_URL}/products/with-attributes?sort=${sort}` : `${API_BASE_URL}/products/with-attributes`
    return this.fetchData(url)
  }

  // Get products filtered by attributes
  static async getProductsFilteredByAttributes(sort, categoryId, attributeFilters) {
    const params = new URLSearchParams()
    if (sort) params.append('sort', sort)
    if (categoryId) params.append('categoryId', categoryId)
    if (attributeFilters) params.append('attributeFilters', attributeFilters)
    
    const url = `${API_BASE_URL}/products/filter-by-attributes?${params.toString()}`
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
    try {
      const base64Images = await this.fetchData(`${API_BASE_URL}/images/${productId}`)
      if (!base64Images) return []
      
      // Handle both array and single image responses
      const imagesArray = Array.isArray(base64Images) ? base64Images : [base64Images]
      
      return imagesArray.map((base64Data, index) => {
        try {
          let finalData = null
          
          // If it's already a string, use it directly
          if (typeof base64Data === 'string') {
            finalData = base64Data
          }
          // If it's an object with data property
          else if (base64Data && typeof base64Data === 'object') {
            if (base64Data.data) {
              finalData = base64Data.data
            } else if (base64Data.imagen) {
              finalData = base64Data.imagen
            } else if (base64Data.base64) {
              finalData = base64Data.base64
            }
          }
          
          if (!finalData) {
            console.warn('Invalid image data received:', base64Data)
            return null
          }
          
          // Clean the base64 string
          const cleanBase64 = finalData.toString()
            .replace(/\s/g, '')
            .replace(/^data:image\/[a-z]+;base64,/, '')
          
          return {
            id: index + 1,
            url: `data:image/png;base64,${cleanBase64}`
          }
        } catch (e) {
          console.error('Error processing base64 image:', e)
          return null
        }
      }).filter(Boolean)
    } catch (error) {
      console.error('Error in getProductImages:', error)
      return []
    }
  }

  // Get image by ID
  static async getImageById(imageId) {
    const image = await this.fetchData(`${API_BASE_URL}/images/${imageId}`)
    return {
      ...image,
      url: `${API_BASE_URL}/images/${imageId}`
    }
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
    try {
      const token = localStorage.getItem('maricafe-token')
      const headers = {
        'Authorization': `Bearer ${token}`,
        // Don't set Content-Type for FormData, let browser set it with boundary
        ...authHeaders
      }
      
      
      const response = await fetch(`${API_BASE_URL}/images`, {
        method: 'POST',
        headers: headers,
        body: imageData
      })
      
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Image upload error response:', errorText)
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`)
      }
      
      const text = await response.text()
      return text
    } catch (error) {
      console.error('Image upload error:', error)
      throw error
    }
  }

  // Upload multiple images (ADMIN only)
  static async uploadMultipleImages(imageData, authHeaders) {
    try {
      const token = localStorage.getItem('maricafe-token')
      const headers = {
        'Authorization': `Bearer ${token}`,
        // Don't set Content-Type for FormData, let browser set it with boundary
        ...authHeaders
      }
      
      const response = await fetch(`${API_BASE_URL}/images/multiple`, {
        method: 'POST',
        headers: headers,
        body: imageData
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Multiple images upload error response:', errorText)
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`)
      }
      
      const text = await response.text()
      return text
    } catch (error) {
      console.error('Multiple images upload error:', error)
      throw error
    }
  }

  // Delete image (ADMIN only)
  static async deleteImage(imageId, authHeaders) {
    try {
      // From the screenshot, the URL format should be /images/{imageId}
      const response = await fetch(`${API_BASE_URL}/images/${imageId}`, {
        method: 'DELETE',
        headers: authHeaders
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Image delete error response:', errorText)
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`)
      }
      
      return true
    } catch (error) {
      console.error('Image delete error:', error)
      throw error
    }
  }
}
