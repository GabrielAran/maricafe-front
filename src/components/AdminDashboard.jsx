import React, { useState, useEffect, useRef, useLayoutEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { selectIsAdmin } from '../redux/slices/user.slice.js'
import {
  fetchOverviewStats,
  fetchProductsByCategory,
  fetchLowStockProducts,
  fetchTopSellingProducts,
  fetchTopSpendingUsers,
  fetchDiscountedProducts,
} from '../redux/slices/adminStats.slice.js'

export default function AdminDashboard() {
  const dispatch = useDispatch()
  
  // Redux state
  const isAdminUser = useSelector(selectIsAdmin)
  const overview = useSelector(state => state.adminStats.overview)
  const productsByCategory = useSelector(state => state.adminStats.productsByCategory)
  const lowStockProducts = useSelector(state => state.adminStats.lowStockProducts)
  const topSellingProducts = useSelector(state => state.adminStats.topSellingProducts)
  const topSpendingUsers = useSelector(state => state.adminStats.topSpendingUsers)
  const discountedProducts = useSelector(state => state.adminStats.discountedProducts)
  const loading = useSelector(state => state.adminStats.pending)
  const error = useSelector(state => state.adminStats.error)

  // StrictMode-safe initialization pattern
  const hasInitialized = useRef(false)

  useEffect(() => {
    if (!hasInitialized.current && isAdminUser) {
      hasInitialized.current = true
      // Dispatch all dashboard data thunks in parallel (fire-and-forget)
      dispatch(fetchOverviewStats())
      dispatch(fetchProductsByCategory())
      dispatch(fetchLowStockProducts())
      dispatch(fetchTopSellingProducts())
      dispatch(fetchTopSpendingUsers())
      dispatch(fetchDiscountedProducts())
    }
  }, [isAdminUser, dispatch])

  const handleRetry = () => {
    dispatch(fetchOverviewStats())
    dispatch(fetchProductsByCategory())
    dispatch(fetchLowStockProducts())
    dispatch(fetchTopSellingProducts())
    dispatch(fetchTopSpendingUsers())
    dispatch(fetchDiscountedProducts())
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount)
  }

  // Small helper component that reduces font-size so the text fits on one line
  // inside its container. It measures text width and decreases font-size until
  // it fits or reaches a minimum. This prevents wrapping and keeps the value
  // readable for arbitrarily large numbers.
  function AutoShrinkText({ children, className = '', maxFontSize = 24, minFontSize = 12, step = 1 }) {
    const containerRef = useRef(null)
    const textRef = useRef(null)
    const [fontSize, setFontSize] = useState(maxFontSize)

    const fit = () => {
      const container = containerRef.current
      const text = textRef.current
      if (!container || !text) return

      // start from max and reduce until it fits
      let current = maxFontSize
      text.style.fontSize = current + 'px'
      // Use a loop with a safety limit
      const limit = Math.max(50, Math.ceil((maxFontSize - minFontSize) / Math.max(1, step)))
      let i = 0
      while (text.scrollWidth > container.clientWidth && current > minFontSize && i < limit) {
        current = Math.max(minFontSize, current - step)
        text.style.fontSize = current + 'px'
        i++
      }
      setFontSize(current)
    }

    useLayoutEffect(() => {
      fit()
      const onResize = () => fit()
      window.addEventListener('resize', onResize)
      return () => window.removeEventListener('resize', onResize)
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [children, maxFontSize, minFontSize, step])

    return (
      <div ref={containerRef} className="w-full" style={{minWidth: 0}}>
        <span
          ref={textRef}
          className={className}
          style={{ fontSize: fontSize + 'px', whiteSpace: 'nowrap', display: 'inline-block', lineHeight: 1 }}
        >
          {children}
        </span>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Cargando dashboard...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">Error al cargar los datos del dashboard</div>
        <button 
          onClick={handleRetry}
          className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/80"
        >
          Reintentar
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Productos</p>
              <p className="text-2xl font-semibold text-gray-900">{overview.totalProducts || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Usuarios</p>
              <p className="text-2xl font-semibold text-gray-900">{overview.totalUsers || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Órdenes</p>
              <p className="text-2xl font-semibold text-gray-900">{overview.totalOrders || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div className="ml-4 min-w-0">
              <p className="text-sm font-medium text-gray-600">Ingresos Totales</p>
              {/* Use AutoShrinkText so the revenue value scales down to fit on one
                  line instead of wrapping or overflowing. */}
              <div className="w-full">
                <AutoShrinkText maxFontSize={28} minFontSize={12} className="font-semibold text-gray-900">
                  {formatCurrency(overview.totalRevenue || 0)}
                </AutoShrinkText>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Productos con Descuento</p>
              <p className="text-2xl font-semibold text-gray-900">{overview.totalDiscounts || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Products by Category */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Productos por Categoría</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(productsByCategory).map(([category, count]) => (
            <div key={category} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="font-medium text-gray-700">{category}</span>
              <span className="text-lg font-semibold text-primary">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Low Stock Products */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Productos con Stock Bajo (≤ 5 unidades)</h3>
        {lowStockProducts.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No hay productos con stock bajo</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {lowStockProducts.map((product, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        product.stock <= 2 ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {product.stock} unidades
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(product.price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Top Selling Products */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Productos Más Vendidos</h3>
        {topSellingProducts.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No hay datos de ventas disponibles</p>
        ) : (
          <div className="space-y-3">
            {topSellingProducts.map((product, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <span className="text-lg font-bold text-primary mr-3">#{index + 1}</span>
                  <div>
                    <p className="font-medium text-gray-900">{product.productName}</p>
                    <p className="text-sm text-gray-500">{formatCurrency(product.price)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-gray-900">{product.totalSold} vendidos</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Top Spending Users */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Usuarios que Más Gastan</h3>
        {topSpendingUsers.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No hay datos de usuarios disponibles</p>
        ) : (
          <div className="space-y-3">
            {topSpendingUsers.map((user, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <span className="text-lg font-bold text-primary mr-3">#{index + 1}</span>
                  <div>
                    <p className="font-medium text-gray-900">{user.userName}</p>
                    <p className="text-sm text-gray-500">{user.userEmail}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-gray-900">{formatCurrency(user.totalSpent)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Discounted Products */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Productos con Descuento</h3>
        {discountedProducts.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No hay productos con descuento actualmente</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio Original</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descuento</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio Final</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ahorro</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {discountedProducts.map((product, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.productName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(product.originalPrice)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                        {product.discountPercentage}% OFF
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">{formatCurrency(product.discountedPrice)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">{formatCurrency(product.savings)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.stock} unidades</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
