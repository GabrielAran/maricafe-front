/**
 * Product normalization and utility functions
 */

/**
 * Normalizes a backend product to frontend format
 * Transforms backend product structure to the format expected by the UI
 * 
 * @param {Object} backendProduct - Product object from backend API
 * @returns {Object} Normalized product object for frontend use
 */
export function normalizeProduct(backendProduct) {
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
    stock: backendProduct.stock || 0,
    active: backendProduct.active !== false,
    attributes: attributes,
    // Preserve original backend attributes array for UIs that need full attribute objects
    attributesList: backendProduct.attributes && Array.isArray(backendProduct.attributes)
      ? backendProduct.attributes
      : []
  }
}

/**
 * Checks if a product is available for purchase
 * Admin users can see all products, regular users only see products with stock > 0
 * 
 * @param {Object} product - Product object
 * @param {boolean} isAdmin - Whether the current user is an admin
 * @returns {boolean} True if product is available
 */
export function isProductAvailable(product, isAdmin = false) {
  // Admin users can see all products, regular users only see products with stock and activs
  const isActive = product.active !== false
  return isAdmin || (isActive && product.stock > 0)
}

/**
 * Gets the availability status of a product
 * 
 * @param {Object} product - Product object
 * @returns {string} Availability status: 'available', 'low-stock', or 'out-of-stock'
 */
export function getProductAvailabilityStatus(product) {
  if (product.stock > 10) return 'available'
  if (product.stock > 0) return 'low-stock'
  return 'out-of-stock'
}

/**
 * Check if a string contains keywords for vegan products
 * @param {string} text - Text to check
 * @returns {boolean} True if text contains vegan keywords
 */
export function isVegan(text) {
  const veganKeywords = ['vegan', 'vegana', 'vegetal', 'plant-based']
  const lowerText = text.toLowerCase()
  return veganKeywords.some(keyword => lowerText.includes(keyword))
}

/**
 * Check if a string contains keywords for gluten-free products
 * @param {string} text - Text to check
 * @returns {boolean} True if text contains gluten-free keywords
 */
export function isGlutenFree(text) {
  const glutenFreeKeywords = ['tacc', 'gluten', 'celiac', 'sin gluten', 'gluten-free']
  const lowerText = text.toLowerCase()
  return glutenFreeKeywords.some(keyword => lowerText.includes(keyword))
}

