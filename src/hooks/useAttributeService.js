// Custom hook to use AttributeService in React components
import { useState, useEffect, useCallback } from 'react'
import { attributeService } from '../services/AttributeService.js'

export function useAttributeService() {
  const [state, setState] = useState(attributeService.getState())

  // Subscribe to service state changes
  useEffect(() => {
    const unsubscribe = attributeService.subscribe((newState) => {
      setState(newState)
    })

    return unsubscribe
  }, [])

  // Service methods
  const loadAttributes = useCallback(async () => {
    return await attributeService.loadAttributes()
  }, [])

  const getAttributeById = useCallback(async (id) => {
    return await attributeService.getAttributeById(id)
  }, [])

  const getAttributesByCategory = useCallback(async (categoryId) => {
    return await attributeService.getAttributesByCategory(categoryId)
  }, [])

  const getAttributes = useCallback(() => {
    return attributeService.getAttributes()
  }, [])

  const getAttributeByName = useCallback((name) => {
    return attributeService.getAttributeByName(name)
  }, [])

  const getAttributesByType = useCallback((dataType) => {
    return attributeService.getAttributesByType(dataType)
  }, [])

  const getRequiredAttributes = useCallback(() => {
    return attributeService.getRequiredAttributes()
  }, [])

  const clearError = useCallback(() => {
    attributeService.clearError()
  }, [])

  return {
    // State
    ...state,
    
    // Methods
    loadAttributes,
    getAttributeById,
    getAttributesByCategory,
    getAttributes,
    getAttributeByName,
    getAttributesByType,
    getRequiredAttributes,
    clearError
  }
}
