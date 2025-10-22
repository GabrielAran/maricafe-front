// Product Service - Handles all product-related operations and state
import { ProductApiService } from './ProductApiService.js'
import { CategoryApiService } from './CategoryApiService.js'

export class ProductService {
  constructor() {
    this.products = []
    this.categories = []
    this.loading = false
    this.categoriesLoading = false
    this.error = null
    this.filters = {
      category: 'all',
      vegan: false,
      sinTacc: false,
      sort: 'price-asc',
      attributes: {} // Dynamic attribute filters
    }
    this.listeners = []
    this.cachedFilteredProducts = null
    this.lastFiltersHash = null
  }

  // Subscribe to state changes
  subscribe(listener) {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener)
    }
  }

  // Notify all listeners of changes
  notify() {
    const state = this.getState()
    this.listeners.forEach(listener => listener(state))
  }

  // Get current state
  getState() {
    return {
      products: this.products,
      categories: this.categories,
      loading: this.loading,
      categoriesLoading: this.categoriesLoading,
      error: this.error,
      filters: this.filters
    }
  }

  // Transform backend product to frontend format
  transformProduct(backendProduct) {
    const nombre = backendProduct.title || ''
    const descripcion = backendProduct.description || ''
    const text = (nombre + ' ' + descripcion).toLowerCase()
    
    const productId = backendProduct.product_id
    const originalPrice = backendProduct.price || 0
    const discountedPrice = backendProduct.new_price || originalPrice
    
    // Handle category structure from backend
    let categoryName = 'general'
    let categoryId = null
    if (backendProduct.category) {
      if (backendProduct.category.name) {
        categoryName = backendProduct.category.name.toLowerCase()
      }
      if (backendProduct.category.category_id) {
        categoryId = backendProduct.category.category_id
      }
    }
    
    // Process attributes from backend
    const attributes = {}
    if (backendProduct.attributes && Array.isArray(backendProduct.attributes)) {
      backendProduct.attributes.forEach(attr => {
        if (attr.attribute && attr.value) {
          attributes[attr.attribute.attribute_id] = {
            value: attr.value,
            type: attr.attribute.data_type,
            required: attr.attribute.required,
            name: attr.attribute.name
          }
        }
      })
    }

    return {
      id: productId,
      nombre: nombre,
      categoria: categoryName,
      categoriaId: categoryId,
      precio: discountedPrice,
      precioOriginal: originalPrice,
      descuento: backendProduct.discount_percentage || 0,
      descuentoId: backendProduct.discount_id || null,
      imagen: null, // Will be set when images are loaded
      descripcion: descripcion,
      vegana: text.includes('vegan') || text.includes('vegana') || Object.values(attributes).some(attr => attr.name === 'Vegano' && attr.value === 'true'),
      sinTacc: text.includes('tacc') || text.includes('gluten') || text.includes('celiac') || Object.values(attributes).some(attr => attr.name === 'Sin TACC' && attr.value === 'true'),
      destacado: text.includes('pride') || text.includes('rainbow') || text.includes('arcoíris'),
      stock: backendProduct.stock || 0,
      attributes: attributes
    }
  }

  // Fetch images for a product
  async fetchProductImages(productId) {
    try {
      const images = await ProductApiService.getProductImages(productId)
      console.log(`Fetched images for product ${productId}: ${images.length} image(s)`)
      if (images.length > 0) {
        const base64Data = images[0]
        console.log(`Base64 data for product ${productId} (length: ${base64Data.length} chars)`)
        
        // Now let's try to fix the backend base64 data
        try {
          console.log(`Attempting to fix base64 data for product ${productId}...`)
          
          // Try to clean the base64 data (remove any whitespace, newlines, etc.)
          const cleanBase64 = base64Data.replace(/\s/g, '')
          console.log(`Cleaned base64 length: ${cleanBase64.length}`)
          
          // Test if the cleaned base64 is valid
          try {
            const testDecode = atob(cleanBase64.substring(0, 100))
            console.log(`Cleaned base64 is valid for product ${productId}`)
            
            // Try with PNG first (since your images are PNG)
            const dataUrl = `data:image/png;base64,${cleanBase64}`
            console.log(`Created PNG data URL for product ${productId}`)
            return dataUrl
          } catch (decodeError) {
            console.log(`Cleaned base64 still invalid for product ${productId}:`, decodeError)
            
            // If cleaning didn't work, try the original data with different MIME types
            const mimeTypes = ['image/png', 'image/jpeg', 'image/gif']
            for (const mimeType of mimeTypes) {
              try {
                const testUrl = `data:${mimeType};base64,${base64Data}`
                // Test if this works by creating a temporary image
                const testImg = new Image()
                testImg.onload = () => {
                  console.log(`✅ ${mimeType} works for product ${productId}`)
                }
                testImg.onerror = () => {
                  console.log(`❌ ${mimeType} failed for product ${productId}`)
                }
                testImg.src = testUrl
                
                // Return the first one for now
                return testUrl
              } catch (e) {
                console.log(`MIME type ${mimeType} failed for product ${productId}`)
              }
            }
            
            // If all else fails, return placeholder
            return "/placeholder-product.jpg"
          }
        } catch (e) {
          console.error(`Error processing base64 for product ${productId}:`, e)
          return "/placeholder-product.jpg"
        }
      }
      return "/placeholder-product.jpg"
    } catch (error) {
      console.warn(`Failed to fetch images for product ${productId}:`, error)
      return "/placeholder-product.jpg"
    }
  }

  // Load images for all products
  async loadProductImages() {
    try {
      console.log('Loading images for products:', this.products.map(p => ({ id: p.id, nombre: p.nombre, stock: p.stock, imagen: p.imagen })))
      const imagePromises = this.products.map(async (product) => {
        console.log(`Loading image for product ${product.id} (${product.nombre}) with stock ${product.stock}`)
        const imageUrl = await this.fetchProductImages(product.id)
        product.imagen = imageUrl
        console.log(`Updated product ${product.id} (${product.nombre}) with image:`, imageUrl)
        return product
      })
      
      await Promise.all(imagePromises)
      console.log('All images loaded, notifying listeners')
      console.log('Final products with images:', this.products.map(p => ({ id: p.id, nombre: p.nombre, stock: p.stock, hasImage: !!p.imagen })))
      this.notify() // Notify listeners that images have been loaded
    } catch (error) {
      console.error('Error loading product images:', error)
    }
  }

  // Load all products
  async loadProducts() {
    try {
      this.loading = true
      this.error = null
      this.notify()

      const sortParam = this.filters.sort === 'price-asc' ? 'price,asc' : 
                      this.filters.sort === 'price-desc' ? 'price,desc' : undefined
      
      // Check if we have attribute filters to use backend filtering
      const hasAttributeFilters = this.filters.attributes && Object.keys(this.filters.attributes).length > 0
      const categoryId = this.filters.category !== 'all' ? this.filters.category : null
      
      console.log('ProductService: Loading products with filters:', { 
        sortParam, 
        hasAttributeFilters, 
        categoryId,
        attributeFilters: this.filters.attributes 
      })
      
      let apiProducts
      if (hasAttributeFilters) {
        const attributeFilters = this.buildAttributeFiltersString()
        console.log('ProductService: Using attribute filtering with filters:', attributeFilters)
        apiProducts = await ProductApiService.getProductsFilteredByAttributes(sortParam, categoryId, attributeFilters)
      } else {
        // The backend will automatically handle role-based filtering based on the authenticated user
        console.log('ProductService: Using standard product loading')
        apiProducts = await ProductApiService.getProducts(sortParam)
      }
      
      // Handle paginated response
      let productsArray = apiProducts
      if (!Array.isArray(apiProducts) && apiProducts.content) {
        productsArray = apiProducts.content
      } else if (!Array.isArray(apiProducts)) {
        console.error('ProductService: Invalid response format. Expected array or paginated object, got:', typeof apiProducts, apiProducts)
        this.error = `Formato de respuesta inválido del servidor. Esperado array o objeto paginado, recibido: ${typeof apiProducts}`
        return
      }
      
      this.products = productsArray.map(product => this.transformProduct(product))
      
      console.log('ProductService: Loaded products:', this.products.length, 'products')
      console.log('ProductService: Products with zero stock:', this.products.filter(p => p.stock === 0).length)
      console.log('ProductService: Products with zero stock details:', this.products.filter(p => p.stock === 0).map(p => ({ id: p.id, nombre: p.nombre, stock: p.stock })))
      
      // Load images for each product
      await this.loadProductImages()
      
      // Clear cache when products are loaded
      this.cachedFilteredProducts = null
      this.lastFiltersHash = null
      
    } catch (error) {
      console.error('Error loading products:', error)
      this.error = error.message || 'Error al cargar los productos'
    } finally {
      this.loading = false
      this.notify()
    }
  }

  // Load all categories
  async loadCategories() {
    try {
      this.categoriesLoading = true
      this.error = null
      this.notify()

      const apiCategories = await CategoryApiService.getCategories()
      
      // Handle paginated response
      let categoriesArray = apiCategories
      if (!Array.isArray(apiCategories) && apiCategories.content) {
        categoriesArray = apiCategories.content
      } else if (!Array.isArray(apiCategories)) {
        console.error('ProductService: Invalid categories response format. Expected array or paginated object, got:', typeof apiCategories, apiCategories)
        this.error = `Formato de respuesta inválido del servidor para categorías. Esperado array o objeto paginado, recibido: ${typeof apiCategories}`
        return
      }
      
      this.categories = categoriesArray.map(category => ({
        id: category.category_id,
        name: category.name,
        value: category.name.toLowerCase()
      }))
      
    } catch (error) {
      console.error('Error loading categories:', error)
      this.error = error.message || 'Error al cargar las categorías'
    } finally {
      this.categoriesLoading = false
      this.notify()
    }
  }

  // Load products by category
  async loadProductsByCategory(categoryId) {
    try {
      this.loading = true
      this.error = null
      this.notify()

      const sortParam = this.filters.sort === 'price-asc' ? 'price,asc' : 
                      this.filters.sort === 'price-desc' ? 'price,desc' : undefined
      
      const apiProducts = await ProductApiService.getProductsByCategory(categoryId, sortParam)
      this.products = apiProducts.map(product => this.transformProduct(product))
      
    } catch (error) {
      console.error('Error loading products by category:', error)
      this.error = error.message || 'Error al cargar los productos'
    } finally {
      this.loading = false
      this.notify()
    }
  }

  // Load filtered products
  async loadFilteredProducts(title, priceMin, priceMax) {
    try {
      this.loading = true
      this.error = null
      this.notify()

      const apiProducts = await ProductApiService.getProductsFiltered(title, priceMin, priceMax)
      this.products = apiProducts.map(product => this.transformProduct(product))
      
    } catch (error) {
      console.error('Error loading filtered products:', error)
      this.error = error.message || 'Error al cargar los productos'
    } finally {
      this.loading = false
      this.notify()
    }
  }

  // Get product by ID
  async getProductById(id) {
    try {
      this.loading = true
      this.error = null
      this.notify()

      const apiProduct = await ProductApiService.getProductById(id)
      return this.transformProduct(apiProduct)
      
    } catch (error) {
      console.error('Error loading product:', error)
      this.error = error.message || 'Error al cargar el producto'
      return null
    } finally {
      this.loading = false
      this.notify()
    }
  }

  // Update filters
  updateFilters(newFilters) {
    this.filters = { ...this.filters, ...newFilters }
    // Clear cache when filters change
    this.cachedFilteredProducts = null
    this.lastFiltersHash = null
    this.notify()
  }

  // Update attribute filters
  updateAttributeFilter(attributeId, value, attributeType) {
    if (!value || value === '') {
      const newAttributes = { ...this.filters.attributes }
      delete newAttributes[attributeId]
      this.filters.attributes = newAttributes
    } else {
      this.filters.attributes = {
        ...this.filters.attributes,
        [attributeId]: value
      }
    }
    // Clear cache when attribute filters change
    this.cachedFilteredProducts = null
    this.lastFiltersHash = null
    this.notify()
  }

  // Build attribute filters string for backend API
  buildAttributeFiltersString() {
    if (!this.filters.attributes || Object.keys(this.filters.attributes).length === 0) {
      return null
    }
    
    const filterPairs = Object.entries(this.filters.attributes)
      .filter(([attributeId, value]) => value && value !== '')
      .map(([attributeId, value]) => `${attributeId}:${value}`)
    
    return filterPairs.length > 0 ? filterPairs.join(',') : null
  }

  // Clear all attribute filters
  clearAttributeFilters() {
    this.filters.attributes = {}
    // Clear cache when attribute filters are cleared
    this.cachedFilteredProducts = null
    this.lastFiltersHash = null
    this.notify()
  }

  // Generate a hash of current filters for caching
  getFiltersHash() {
    return JSON.stringify(this.filters)
  }

  // Get filtered products based on current filters
  getFilteredProducts() {
    if (!Array.isArray(this.products)) {
      return []
    }
    
    // Check if we can use cached results
    const currentFiltersHash = this.getFiltersHash()
    if (this.cachedFilteredProducts && this.lastFiltersHash === currentFiltersHash) {
      return this.cachedFilteredProducts
    }
    
    let filtered = [...this.products]

    // Category filter
    if (this.filters.category && this.filters.category !== 'all') {
      filtered = filtered.filter(product => {
        return product.categoriaId == this.filters.category
      })
    }

    // Vegan filter
    if (this.filters.vegan) {
      filtered = filtered.filter(product => product.vegana)
    }

    // Sin TACC filter
    if (this.filters.sinTacc) {
      filtered = filtered.filter(product => product.sinTacc)
    }

    // Attribute filters
    if (this.filters.attributes && Object.keys(this.filters.attributes).length > 0) {
      filtered = filtered.filter(product => {
        return Object.entries(this.filters.attributes).every(([attributeId, filterValue]) => {
          if (!filterValue || filterValue === '') return true
          
          const productAttribute = product.attributes?.[attributeId]
          if (!productAttribute) {
            return false
          }
          
          let attributeMatches = false
          switch (productAttribute.type) {
            case 'boolean':
              attributeMatches = productAttribute.value === filterValue
              break
            case 'select':
              attributeMatches = productAttribute.value.toLowerCase() === filterValue.toLowerCase()
              break
            case 'text':
              attributeMatches = productAttribute.value.toLowerCase().includes(filterValue.toLowerCase())
              break
            case 'number':
              const productValue = parseFloat(productAttribute.value)
              const filterValueNum = parseFloat(filterValue)
              attributeMatches = !isNaN(productValue) && !isNaN(filterValueNum) && productValue >= filterValueNum
              break
            default:
              attributeMatches = productAttribute.value === filterValue
          }
          
          return attributeMatches
        })
      })
    }

    // Sort products
    switch (this.filters.sort) {
      case 'price-asc':
        filtered.sort((a, b) => a.precio - b.precio)
        break
      case 'price-desc':
        filtered.sort((a, b) => b.precio - a.precio)
        break
      case 'featured':
      default:
        filtered.sort((a, b) => {
          if (a.destacado && !b.destacado) return -1
          if (!a.destacado && b.destacado) return 1
          return 0
        })
        break
    }

    // Cache the results
    this.cachedFilteredProducts = filtered
    this.lastFiltersHash = currentFiltersHash
    
    return filtered
  }

  // Get products by category name
  getProductsByCategoryName(categoryName) {
    return this.products.filter(product => 
      product.categoria === categoryName.toLowerCase()
    )
  }

  // Search products
  async searchProducts(searchTerm) {
    if (!searchTerm || searchTerm.trim() === '') {
      return await this.loadProducts()
    }
    
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
  isProductAvailable(product, isAdmin = false) {
    // Admin users can see all products, regular users only see products with stock
    return isAdmin || product.stock > 0
  }

  // Get product availability status
  getProductAvailabilityStatus(product) {
    if (product.stock > 10) return 'available'
    if (product.stock > 0) return 'low-stock'
    return 'out-of-stock'
  }

  // Category filter methods
  setCategoryFilter(categoryId) {
    this.updateFilters({ category: categoryId })
  }

  clearCategoryFilter() {
    this.updateFilters({ category: 'all' })
  }

  getCurrentCategoryFilter() {
    return this.filters.category
  }

  // Price sorting methods
  setPriceSort(sortOrder) {
    this.updateFilters({ sort: sortOrder })
  }

  getCurrentSortOrder() {
    return this.filters.sort
  }

  getAvailableSortOptions() {
    return [
      { value: 'price-asc', label: 'Precio: Menor a Mayor' },
      { value: 'price-desc', label: 'Precio: Mayor a Menor' }
    ]
  }

  // Apply filters and get filtered products
  applyFilters(filters) {
    this.updateFilters(filters)
    return this.getFilteredProducts()
  }

  // Clear error
  clearError() {
    this.error = null
    this.notify()
  }

  // Retry loading products
  async retry() {
    await this.loadProducts()
  }

  // Reset service
  reset() {
    this.products = []
    this.categories = []
    this.loading = false
    this.categoriesLoading = false
    this.error = null
    this.filters = {
      category: 'all',
      vegan: false,
      sinTacc: false,
      sort: 'price-asc',
      attributes: {}
    }
    this.notify()
  }
}

// Create a singleton instance
export const productService = new ProductService()
