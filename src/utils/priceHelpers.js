/**
 * Price and discount utility functions
 */

/**
 * Format price in Argentine Peso
 * @param {number} price - The price to format
 * @returns {string} Formatted price string
 */
export function formatPrice(price) {
  if (price == null || Number.isNaN(price)) return ''

  // Redondear a 2 decimales
  const rounded = Math.round(Number(price) * 100) / 100

  // Si no hay parte decimal (por ejemplo 100.00), mostrar sin decimales
  const hasDecimals = rounded % 1 !== 0

  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(rounded)
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

