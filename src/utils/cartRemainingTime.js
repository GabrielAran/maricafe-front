// Cart remaining time utilities
// Handles30-minute session expiry logic for cart operations
// All data comes from Redux state - no localStorage

const CART_EXPIRY_MINUTES = 30 //30 minutes from login

/**
 * Get remaining time since login in minutes
 * @param {number|null} loginTimestamp - Login timestamp from Redux state
 * @returns {number} Remaining minutes or 0 if expired/invalid
 */
export const getLoginRemainingTime = (loginTimestamp) => {
  if (!loginTimestamp) {
    return 0
  }
  
  try {
    const now = Date.now()
    const timeDiffMinutes = (now - loginTimestamp) / (1000 * 60)
    const remainingMinutes = CART_EXPIRY_MINUTES - timeDiffMinutes
    
    console.log('Login time calculation - loginTime:', loginTimestamp, 'now:', now, 'diffMinutes:', timeDiffMinutes, 'remaining:', remainingMinutes)
    
    // Return remaining time in minutes
    return Math.max(0, remainingMinutes)
  } catch (error) {
    console.error('Error calculating login remaining time:', error)
    return 0
  }
}

/**
 * Check if login session has expired
 * @param {number|null} loginTimestamp - Login timestamp from Redux state
 * @returns {boolean} True if session has expired
 */
export const isLoginExpired = (loginTimestamp) => {
  return getLoginRemainingTime(loginTimestamp) <= 0
}

