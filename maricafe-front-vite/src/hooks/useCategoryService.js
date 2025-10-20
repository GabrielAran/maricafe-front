// Custom hook to use CategoryService in React components
import { useState, useEffect, useCallback } from 'react'
import { categoryService } from '../services/CategoryService.js'

export function useCategoryService() {
  const [state, setState] = useState(categoryService.getState())

  // Subscribe to service state changes
  useEffect(() => {
    const unsubscribe = categoryService.subscribe((newState) => {
      setState(newState)
    })

    return unsubscribe
  }, [])

  // Service methods
  const loadCategories = useCallback(async () => {
    return await categoryService.loadCategories()
  }, [])

  const getCategoryById = useCallback(async (id) => {
    return await categoryService.getCategoryById(id)
  }, [])

  const getCategoryByName = useCallback((name) => {
    return categoryService.getCategoryByName(name)
  }, [])

  const getCategories = useCallback(() => {
    return categoryService.getCategories()
  }, [])

  const clearError = useCallback(() => {
    categoryService.clearError()
  }, [])

  return {
    // State
    ...state,
    
    // Methods
    loadCategories,
    getCategoryById,
    getCategoryByName,
    getCategories,
    clearError
  }
}
