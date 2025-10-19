// Product Controller - Handles product business logic and user interactions
import { ProductModel } from '../models/ProductModel.js'

export class ProductController {
  constructor() {
    this.model = new ProductModel()
    this.state = this.model.getState()
  }

  // Initialize controller and subscribe to model changes
  initialize() {
    // Subscribe to model changes
    this.unsubscribe = this.model.subscribe((newState) => {
      this.state = newState
    })
  }

  // Cleanup when controller is destroyed
  destroy() {
    if (this.unsubscribe) {
      this.unsubscribe()
    }
  }

  // Get current state
  getState() {
    return this.state
  }

  // Load all products
  async loadProducts() {
    await this.model.loadProducts()
  }

  // Load all categories
  async loadCategories() {
    await this.model.loadCategories()
  }

  // Load products by category
  async loadProductsByCategory(categoryId) {
    await this.model.loadProductsByCategory(categoryId)
  }

  // Load filtered products
  async loadFilteredProducts(title, priceMin, priceMax) {
    await this.model.loadFilteredProducts(title, priceMin, priceMax)
  }

  // Get product by ID
  async getProductById(id) {
    return await this.model.getProductById(id)
  }

  // Update filters
  updateFilters(filters) {
    this.model.updateFilters(filters)
  }

  // Get filtered products
  getFilteredProducts() {
    return this.model.getFilteredProducts()
  }

  // Category filter methods
  setCategoryFilter(categoryId) {
    this.model.updateFilters({ category: categoryId })
  }

  clearCategoryFilter() {
    this.model.updateFilters({ category: 'all' })
  }

  getCurrentCategoryFilter() {
    return this.model.filters.category
  }

  // Price sorting methods
  setPriceSort(sortOrder) {
    this.model.updateFilters({ sort: sortOrder })
  }

  getCurrentSortOrder() {
    return this.model.filters.sort
  }

  getAvailableSortOptions() {
    return [
      { value: 'price-asc', label: 'Precio: Menor a Mayor' },
      { value: 'price-desc', label: 'Precio: Mayor a Menor' }
    ]
  }

  // Get products by category name (for specific pages)
  getProductsByCategoryName(categoryName) {
    return this.model.getProductsByCategoryName(categoryName)
  }

  // Apply filters and get filtered products
  applyFilters(filters) {
    this.updateFilters(filters)
    return this.getFilteredProducts()
  }

  // Clear error
  clearError() {
    this.model.clearError()
  }

  // Retry loading products
  async retry() {
    await this.loadProducts()
  }


  // Search products
  async searchProducts(searchTerm) {
    if (!searchTerm || searchTerm.trim() === '') {
      return await this.loadProducts()
    }
    
    // For now, we'll load all products and filter client-side
    // In a more advanced implementation, you might want to use a search API
    await this.loadProducts()
    const allProducts = this.getFilteredProducts()
    
    return allProducts.filter(product => 
      product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.categoria.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }

  // Get product statistics
  getProductStats() {
    const products = this.getFilteredProducts()
    return {
      total: products.length,
      vegan: products.filter(p => p.vegana).length,
      sinTacc: products.filter(p => p.sinTacc).length,
      destacados: products.filter(p => p.destacado).length,
      categories: [...new Set(products.map(p => p.categoria))]
    }
  }

  // Format price for display
  formatPrice(price) {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price)
  }

  // Check if product is available
  isProductAvailable(product) {
    return product.stock > 0
  }

  // Get product availability status
  getProductAvailabilityStatus(product) {
    if (product.stock > 10) return 'available'
    if (product.stock > 0) return 'low-stock'
    return 'out-of-stock'
  }
}
