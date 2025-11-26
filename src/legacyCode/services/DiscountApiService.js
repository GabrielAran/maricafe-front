const API_BASE_URL = 'http://127.0.0.1:4002'

export class DiscountApiService {
  static async fetchData(url, options = {}) {
    try {
      const response = await fetch(url, options)
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }
      const text = await response.text()
      if (!text) return null
      return JSON.parse(text)
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }

  // Create discount for a product
  static async createDiscount(productId, discountPercentage, authHeaders) {
    return this.fetchData(`${API_BASE_URL}/discounts/${productId}`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ discount_percentage: discountPercentage })
    })
  }

  // Update discount
  static async updateDiscount(discountId, discountPercentage, authHeaders) {
    console.log('DiscountApiService.updateDiscount called with:', {
      discountId,
      discountPercentage,
      authHeaders
    })
    const url = `${API_BASE_URL}/discounts/${discountId}`
    const body = { discount_percentage: discountPercentage }
    console.log('Request URL:', url)
    console.log('Request body:', body)
    
    return this.fetchData(url, {
      method: 'PATCH',
      headers: authHeaders,
      body: JSON.stringify(body)
    })
  }

  // Delete discount
  static async deleteDiscount(discountId, authHeaders) {
    return this.fetchData(`${API_BASE_URL}/discounts/${discountId}`, {
      method: 'DELETE',
      headers: authHeaders
    })
  }

  // Bulk create discounts for multiple products
  static async createBulkDiscounts(productIds, discountPercentage, authHeaders) {
    const promises = productIds.map(productId =>
      this.createDiscount(productId, discountPercentage, authHeaders)
    )
    return Promise.all(promises)
  }

  // Bulk update discounts
  static async updateBulkDiscounts(discountIds, discountPercentage, authHeaders) {
    const promises = discountIds.map(discountId =>
      this.updateDiscount(discountId, discountPercentage, authHeaders)
    )
    return Promise.all(promises)
  }

  // Bulk delete discounts
  static async deleteBulkDiscounts(discountIds, authHeaders) {
    const promises = discountIds.map(discountId =>
      this.deleteDiscount(discountId, authHeaders)
    )
    return Promise.all(promises)
  }
}
