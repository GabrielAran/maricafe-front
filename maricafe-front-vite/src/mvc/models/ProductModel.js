// Product Model - Handles product data and state management
import { ProductApiService } from '../../services/ProductApiService.js'
import { CategoryApiService } from '../../services/CategoryApiService.js'

export class ProductModel {
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
      sort: 'price-asc'
    }
    this.listeners = []
  }

  // Subscribe to model changes
  subscribe(listener) {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener)
    }
  }

  // Notify all listeners of changes
  notify() {
    const state = this.getState()
    console.log('ProductModel: notify called with state:', state)
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
    
    // Use the exact field names from your backend response
    const productId = backendProduct.product_id
    const originalPrice = backendProduct.price || 0
    const discountedPrice = backendProduct.new_price || originalPrice
    
    // Handle category structure from your backend
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
    
    return {
      id: productId,
      nombre: nombre,
      categoria: categoryName,
      categoriaId: categoryId,
      precio: discountedPrice,
      precioOriginal: originalPrice,
      descuento: backendProduct.discount_percentage || 0,
      imagen: "/placeholder-product.jpg",
      descripcion: descripcion,
      vegana: text.includes('vegan') || text.includes('vegana'),
      sinTacc: text.includes('tacc') || text.includes('gluten') || text.includes('celiac'),
      destacado: text.includes('pride') || text.includes('rainbow') || text.includes('arcoíris'),
      stock: backendProduct.stock || 0
    }
  }

  // Load all products
  async loadProducts() {
    try {
      console.log('ProductModel: loadProducts called')
      this.loading = true
      this.error = null
      this.notify()

      const sortParam = this.filters.sort === 'price-asc' ? 'price,asc' : 
                      this.filters.sort === 'price-desc' ? 'price,desc' : undefined
      
      console.log('ProductModel: Calling ProductApiService.getProducts with sort:', sortParam)
      const apiProducts = await ProductApiService.getProducts(sortParam)
      console.log('ProductModel: API response:', apiProducts)
      console.log('ProductModel: API response type:', typeof apiProducts)
      console.log('ProductModel: API response isArray:', Array.isArray(apiProducts))
      
      // Handle paginated response (Spring Boot Page format)
      let productsArray = apiProducts
      if (!Array.isArray(apiProducts) && apiProducts.content) {
        console.log('ProductModel: Detected paginated response, extracting content array')
        productsArray = apiProducts.content
      } else if (!Array.isArray(apiProducts)) {
        console.error('ProductModel: Invalid response format. Expected array or paginated object, got:', typeof apiProducts, apiProducts)
        this.error = `Formato de respuesta inválido del servidor. Esperado array o objeto paginado, recibido: ${typeof apiProducts}`
        return
      }
      
      console.log('ProductModel: Using products array:', productsArray)
      console.log('ProductModel: Products array length:', productsArray.length)
      
      this.products = productsArray.map((product, index) => {
        console.log(`ProductModel: Transforming product ${index}:`, product)
        const transformed = this.transformProduct(product)
        console.log(`ProductModel: Transformed product ${index}:`, transformed)
        return transformed
      })
      
      console.log('ProductModel: Final products array:', this.products)
      console.log('ProductModel: Final products count:', this.products.length)
      
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
      console.log('ProductModel: loadCategories called')
      this.categoriesLoading = true
      this.error = null
      this.notify()

      console.log('ProductModel: Calling CategoryApiService.getCategories')
      const apiCategories = await CategoryApiService.getCategories()
      console.log('ProductModel: API categories response:', apiCategories)
      console.log('ProductModel: API categories type:', typeof apiCategories)
      console.log('ProductModel: API categories isArray:', Array.isArray(apiCategories))
      
      // Handle paginated response (Spring Boot Page format)
      let categoriesArray = apiCategories
      if (!Array.isArray(apiCategories) && apiCategories.content) {
        console.log('ProductModel: Detected paginated categories response, extracting content array')
        categoriesArray = apiCategories.content
      } else if (!Array.isArray(apiCategories)) {
        console.error('ProductModel: Invalid categories response format. Expected array or paginated object, got:', typeof apiCategories, apiCategories)
        this.error = `Formato de respuesta inválido del servidor para categorías. Esperado array o objeto paginado, recibido: ${typeof apiCategories}`
        return
      }
      
      console.log('ProductModel: Using categories array:', categoriesArray)
      console.log('ProductModel: Categories array type:', typeof categoriesArray, 'isArray:', Array.isArray(categoriesArray))
      
      this.categories = categoriesArray.map((category, index) => {
        console.log(`ProductModel: Transforming category ${index}:`, category)
        return {
          id: category.category_id,
          name: category.name,
          value: category.name.toLowerCase()
        }
      })
      
      console.log('ProductModel: Transformed categories:', this.categories)
      console.log('ProductModel: Final categories length:', this.categories.length)
      
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
    this.notify()
  }

  // Get filtered products based on current filters
  getFilteredProducts() {
    console.log('ProductModel: getFilteredProducts called')
    console.log('ProductModel: Total products:', this.products?.length || 0)
    console.log('ProductModel: Current filters:', this.filters)
    
    // Ensure products is an array
    if (!Array.isArray(this.products)) {
      console.warn('ProductModel: products is not an array, returning empty array')
      return []
    }
    
    let filtered = [...this.products]
    console.log('ProductModel: Starting with', filtered.length, 'products')

    // Category filter
    if (this.filters.category && this.filters.category !== 'all') {
      console.log('ProductModel: Filtering by category ID:', this.filters.category)
      console.log('ProductModel: Available products with category IDs:', this.products.map(p => ({ id: p.id, categoriaId: p.categoriaId, categoria: p.categoria })))
      filtered = filtered.filter(product => {
        const matches = product.categoriaId == this.filters.category // Use == for type coercion
        console.log(`ProductModel: Product ${product.id} (categoryId: ${product.categoriaId}) matches filter (${this.filters.category}):`, matches)
        return matches
      })
      console.log('ProductModel: After category filter:', filtered.length, 'products')
    } else {
      console.log('ProductModel: No category filter applied (showing all products)')
    }

    // Vegan filter
    if (this.filters.vegan) {
      filtered = filtered.filter(product => product.vegana)
    }

    // Sin TACC filter
    if (this.filters.sinTacc) {
      filtered = filtered.filter(product => product.sinTacc)
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

    return filtered
  }

  // Get products by category name (for specific pages like TortasPage, TazasPage)
  getProductsByCategoryName(categoryName) {
    return this.products.filter(product => 
      product.categoria === categoryName.toLowerCase()
    )
  }

  // Clear error
  clearError() {
    this.error = null
    this.notify()
  }

  // Reset model
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
      sort: 'price-asc'
    }
    this.notify()
  }
}
