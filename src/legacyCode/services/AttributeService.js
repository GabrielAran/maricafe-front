// Attribute Service - Handles all attribute-related operations and state
import { AttributeApiService } from './AttributeApiService.js'

export class AttributeService {
  constructor() {
    this.attributes = []
    this.loading = false
    this.error = null
    this.listeners = []
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
      attributes: this.attributes,
      loading: this.loading,
      error: this.error
    }
  }

  // Load all attributes
  async loadAttributes() {
    try {
      this.loading = true
      this.error = null
      this.notify()

      const apiAttributes = await AttributeApiService.getAllAttributes()
      
      // Handle paginated response
      let attributesArray = apiAttributes
      if (!Array.isArray(apiAttributes) && apiAttributes.content) {
        attributesArray = apiAttributes.content
      } else if (!Array.isArray(apiAttributes)) {
        console.error('AttributeService: Invalid attributes response format. Expected array or paginated object, got:', typeof apiAttributes, apiAttributes)
        this.error = `Formato de respuesta inválido del servidor para atributos. Esperado array o objeto paginado, recibido: ${typeof apiAttributes}`
        return
      }
      
      this.attributes = attributesArray.map(attribute => ({
        attribute_id: attribute.attribute_id,
        name: attribute.name,
        data_type: attribute.data_type,
        required: attribute.required,
        select_options: attribute.select_options || []
      }))
      
    } catch (error) {
      console.error('Error loading attributes:', error)
      this.error = error.message || 'Error al cargar los atributos'
    } finally {
      this.loading = false
      this.notify()
    }
  }

  // Get attribute by ID (not supported by API, returns null)
  async getAttributeById(id) {
    console.warn('getAttributeById is not supported by the API')
    return null
  }

  // Get attributes by category
  async getAttributesByCategory(categoryId) {
    try {
      this.loading = true
      this.error = null
      this.notify()

      const apiAttributes = await AttributeApiService.getAttributesByCategory(categoryId)
      
      // Handle paginated response
      let attributesArray = apiAttributes
      if (!Array.isArray(apiAttributes) && apiAttributes.content) {
        attributesArray = apiAttributes.content
      } else if (!Array.isArray(apiAttributes)) {
        console.error('AttributeService: Invalid attributes response format. Expected array or paginated object, got:', typeof apiAttributes, apiAttributes)
        this.error = `Formato de respuesta inválido del servidor para atributos. Esperado array o objeto paginado, recibido: ${typeof apiAttributes}`
        return
      }
      
      const transformedAttributes = attributesArray.map(attribute => ({
        attribute_id: attribute.attribute_id,
        name: attribute.name,
        data_type: attribute.data_type,
        required: attribute.required,
        select_options: attribute.select_options || []
      }))
      
      // Update the service's attributes array with category-specific attributes
      this.attributes = transformedAttributes
      console.log('AttributeService: Updated attributes for category', categoryId, ':', transformedAttributes)
      
      return transformedAttributes
      
    } catch (error) {
      console.error('Error loading attributes by category:', error)
      this.error = error.message || 'Error al cargar los atributos de la categoría'
      return []
    } finally {
      this.loading = false
      this.notify()
    }
  }

  // Get all attributes
  getAttributes() {
    return this.attributes
  }

  // Get attribute by name
  getAttributeByName(name) {
    return this.attributes.find(attribute => 
      attribute.name.toLowerCase() === name.toLowerCase()
    )
  }

  // Get attributes by data type
  getAttributesByType(dataType) {
    return this.attributes.filter(attribute => 
      attribute.data_type === dataType
    )
  }

  // Get required attributes
  getRequiredAttributes() {
    return this.attributes.filter(attribute => 
      attribute.required
    )
  }

  // Clear error
  clearError() {
    this.error = null
    this.notify()
  }

  // Reset service
  reset() {
    this.attributes = []
    this.loading = false
    this.error = null
    this.notify()
  }
}

// Create a singleton instance
export const attributeService = new AttributeService()
