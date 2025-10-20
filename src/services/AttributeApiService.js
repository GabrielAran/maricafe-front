// Attribute API service for fetching product attributes
const API_BASE_URL = 'http://localhost:4002'

export class AttributeApiService {
  // Get attributes for a specific category
  static async getAttributesByCategory(categoryId) {
    try {
      const response = await fetch(`${API_BASE_URL}/products/attributes/category/${categoryId}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      console.error('Error fetching attributes by category:', error)
      return []
    }
  }

  // Get all attributes (for when no category is selected)
  static async getAllAttributes() {
    try {
      const response = await fetch(`${API_BASE_URL}/products/attributes/all`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      console.error('Error fetching all attributes:', error)
      return []
    }
  }

  // Get attribute values for a specific product
  static async getProductAttributes(productId) {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${productId}/attributes`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      console.error('Error fetching product attributes:', error)
      return []
    }
  }
}
