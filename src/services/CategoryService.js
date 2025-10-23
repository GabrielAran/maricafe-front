// Category Service - Handles all category-related operations and state
import { CategoryApiService } from './CategoryApiService.js'

export class CategoryService {
  constructor() {
    this.categories = []
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
      categories: this.categories,
      loading: this.loading,
      error: this.error
    }
  }

  // Load all categories
  async loadCategories() {
    try {
      this.loading = true
      this.error = null
      this.notify()

      const apiCategories = await CategoryApiService.getCategories()
      
      // Handle paginated response
      let categoriesArray = apiCategories
      if (!Array.isArray(apiCategories) && apiCategories.content) {
        categoriesArray = apiCategories.content
      } else if (!Array.isArray(apiCategories)) {
        console.error('CategoryService: Invalid categories response format. Expected array or paginated object, got:', typeof apiCategories, apiCategories)
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
      this.loading = false
      this.notify()
    }
  }

  // Get category by ID
  async getCategoryById(id) {
    try {
      this.loading = true
      this.error = null
      this.notify()

      const apiCategory = await CategoryApiService.getCategoryById(id)
      return apiCategory
      
    } catch (error) {
      console.error('Error loading category:', error)
      this.error = error.message || 'Error al cargar la categoría'
      return null
    } finally {
      this.loading = false
      this.notify()
    }
  }

  // Get category by name
  getCategoryByName(name) {
    return this.categories.find(category => 
      category.name.toLowerCase() === name.toLowerCase()
    )
  }

  // Get all categories
  getCategories() {
    return this.categories
  }

  // Create new category
  async createCategory(categoryData) {
    try {
      this.loading = true
      this.error = null
      this.notify()

      const response = await CategoryApiService.createCategory(categoryData)
      
      // Reload categories to get updated list
      await this.loadCategories()
      
      return response
      
    } catch (error) {
      console.error('Error creating category:', error)
      this.error = error.message || 'Error al crear la categoría'
      throw error
    } finally {
      this.loading = false
      this.notify()
    }
  }

  // Update category
  async updateCategory(id, categoryData) {
    try {
      this.loading = true
      this.error = null
      this.notify()

      const response = await CategoryApiService.updateCategory(id, categoryData)
      
      // Reload categories to get updated list
      await this.loadCategories()
      
      return response
      
    } catch (error) {
      console.error('Error updating category:', error)
      this.error = error.message || 'Error al actualizar la categoría'
      throw error
    } finally {
      this.loading = false
      this.notify()
    }
  }

  // Delete category
  async deleteCategory(id) {
    try {
      this.loading = true
      this.error = null
      this.notify()

      await CategoryApiService.deleteCategory(id)
      
      // Reload categories to get updated list
      await this.loadCategories()
      
    } catch (error) {
      console.error('Error deleting category:', error)
      this.error = error.message || 'Error al eliminar la categoría'
      throw error
    } finally {
      this.loading = false
      this.notify()
    }
  }

  // Clear error
  clearError() {
    this.error = null
    this.notify()
  }

  // Reset service
  reset() {
    this.categories = []
    this.loading = false
    this.error = null
    this.notify()
  }
}

// Create a singleton instance
export const categoryService = new CategoryService()
