// JWT token decoder utility
// Extracts user information from JWT tokens

/**
 * Decode JWT token and extract payload
 * @param {string} token - JWT token
 * @returns {Object|null} Decoded payload or null if invalid
 */
export const decodeJWT = (token) => {
  if (!token) {
    console.error('Token is required to decode JWT')
    return null
  }

  try {
    // JWT tokens have 3 parts separated by dots: header.payload.signature
    const parts = token.split('.')
    
    if (parts.length !== 3) {
      console.error('Invalid JWT token format')
      return null
    }

    // Decode the payload (second part)
    const payload = parts[1]
    
    // Add padding if needed for base64 decoding
    const paddedPayload = payload + '='.repeat((4 - payload.length % 4) % 4)
    
    // Decode base64
    const decodedPayload = atob(paddedPayload)
    
    // Parse JSON
    return JSON.parse(decodedPayload)
  } catch (error) {
    console.error('Error decoding JWT token:', error)
    return null
  }
}

/**
 * Extract user identifier from JWT token
 * @param {string} token - JWT token
 * @returns {string|null} User identifier (id or email) or null if not found
 */
export const getUserIdentifierFromToken = (token) => {
  const payload = decodeJWT(token)
  
  if (!payload) {
    return null
  }

  // Try to get user ID first, then email as fallback
  return payload.id || payload.user_id || payload.sub || payload.email || null
}

/**
 * Extract user email from JWT token
 * @param {string} token - JWT token
 * @returns {string|null} User email or null if not found
 */
export const getUserEmailFromToken = (token) => {
  const payload = decodeJWT(token)
  
  if (!payload) {
    return null
  }

  return payload.email || null
}

/**
 * Check if JWT token is expired
 * @param {string} token - JWT token
 * @returns {boolean} True if token is expired
 */
export const isTokenExpired = (token) => {
  const payload = decodeJWT(token)
  
  if (!payload || !payload.exp) {
    return true
  }

  // exp is in seconds, Date.now() is in milliseconds
  const currentTime = Math.floor(Date.now() / 1000)
  return payload.exp < currentTime
}
