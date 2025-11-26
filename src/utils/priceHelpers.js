/**
 * Price and discount utility functions
 */

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

