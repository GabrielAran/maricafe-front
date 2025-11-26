/**
 * Admin stats normalization and utility functions
 */

/**
 * Normalizes overview stats from backend to frontend format
 * @param {Object} backendOverview - Overview stats object from backend API
 * @returns {Object} Normalized overview stats object
 */
export function normalizeOverviewStats(backendOverview) {
  if (!backendOverview || typeof backendOverview !== 'object') {
    return {}
  }

  return {
    totalProducts: backendOverview.totalProducts || 0,
    totalUsers: backendOverview.totalUsers || 0,
    totalOrders: backendOverview.totalOrders || 0,
    totalDiscounts: backendOverview.totalDiscounts || 0,
    totalRevenue: backendOverview.totalRevenue || 0,
  }
}

/**
 * Normalizes products by category from backend to frontend format
 * @param {Object} backendProductsByCategory - Products by category object from backend API
 * @returns {Object} Normalized products by category object
 */
export function normalizeProductsByCategory(backendProductsByCategory) {
  if (!backendProductsByCategory || typeof backendProductsByCategory !== 'object') {
    return {}
  }

  return backendProductsByCategory
}

/**
 * Normalizes a low stock product from backend to frontend format
 * @param {Object} backendProduct - Low stock product object from backend API
 * @returns {Object} Normalized low stock product object
 */
export function normalizeLowStockProduct(backendProduct) {
  if (!backendProduct || typeof backendProduct !== 'object') {
    return null
  }

  return {
    id: backendProduct.id || null,
    title: backendProduct.title || '',
    category: backendProduct.category || 'Sin categoría',
    stock: backendProduct.stock || 0,
    price: backendProduct.price || 0,
  }
}

/**
 * Normalizes a top selling product from backend to frontend format
 * @param {Object} backendProduct - Top selling product object from backend API
 * @returns {Object} Normalized top selling product object
 */
export function normalizeTopSellingProduct(backendProduct) {
  if (!backendProduct || typeof backendProduct !== 'object') {
    return null
  }

  return {
    productId: backendProduct.productId || null,
    productName: backendProduct.productName || '',
    price: backendProduct.price || 0,
    totalSold: backendProduct.totalSold || 0,
  }
}

/**
 * Normalizes a top spending user from backend to frontend format
 * @param {Object} backendUser - Top spending user object from backend API
 * @returns {Object} Normalized top spending user object
 */
export function normalizeTopSpendingUser(backendUser) {
  if (!backendUser || typeof backendUser !== 'object') {
    return null
  }

  return {
    userId: backendUser.userId || null,
    userName: backendUser.userName || '',
    userEmail: backendUser.userEmail || '',
    totalSpent: backendUser.totalSpent || 0,
  }
}

/**
 * Normalizes a discounted product from backend to frontend format
 * @param {Object} backendProduct - Discounted product object from backend API
 * @returns {Object} Normalized discounted product object
 */
export function normalizeDiscountedProduct(backendProduct) {
  if (!backendProduct || typeof backendProduct !== 'object') {
    return null
  }

  return {
    discountId: backendProduct.discountId || null,
    productId: backendProduct.productId || null,
    productName: backendProduct.productName || '',
    category: backendProduct.category || 'Sin categoría',
    originalPrice: backendProduct.originalPrice || 0,
    discountPercentage: backendProduct.discountPercentage || 0,
    discountedPrice: backendProduct.discountedPrice || 0,
    savings: backendProduct.savings || 0,
    stock: backendProduct.stock || 0,
  }
}

