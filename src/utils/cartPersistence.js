// Cart persistence utilities for temporary cart storage
// Handles 5-minute cart persistence after logout
// JWT token-based approach: extracts user info from token

import { getUserIdentifierFromToken } from './jwtDecoder.js'

const CART_KEY_PREFIX = 'maricafe-cart-'
const LOGIN_TIMESTAMP_KEY_PREFIX = 'maricafe-login-timestamp-'
const CART_EXPIRY_MINUTES = 0.17 // 10 seconds for testing

// Helper function to get user-specific keys from JWT token
const getUserKeys = (token) => {
  const userId = getUserIdentifierFromToken(token)
  
  if (!userId) {
    console.error('Could not extract user identifier from token')
    return null
  }
  
  return {
    cartKey: `${CART_KEY_PREFIX}${userId}`,
    loginTimestampKey: `${LOGIN_TIMESTAMP_KEY_PREFIX}${userId}`
  }
}

/**
 * Save cart to localStorage
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
    
    console.log('Saving cart items:', cartItems.length)
    localStorage.setItem(keys.cartKey, JSON.stringify(cartItems))
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
 * Clear cart from localStorage
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
  } catch (error) {
    console.error('Error clearing cart from localStorage:', error)
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
}

/**
 * Set login timestamp when user logs in
 * @param {string} token - Authorization token for cart isolation
 */
export const setLoginTimestamp = (token) => {
  if (!token) {
    console.error('Token is required to set login timestamp')
    return
  }
  
  try {
    const keys = getUserKeys(token)
    if (!keys) return
    
    const timestamp = Date.now()
    console.log('Setting login timestamp:', timestamp)
    localStorage.setItem(keys.loginTimestampKey, timestamp.toString())
  } catch (error) {
    console.error('Error setting login timestamp:', error)
  }
}

/**
 * Refresh login timestamp (reset timer when user is active)
 * @param {string} token - Authorization token for cart isolation
 */
export const refreshLoginTimestamp = (token) => {
  if (!token) {
    console.error('Token is required to refresh login timestamp')
    return
  }
  
  try {
    const keys = getUserKeys(token)
    if (!keys) return
    
    const timestamp = Date.now()
    console.log('Refreshing login timestamp:', timestamp)
    localStorage.setItem(keys.loginTimestampKey, timestamp.toString())
  } catch (error) {
    console.error('Error refreshing login timestamp:', error)
  }
}

/**
 * Get remaining time since login in minutes
 * @param {string} token - Authorization token for cart isolation
 * @returns {number} Remaining minutes or 0 if expired/invalid
 */
export const getLoginRemainingTime = (token) => {
  if (!token) return 0
  
  try {
    const keys = getUserKeys(token)
    if (!keys) return 0
    
    const timestamp = localStorage.getItem(keys.loginTimestampKey)
    if (!timestamp) {
      console.log('No login timestamp found in localStorage')
      return 0
    }
    
    const loginTime = parseInt(timestamp)
    const now = Date.now()
    const timeDiffMinutes = (now - loginTime) / (1000 * 60)
    const remainingMinutes = CART_EXPIRY_MINUTES - timeDiffMinutes
    
    console.log('Login time calculation - loginTime:', loginTime, 'now:', now, 'diffMinutes:', timeDiffMinutes, 'remaining:', remainingMinutes)
    
    // Return remaining time in minutes with decimal precision for testing
    return Math.max(0, remainingMinutes)
  } catch (error) {
    console.error('Error calculating login remaining time:', error)
    return 0
  }
}

/**
 * Check if login session has expired
 * @param {string} token - Authorization token for cart isolation
 * @returns {boolean} True if session has expired
 */
export const isLoginExpired = (token) => {
  return getLoginRemainingTime(token) <= 0
}
