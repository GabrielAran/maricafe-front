// Utility functions for the Maricafe frontend

/**
 * Format price in Argentine Peso
 * @param {number} price - The price to format
 * @returns {string} Formatted price string
 */
export function formatPrice(price) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
  }).format(price)
}

/**
 * Merge class names utility (similar to clsx)
 * @param {...string} classes - Class names to merge
 * @returns {string} Merged class names
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}

/**
 * Debounce function to limit function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
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

/**
 * Check if a string contains keywords for featured products
 * @param {string} text - Text to check
 * @returns {boolean} True if text contains featured keywords
 */
export function isFeatured(text) {
  const featuredKeywords = ['pride', 'rainbow', 'arcoíris', 'destacado', 'especial']
  const lowerText = text.toLowerCase()
  return featuredKeywords.some(keyword => lowerText.includes(keyword))
}

/**
 * Generate a unique ID
 * @returns {string} Unique ID
 */
export function generateId() {
  return Math.random().toString(36).substr(2, 9)
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if email is valid
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {object} Validation result with isValid and message
 */
export function validatePassword(password) {
  if (password.length < 8) {
    return { isValid: false, message: 'La contraseña debe tener al menos 8 caracteres' }
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    return { isValid: false, message: 'La contraseña debe contener al menos una letra minúscula' }
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    return { isValid: false, message: 'La contraseña debe contener al menos una letra mayúscula' }
  }
  
  if (!/(?=.*\d)/.test(password)) {
    return { isValid: false, message: 'La contraseña debe contener al menos un número' }
  }
  
  return { isValid: true, message: 'Contraseña válida' }
}

/**
 * Get user initials from name
 * @param {string} firstName - First name
 * @param {string} lastName - Last name
 * @returns {string} User initials
 */
export function getUserInitials(firstName, lastName) {
  const first = firstName ? firstName.charAt(0).toUpperCase() : ''
  const last = lastName ? lastName.charAt(0).toUpperCase() : ''
  return first + last
}

/**
 * Format date to Spanish locale
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date
 */
export function formatDate(date) {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleDateString('es-AR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

/**
 * Calculate total price with discount
 * @param {number} price - Original price
 * @param {number} discountPercentage - Discount percentage (0-100)
 * @returns {number} Final price after discount
 */
export function calculateDiscountedPrice(price, discountPercentage) {
  if (discountPercentage <= 0) return price
  if (discountPercentage >= 100) return 0
  
  const discount = (price * discountPercentage) / 100
  return Math.round(price - discount)
}

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export function truncateText(text, maxLength = 100) {
  if (text.length <= maxLength) return text
  return text.substr(0, maxLength) + '...'
}
