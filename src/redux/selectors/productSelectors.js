import { calculateDiscountedPrice } from '../../utils/priceHelpers.js'

/**
 * Selector that merges products with discount info from discountSlice
 * This allows products to reflect discount changes without refetching
 * 
 * @param {Object} state - Redux state
 * @returns {Array} Array of products with merged discount information
 */
export const selectProductsWithDiscounts = (state) => {
  const products = state.products.products
  const productDiscounts = state.discount.productDiscounts
  
  if (!Array.isArray(products)) return []
  
  return products.map(product => {
    const discountInfo = productDiscounts[product.id]
    if (discountInfo) {
      // Merge discount info into product
      return {
        ...product,
        descuento: discountInfo.discount_percentage,
        descuentoId: discountInfo.discount_id,
        precio: calculateDiscountedPrice(product.precioOriginal, discountInfo.discount_percentage),
      }
    }
    // If no discount in map, check if product has discount from fetch (fallback)
    // This handles cases where product was fetched but discount map wasn't updated yet
    if (product.descuento && product.descuento > 0) {
      return product
    }
    // No discount - ensure fields are cleared
    return {
      ...product,
      descuento: 0,
      descuentoId: null,
      precio: product.precioOriginal,
    }
  })
}

