// Custom hook to use ProductService in React components
import { useState, useEffect, useCallback } from 'react'
import { productService } from '../services/ProductService.js'

export function useProductService() {
  const [state, setState] = useState(productService.getState())

  // Subscribe to service state changes
  useEffect(() => {
    const unsubscribe = productService.subscribe((newState) => {
      setState(newState)
    })

    return unsubscribe
  }, [])

  // Service methods
  const loadProducts = useCallback(async () => {
    return await productService.loadProducts()
  }, [])

  const loadCategories = useCallback(async () => {
    return await productService.loadCategories()
  }, [])

  const loadProductsByCategory = useCallback(async (categoryId) => {
    return await productService.loadProductsByCategory(categoryId)
  }, [])

  const loadFilteredProducts = useCallback(async (title, priceMin, priceMax) => {
    return await productService.loadFilteredProducts(title, priceMin, priceMax)
  }, [])

  const getProductById = useCallback(async (id) => {
    return await productService.getProductById(id)
  }, [])

  const updateFilters = useCallback((filters) => {
    productService.updateFilters(filters)
  }, [])

  const getFilteredProducts = useCallback(() => {
    return productService.getFilteredProducts()
  }, []) // No dependencies needed since we're calling the service method directly

  const getProductsByCategoryName = useCallback((categoryName) => {
    return productService.getProductsByCategoryName(categoryName)
  }, [])

  const applyFilters = useCallback((filters) => {
    return productService.applyFilters(filters)
  }, [])

  const clearError = useCallback(() => {
    productService.clearError()
  }, [])

  const retry = useCallback(async () => {
    return await productService.retry()
  }, [])

  const searchProducts = useCallback(async (searchTerm) => {
    return await productService.searchProducts(searchTerm)
  }, [])

  const getProductStats = useCallback(() => {
    return productService.getProductStats()
  }, [])

  const formatPrice = useCallback((price) => {
    return productService.formatPrice(price)
  }, [])

  const isProductAvailable = useCallback((product) => {
    return productService.isProductAvailable(product)
  }, [])

  const getProductAvailabilityStatus = useCallback((product) => {
    return productService.getProductAvailabilityStatus(product)
  }, [])

  // Category filter methods
  const setCategoryFilter = useCallback((categoryId) => {
    productService.setCategoryFilter(categoryId)
  }, [])

  const clearCategoryFilter = useCallback(() => {
    productService.clearCategoryFilter()
  }, [])

  const getCurrentCategoryFilter = useCallback(() => {
    return productService.getCurrentCategoryFilter()
  }, [])

  // Price sorting methods
  const setPriceSort = useCallback((sortOrder) => {
    productService.setPriceSort(sortOrder)
  }, [])

  const getCurrentSortOrder = useCallback(() => {
    return productService.getCurrentSortOrder()
  }, [])

  const getAvailableSortOptions = useCallback(() => {
    return productService.getAvailableSortOptions()
  }, [])

  // Attribute filtering methods
  const setAttributeFilter = useCallback((attributeId, value, attributeType) => {
    productService.updateAttributeFilter(attributeId, value, attributeType)
  }, [])

  const clearAttributeFilters = useCallback(() => {
    productService.clearAttributeFilters()
  }, [])

  const getCurrentAttributeFilters = useCallback(() => {
    return productService.filters.attributes
  }, [])

  return {
    // State
    ...state,
    
    // Methods
    loadProducts,
    loadCategories,
    loadProductsByCategory,
    loadFilteredProducts,
    getProductById,
    updateFilters,
    getFilteredProducts,
    getProductsByCategoryName,
    applyFilters,
    clearError,
    retry,
    searchProducts,
    getProductStats,
    formatPrice,
    isProductAvailable,
    getProductAvailabilityStatus,
    
    // Category filter methods
    setCategoryFilter,
    clearCategoryFilter,
    getCurrentCategoryFilter,
    
    // Price sorting methods
    setPriceSort,
    getCurrentSortOrder,
    getAvailableSortOptions,
    
    // Attribute filtering methods
    setAttributeFilter,
    clearAttributeFilters,
    getCurrentAttributeFilters
  }
}
