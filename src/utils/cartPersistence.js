// Cart persistence utilities for temporary cart storage
// Handles 5-minute cart persistence after logout
// JWT token-based approach: extracts user info from token

import { getUserIdentifierFromToken } from './jwtDecoder.js'

const CART_KEY_PREFIX = 'maricafe-cart-'
const TEMP_CART_KEY_PREFIX = 'maricafe-temp-cart-'
const CART_TIMESTAMP_KEY_PREFIX = 'maricafe-cart-timestamp-'
const CART_EXPIRY_MINUTES = 5

// Helper function to get user-specific keys from JWT token
const getUserKeys = (token) => {
  const userId = getUserIdentifierFromToken(token)
  
  if (!userId) {
    console.error('Could not extract user identifier from token')
    return null
  }
  
  return {
    cartKey: `${CART_KEY_PREFIX}${userId}`,
    tempCartKey: `${TEMP_CART_KEY_PREFIX}${userId}`,
    timestampKey: `${CART_TIMESTAMP_KEY_PREFIX}${userId}`
  }
}

/**
 * Save cart to localStorage with timestamp
 * @param {Array} cartItems - Array of cart items
 * @param {string} token - Authorization token for cart isolation
 */
export const saveCart = (cartItems, token) => {
  if (!token) {
    console.error('Token is required to save cart')
    return
  }
  
  try {
    const keys = getUserKeys(token)
    if (!keys) return
    
    localStorage.setItem(keys.cartKey, JSON.stringify(cartItems))
    localStorage.setItem(keys.timestampKey, Date.now().toString())
  } catch (error) {
    console.error('Error saving cart to localStorage:', error)
  }
}

/**
 * Load cart from localStorage
 * @param {string} token - Authorization token for cart isolation
 * @returns {Array} Array of cart items or empty array
 */
export const loadCart = (token) => {
  if (!token) {
    console.error('Token is required to load cart')
    return []
  }
  
  try {
    const keys = getUserKeys(token)
    if (!keys) return []
    
    const savedCart = localStorage.getItem(keys.cartKey)
    return savedCart ? JSON.parse(savedCart) : []
  } catch (error) {
    console.error('Error loading cart from localStorage:', error)
    return []
  }
}

/**
 * Save cart as temporary (for logged out users)
 * @param {Array} cartItems - Array of cart items
 * @param {string} token - Authorization token for cart isolation
 */
export const saveTempCart = (cartItems, token) => {
  if (!token) {
    console.error('Token is required to save temporary cart')
    return
  }
  
  try {
    const keys = getUserKeys(token)
    if (!keys) return
    
    localStorage.setItem(keys.tempCartKey, JSON.stringify(cartItems))
    localStorage.setItem(keys.timestampKey, Date.now().toString())
  } catch (error) {
    console.error('Error saving temporary cart to localStorage:', error)
  }
}

/**
 * Load temporary cart if it hasn't expired
 * @param {string} token - Authorization token for cart isolation
 * @returns {Object} { items: Array, isValid: boolean }
 */
export const loadTempCart = (token) => {
  if (!token) {
    console.error('Token is required to load temporary cart')
    return { items: [], isValid: false }
  }
  
  try {
    const keys = getUserKeys(token)
    if (!keys) return { items: [], isValid: false }
    
    const tempCart = localStorage.getItem(keys.tempCartKey)
    const timestamp = localStorage.getItem(keys.timestampKey)
    
    if (!tempCart || !timestamp) {
      return { items: [], isValid: false }
    }
    
    const cartItems = JSON.parse(tempCart)
    const cartTime = parseInt(timestamp)
    const now = Date.now()
    const timeDiffMinutes = (now - cartTime) / (1000 * 60)
    
    // Check if cart has expired (more than 5 minutes)
    if (timeDiffMinutes > CART_EXPIRY_MINUTES) {
      // Clear expired temporary cart
      clearTempCart(token)
      return { items: [], isValid: false }
    }
    
    return { items: cartItems, isValid: true }
  } catch (error) {
    console.error('Error loading temporary cart from localStorage:', error)
    return { items: [], isValid: false }
  }
}

/**
 * Clear regular cart from localStorage
 * @param {string} token - Authorization token for cart isolation
 */
export const clearCart = (token) => {
  if (!token) {
    console.error('Token is required to clear cart')
    return
  }
  
  try {
    const keys = getUserKeys(token)
    if (!keys) return
    
    localStorage.removeItem(keys.cartKey)
    localStorage.removeItem(keys.timestampKey)
  } catch (error) {
    console.error('Error clearing cart from localStorage:', error)
  }
}

/**
 * Clear temporary cart from localStorage
 * @param {string} token - Authorization token for cart isolation
 */
export const clearTempCart = (token) => {
  if (!token) {
    console.error('Token is required to clear temporary cart')
    return
  }
  
  try {
    const keys = getUserKeys(token)
    if (!keys) return
    
    localStorage.removeItem(keys.tempCartKey)
    localStorage.removeItem(keys.timestampKey)
  } catch (error) {
    console.error('Error clearing temporary cart from localStorage:', error)
  }
}


/**
 * Clear both regular and temporary carts for a specific user
 * @param {string} token - Authorization token for cart isolation
 */
export const clearAllCarts = (token) => {
  if (!token) {
    console.error('Token is required to clear all carts')
    return
  }
  
  clearCart(token)
  clearTempCart(token)
}

/**
 * Check if there's a valid temporary cart available
 * @param {string} token - Authorization token for cart isolation
 * @returns {boolean} True if there's a valid temporary cart
 */
export const hasValidTempCart = (token) => {
  if (!token) return false
  const { isValid } = loadTempCart(token)
  return isValid
}

/**
 * Get remaining time for temporary cart in minutes
 * @param {string} token - Authorization token for cart isolation
 * @returns {number} Remaining minutes or 0 if expired/invalid
 */
export const getTempCartRemainingTime = (token) => {
  if (!token) return 0
  
  try {
    const keys = getUserKeys(token)
    if (!keys) return 0
    
    const timestamp = localStorage.getItem(keys.timestampKey)
    if (!timestamp) return 0
    
    const cartTime = parseInt(timestamp)
    const now = Date.now()
    const timeDiffMinutes = (now - cartTime) / (1000 * 60)
    const remainingMinutes = CART_EXPIRY_MINUTES - timeDiffMinutes
    
    return Math.max(0, Math.round(remainingMinutes))
  } catch (error) {
    console.error('Error calculating remaining time:', error)
    return 0
  }
}
