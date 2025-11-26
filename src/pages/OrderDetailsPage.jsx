import React, { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { ArrowLeft, Package, Calendar, DollarSign, ShoppingBag, Clock, CheckCircle } from 'lucide-react'
import { fetchUserOrderById } from '../redux/slices/order.slice.js'
import { 
  selectCurrentUser, 
  selectIsAuthenticated 
} from '../redux/slices/user.slice.js'

export default function OrderDetailsPage({ onNavigate, orderId }) {
  const dispatch = useDispatch()

  const isAuthenticated = useSelector(selectIsAuthenticated)
  const currentUser = useSelector(selectCurrentUser)
  const userRole = currentUser?.role

  const order = useSelector((state) => state.order.currentItem)
  const loading = useSelector((state) => state.order.pending)
  const orderError = useSelector((state) => state.order.error)

  const hasInitialized = useRef(false)

  useEffect(() => {
    /**
     * FIX: Prevent duplicate dispatch calls caused by StrictMode + unstable deps.
     * Uses a ref guard and stable selector-based dependencies.
     */
    if (!hasInitialized.current && orderId && isAuthenticated && userRole === 'USER') {
      hasInitialized.current = true
      dispatch(fetchUserOrderById(orderId))
    }
  }, [orderId, isAuthenticated, userRole, dispatch])

  const handleRetry = () => {
    if (orderId && isAuthenticated && userRole === 'USER') {
      dispatch(fetchUserOrderById(orderId))
    }
  }

  const formatearPrecio = (precio) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
    }).format(precio)
  }

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Redirect if not authenticated or not USER role
  if (!isAuthenticated || userRole !== 'USER') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">Acceso Denegado</h1>
          <p className="text-muted-foreground mb-4">
            Solo los usuarios con rol USER pueden acceder a esta página.
          </p>
          <button 
            onClick={() => onNavigate('profile')}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
          >
            Volver al Perfil
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <div className="text-center">
              <Clock className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Cargando detalles de la orden...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (orderError) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="h-8 w-8 text-destructive" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                Error al cargar la orden
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {'Error al cargar los detalles de la orden'}
              </p>
              <button 
                onClick={handleRetry}
                className="text-sm bg-primary text-primary-foreground px-3 py-2 rounded-md hover:bg-primary/90 transition-colors"
              >
                Reintentar
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                Orden no encontrada
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                La orden solicitada no existe o no tienes permisos para verla.
              </p>
              <button 
                onClick={() => onNavigate('profile')}
                className="text-sm bg-primary text-primary-foreground px-3 py-2 rounded-md hover:bg-primary/90 transition-colors"
              >
                Volver al Perfil
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button 
            onClick={() => onNavigate('profile')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al Perfil
          </button>
          
          <h1 className="text-3xl font-bold text-foreground mb-2">Detalles de la Orden</h1>
          <p className="text-muted-foreground">
            Información completa de tu orden #{order.order_id}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Information */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card rounded-lg border p-6">
              <h2 className="text-xl font-semibold flex items-center gap-2 mb-6">
                <Package className="h-5 w-5" />
                Información de la Orden
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Número de Orden
                  </label>
                  <p className="text-foreground font-mono">#{order.order_id}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Fecha
                  </label>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <p className="text-foreground">{formatearFecha(order.order_date)}</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Estado
                  </label>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-green-600 font-medium">Exitosa</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Total
                  </label>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-primary" />
                    <p className="text-foreground font-bold text-lg text-primary">
                      {formatearPrecio(order.total_price)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-card rounded-lg border p-6">
              <h2 className="text-xl font-semibold flex items-center gap-2 mb-6">
                <ShoppingBag className="h-5 w-5" />
                Productos ({order.items?.length || 0})
              </h2>
              
              {order.items && order.items.length > 0 ? (
                <div className="space-y-4">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-medium text-foreground">{item.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Cantidad: {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-foreground">
                          {formatearPrecio((item.price || 0) * item.quantity)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatearPrecio(item.price || 0)} c/u
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    No hay productos
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Esta orden no contiene productos.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-lg border p-6 sticky top-8">
              <h2 className="text-xl font-semibold flex items-center gap-2 mb-6">
                <DollarSign className="h-5 w-5" />
                Resumen
              </h2>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Productos:</span>
                  <span className="font-medium">{order.items?.length || 0}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total de items:</span>
                  <span className="font-medium">
                    {order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0}
                  </span>
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Total:</span>
                    <span className="text-xl font-bold text-primary">
                      {formatearPrecio(order.total_price)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
