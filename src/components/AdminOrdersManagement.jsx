import React, { useState, useEffect } from 'react'
import { orderService } from '../services/OrderService.js'
import Button from './ui/Button.jsx'
import { Badge } from './ui/Badge.jsx'
import { Card } from './ui/Card.jsx'
import ConfirmationModal from './ui/ConfirmationModal.jsx'
import { useToast } from '../context/ToastContext.jsx'

export default function AdminOrdersManagement() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showOrderDetails, setShowOrderDetails] = useState(false)
  const [deleteOrderId, setDeleteOrderId] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)
  const [filteredOrders, setFilteredOrders] = useState([])
  const [startDateFilter, setStartDateFilter] = useState('')
  const [endDateFilter, setEndDateFilter] = useState('')
  const [orderNumberFilter, setOrderNumberFilter] = useState('')
  const [sortBy, setSortBy] = useState('dateDesc') // Default sort: newest first
  const [dateRangeError, setDateRangeError] = useState('')
  const { showToast } = useToast()

  useEffect(() => {
    loadOrders()
    
    // Subscribe to order service updates
    const unsubscribe = orderService.subscribe((state) => {
      setOrders(state.orders)
      setLoading(state.loading)
      setError(state.error)
    })

    return unsubscribe
  }, [])

  // Apply filters when orders or filter values change
  useEffect(() => {
    let filtered = [...orders]

    // Filter by date range (only if no date range error)
    if ((startDateFilter || endDateFilter) && !dateRangeError) {
      filtered = filtered.filter(order => {
        // Parse order date with Argentina timezone
        const orderDate = new Date(order.createdAt + '-03:00')
        
        let isInRange = true
        
        // Check start date filter
        if (startDateFilter) {
          const startDate = new Date(startDateFilter + 'T00:00:00-03:00')
          isInRange = isInRange && orderDate >= startDate
        }
        
        // Check end date filter
        if (endDateFilter) {
          const endDate = new Date(endDateFilter + 'T23:59:59-03:00')
          isInRange = isInRange && orderDate <= endDate
        }
        
        return isInRange
      })
    }

    // Filter by order number
    if (orderNumberFilter) {
      filtered = filtered.filter(order => 
        order.id.toString().includes(orderNumberFilter)
      )
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'priceAsc':
          return a.total - b.total;
        case 'priceDesc':
          return b.total - a.total;
        case 'dateAsc':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'dateDesc':
          return new Date(b.createdAt) - new Date(a.createdAt);
        default:
          return 0;
      }
    });

    setFilteredOrders(filtered)
  }, [orders, startDateFilter, endDateFilter, orderNumberFilter, sortBy, dateRangeError])

  const [isRefreshing, setIsRefreshing] = useState(false)

  const loadOrders = async () => {
    if (loading || isRefreshing) return
    
    setIsRefreshing(true)
    try {
      await orderService.loadOrders()
    } catch (error) {
      showToast('Error al cargar las órdenes', 'error')
    } finally {
      // Keep animation visible for a moment even after load completes
      setTimeout(() => setIsRefreshing(false), 500)
    }
  }

  const handleViewOrder = (order) => {
    setSelectedOrder(order)
    setShowOrderDetails(true)
  }

  const handleDeleteOrder = (orderId) => {
    setDeleteOrderId(orderId)
    setShowDeleteModal(true)
    setIsCancelling(false) // Reset cancelling state when opening modal
  }

  const confirmDeleteOrder = async () => {
    // Close modal immediately
    setShowDeleteModal(false)
    setDeleteOrderId(null)
    setIsCancelling(false)
    
    try {
      await orderService.deleteOrder(deleteOrderId)
      showToast('✅ Orden cancelada correctamente. El stock ha sido restaurado automáticamente.', 'success')
    } catch (error) {
      showToast('❌ Error al cancelar la orden. Inténtalo de nuevo.', 'error')
    }
  }

  const closeOrderDetails = () => {
    setShowOrderDetails(false)
    setSelectedOrder(null)
  }

  const closeDeleteModal = () => {
    setShowDeleteModal(false)
    setDeleteOrderId(null)
    setIsCancelling(false)
  }

  const clearFilters = () => {
    setStartDateFilter('')
    setEndDateFilter('')
    setOrderNumberFilter('')
    setSortBy('dateDesc') // Reset to default sort
    setDateRangeError('')
  }

  // Validate date range
  const validateDateRange = (startDate, endDate) => {
    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      if (end < start) {
        return 'La fecha hasta debe ser posterior a la fecha desde'
      }
    }
    return ''
  }

  // Handle start date change
  const handleStartDateChange = (value) => {
    setStartDateFilter(value)
    const error = validateDateRange(value, endDateFilter)
    setDateRangeError(error)
  }

  // Handle end date change
  const handleEndDateChange = (value) => {
    setEndDateFilter(value)
    const error = validateDateRange(startDateFilter, value)
    setDateRangeError(error)
  }

  if (loading && orders.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando órdenes...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">
          <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <p className="text-lg font-semibold">Error al cargar las órdenes</p>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
        </div>
        <Button onClick={loadOrders} variant="outline">
          Reintentar
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestión de Órdenes</h2>
          <p className="text-muted-foreground">
            Administra todas las órdenes del sistema
          </p>
        </div>
        <Button 
          onClick={loadOrders} 
          variant="outline" 
          disabled={loading || isRefreshing}
          className="flex items-center gap-2"
        >
          <svg
            className={`w-4 h-4 ${isRefreshing ? 'animate-spin-once' : ''} ${loading ? 'animate-spin' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          <span>
            {loading ? 'Actualizando...' : 'Actualizar'}
          </span>
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha desde
            </label>
            <input
              type="date"
              value={startDateFilter}
              onChange={(e) => handleStartDateChange(e.target.value)}
              max={endDateFilter || undefined}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                dateRangeError 
                  ? 'border-red-300 focus:ring-red-500' 
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha hasta
            </label>
            <input
              type="date"
              value={endDateFilter}
              onChange={(e) => handleEndDateChange(e.target.value)}
              min={startDateFilter || undefined}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                dateRangeError 
                  ? 'border-red-300 focus:ring-red-500' 
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filtrar por número de orden
            </label>
            <input
              type="text"
              placeholder="Ej: 123"
              value={orderNumberFilter}
              onChange={(e) => setOrderNumberFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ordenar por
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="dateDesc">Fecha más reciente</option>
              <option value="dateAsc">Fecha más antigua</option>
              <option value="priceDesc">Mayor precio</option>
              <option value="priceAsc">Menor precio</option>
            </select>
          </div>
          <div className="flex items-end">
            <Button
              onClick={clearFilters}
              variant="outline"
              className="h-10"
            >
              Limpiar filtros
            </Button>
          </div>
        </div>
        {dateRangeError && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <p className="text-sm text-red-600">{dateRangeError}</p>
            </div>
          </div>
        )}
      </div>

      {filteredOrders.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="text-muted-foreground">
            <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-lg font-semibold mb-2">
              {orders.length === 0 ? 'No hay órdenes' : 'No se encontraron órdenes'}
            </p>
            <p className="text-sm">
              {orders.length === 0 
                ? 'No se han encontrado órdenes en el sistema.' 
                : 'No hay órdenes que coincidan con los filtros aplicados.'
              }
            </p>
          </div>
        </Card>
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Orden
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        #{order.id}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {order.userName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {order.userEmail}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {orderService.formatCurrency(order.total)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={orderService.getStatusBadgeClass(order.status)}>
                        {orderService.getStatusDisplayName(order.status)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {orderService.formatDate(order.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <Button
                        onClick={() => handleViewOrder(order)}
                        variant="outline"
                        size="sm"
                      >
                        Ver
                      </Button>
                      {order.status !== 'cancelled' && (
                        <Button
                          onClick={() => handleDeleteOrder(order.id)}
                          variant="outline"
                          size="sm"
                          className="text-orange-600 hover:text-orange-700 hover:border-orange-300"
                        >
                          Cancelar
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={closeOrderDetails}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isVisible={showDeleteModal}
        onCancel={closeDeleteModal}
        onConfirm={confirmDeleteOrder}
        title="Cancelar Orden"
        message={`¿Estás seguro de que deseas cancelar la orden #${deleteOrderId}? El stock de los productos será restaurado automáticamente.`}
        confirmText="Cancelar Orden"
        cancelText="No cancelar"
        type="destructive"
        className="bg-pink-50 border-pink-200"
      />
    </div>
  )
}

// Order Details Modal Component
function OrderDetailsModal({ order, onClose }) {
  if (!order) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold">Detalles de la Orden #{order.id}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-6">
            {/* Order Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Información del Cliente</h4>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">Nombre:</span> {order.userName}</p>
                  <p><span className="font-medium">Email:</span> {order.userEmail}</p>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Información de la Orden</h4>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">Estado:</span> 
                    <Badge className={`ml-2 ${orderService.getStatusBadgeClass(order.status)}`}>
                      {orderService.getStatusDisplayName(order.status)}
                    </Badge>
                  </p>
                  <p><span className="font-medium">Fecha:</span> {orderService.formatDate(order.createdAt)}</p>
                  <p><span className="font-medium">Total:</span> {orderService.formatCurrency(order.total)}</p>
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            {order.deliveryAddress && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Dirección de Entrega</h4>
                <p className="text-sm text-gray-600">{order.deliveryAddress}</p>
              </div>
            )}

            {/* Order Notes */}
            {order.notes && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Notas</h4>
                <p className="text-sm text-gray-600">{order.notes}</p>
              </div>
            )}

            {/* Order Items */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Productos</h4>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Cantidad</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Precio</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {order.items?.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2 text-sm">
                          <div>
                            <div className="font-medium">{item.name}</div>
                          </div>
                        </td>
                        <td className="px-4 py-2 text-sm">{item.quantity}</td>
                        <td className="px-4 py-2 text-sm">{orderService.formatCurrency(item.price)}</td>
                        <td className="px-4 py-2 text-sm font-medium">
                          {orderService.formatCurrency(item.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button onClick={onClose} variant="outline">
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
