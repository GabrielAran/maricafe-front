// Custom hook to use ProductController in React components
import { useState, useEffect, useRef, useCallback } from 'react'
import { ProductController } from '../controllers/ProductController.js'

export function useProductController() {
  const [state, setState] = useState({
    products: [],
    categories: [],
    loading: false,
    categoriesLoading: false,
    error: null,
    filters: {
      category: 'all',
      vegan: false,
      sinTacc: false,
      sort: 'price-asc'
    }
  })

  const controllerRef = useRef(null)

  // Initialize controller
  useEffect(() => {
    console.log('useProductController: Initializing controller...')
    console.log('useProductController: ProductController class:', ProductController)
    if (!controllerRef.current) {
      console.log('useProductController: Creating new ProductController')
      try {
        controllerRef.current = new ProductController()
        controllerRef.current.initialize()
        console.log('useProductController: Controller created and initialized')
      } catch (error) {
        console.error('useProductController: Error creating controller:', error)
      }
    }

    // Subscribe to controller state changes
    const updateState = () => {
      if (controllerRef.current) {
        const newState = controllerRef.current.getState()
        console.log('useProductController: State updated:', newState)
        setState(newState)
      }
    }

    // Initial state
    updateState()

    // Subscribe to model changes
    const unsubscribe = controllerRef.current.model.subscribe(updateState)

    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [])

  // Controller methods
  const controller = controllerRef.current

  const loadProductsFn = useCallback(async () => {
    console.log('useProductController: loadProducts called, controller:', controller)
    
    // Ensure controller exists
    let currentController = controllerRef.current
    if (!currentController) {
      console.log('useProductController: Controller is null, creating new one...')
      try {
        currentController = new ProductController()
        currentController.initialize()
        controllerRef.current = currentController
        console.log('useProductController: Fallback controller created')
      } catch (error) {
        console.error('useProductController: Error creating fallback controller:', error)
        return
      }
    }
    
    if (currentController && currentController.loadProducts) {
      console.log('useProductController: Calling controller.loadProducts()')
      return await currentController.loadProducts()
    } else {
      console.error('useProductController: Controller is null or loadProducts method not available!', { controller: currentController, hasLoadProducts: currentController?.loadProducts })
    }
  }, [controller])

  const loadCategoriesFn = useCallback(async () => {
    console.log('useProductController: loadCategories called, controller:', controller)
    
    // Ensure controller exists
    let currentController = controllerRef.current
    if (!currentController) {
      console.log('useProductController: Controller is null, creating new one...')
      currentController = new ProductController()
      currentController.initialize()
      controllerRef.current = currentController
    }
    
    if (currentController && currentController.loadCategories) {
      console.log('useProductController: Calling controller.loadCategories()')
      return await currentController.loadCategories()
    } else {
      console.error('useProductController: Controller is null or loadCategories method not available!', { controller: currentController, hasLoadCategories: currentController?.loadCategories })
    }
  }, [controller])

  return {
    // State
    ...state,
    
    // Methods
    loadProducts: loadProductsFn,
    loadCategories: loadCategoriesFn,
    loadProductsByCategory: (categoryId) => controller?.loadProductsByCategory(categoryId),
    loadFilteredProducts: (title, priceMin, priceMax) => controller?.loadFilteredProducts(title, priceMin, priceMax),
    getProductById: (id) => controller?.getProductById(id),
    updateFilters: (filters) => controller?.updateFilters(filters),
    getFilteredProducts: () => controller?.getFilteredProducts(),
    getProductsByCategoryName: (categoryName) => controller?.getProductsByCategoryName(categoryName),
    applyFilters: (filters) => controller?.applyFilters(filters),
    clearError: () => controller?.clearError(),
    retry: () => controller?.retry(),
    searchProducts: (searchTerm) => controller?.searchProducts(searchTerm),
    getProductStats: () => controller?.getProductStats(),
    formatPrice: (price) => controller?.formatPrice(price),
    isProductAvailable: (product) => controller?.isProductAvailable(product),
    getProductAvailabilityStatus: (product) => controller?.getProductAvailabilityStatus(product),
    
    // Category filter methods
    setCategoryFilter: (categoryId) => controller?.setCategoryFilter(categoryId),
    clearCategoryFilter: () => controller?.clearCategoryFilter(),
    getCurrentCategoryFilter: () => controller?.getCurrentCategoryFilter(),
    
    // Price sorting methods
    setPriceSort: (sortOrder) => controller?.setPriceSort(sortOrder),
    getCurrentSortOrder: () => controller?.getCurrentSortOrder(),
    getAvailableSortOptions: () => controller?.getAvailableSortOptions()
  }
}
