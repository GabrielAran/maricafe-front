import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import { ShoppingCart, Plus, Minus, Trash2, X } from 'lucide-react'
import { useCart } from '../context/CartContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import Button from './ui/Button.jsx'

export default function CartSheet({ onNavigate }) {
  const { state, dispatch } = useCart()
  const { isAuthenticated, user, token } = useAuth()
  const { showSuccess, showError } = useToast()
  const [isOpen, setIsOpen] = useState(false)


  const formatearPrecio = (precio) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
    }).format(precio)
  }

  const updateQuantity = (id, cantidad) => {
    // Find the item to check stock
    const item = state.items.find(item => item.id === id)
    if (item && cantidad > item.stock) {
      // Don't allow quantity to exceed stock
      return
    }
    if (cantidad < 1) {
      // Don't allow quantity below 1
      return
    }
    dispatch({ type: "UPDATE_QUANTITY", payload: { id, cantidad } })
  }

  const removeItem = (id) => {
    dispatch({ type: "REMOVE_ITEM", payload: id })
  }

  const clearCart = () => {
    dispatch({ type: "CLEAR_CART" })
  }

  const handleCheckout = async () => {
    if (!isAuthenticated || !token) {
      showError('Debes estar autenticado para proceder al checkout')
      return
    }

    if (state.items.length === 0) {
      showError('Tu carrito está vacío')
      return
    }

    try {
      // Convert cart items to order format
      const orderItems = state.items.map(item => ({
        product_id: item.id,
        quantity: item.cantidad,
        unit_price: item.precio // Use the discounted price from cart
      }))

      const response = await fetch('http://localhost:4002/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          items: orderItems
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Error al crear la orden')
      }

      const data = await response.json()
      
      // Show success toast
      showSuccess('¡Orden creada exitosamente!')
      
      // Clear cart after successful order
      dispatch({ type: "CLEAR_CART" })
      
      // Close cart modal
      setIsOpen(false)
      
      // Navigate to profile to see orders
      onNavigate && onNavigate('profile')
      
    } catch (error) {
      console.error('Error creating order:', error)
      showError(`Error al crear la orden: ${error.message}`)
    }
  }

  const handleContinueShopping = () => {
    setIsOpen(false)
    onNavigate && onNavigate('productos')
  }

  const handleCartClick = () => {
    // Check if user is not authenticated
    if (!isAuthenticated) {
      onNavigate && onNavigate('login')
      return
    }
    
    // Check if user is admin (admins can't access cart)
    if (user?.role === 'ADMIN') {
      alert('Los administradores no pueden acceder al carrito de compras.')
      return
    }
    
    // Check if user has USER role
    if (user?.role !== 'USER') {
      alert('Solo los usuarios registrados pueden acceder al carrito de compras.')
      return
    }
    
    // Open cart for authenticated USER
    setIsOpen(true)
  }

  return (
    <>
      {/* Cart Button */}
      <button 
        className="relative p-2 text-foreground hover:text-primary transition-colors"
        onClick={handleCartClick}
      >
        <ShoppingCart className="h-5 w-5" />
        {state.itemCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {state.itemCount}
          </span>
        )}
      </button>

      {/* Cart Modal */}
      {isOpen && createPortal(
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999
          }}
        >
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Modal */}
          <div 
            className="relative bg-background border rounded-lg shadow-2xl w-full max-w-lg flex flex-col overflow-hidden"
            style={{ maxHeight: 'calc(100vh - 2rem)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center space-x-2">
                <ShoppingCart className="h-5 w-5" />
                <h2 className="text-lg font-semibold">Tu Carrito ({state.itemCount})</h2>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden flex flex-col">
              
              {state.items.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center space-y-4 p-8 min-h-0">
                  <ShoppingCart className="h-16 w-16 text-muted-foreground" />
                  <div className="text-center space-y-2">
                    <h3 className="font-semibold">Tu carrito está vacío</h3>
                    <p className="text-sm text-muted-foreground">Agrega algunos productos deliciosos para comenzar</p>
                  </div>
                  <Button onClick={handleContinueShopping}>
                    Ver Productos
                  </Button>
                </div>
              ) : (
                <>
                  {/* Items del carrito */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-0">
                    {state.items.map((item) => (
                      <div key={item.id} className="flex space-x-3 p-3 border rounded-lg">
                        <img
                          src={item.imagen || "/placeholder.svg"}
                          alt={item.nombre}
                          className="w-16 h-16 object-cover rounded-md"
                          onError={(e) => {
                            if (e.target.src !== "/placeholder.svg") {
                              e.target.src = "/placeholder.svg"
                            }
                          }}
                        />

                        <div className="flex-1 space-y-2">
                          <div>
                            <h4 className="font-medium text-sm">{item.nombre}</h4>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-10 w-10 p-0 flex items-center justify-center"
                                onClick={() => updateQuantity(item.id, item.cantidad - 1)}
                                disabled={item.cantidad <= 1}
                              >
                                <Minus className="h-5 w-5" />
                              </Button>
                              <span className="text-sm font-medium w-8 text-center">{item.cantidad}</span>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-10 w-10 p-0 flex items-center justify-center"
                                onClick={() => updateQuantity(item.id, item.cantidad + 1)}
                                disabled={item.cantidad >= item.stock}
                                title={item.cantidad >= item.stock ? `Stock máximo: ${item.stock}` : 'Aumentar cantidad'}
                              >
                                <Plus className="h-5 w-5" />
                              </Button>
                            </div>

                            <div className="flex items-center space-x-3">
                              <span className="text-sm font-bold">{formatearPrecio(item.precio * item.cantidad)}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-10 w-10 p-0 text-destructive hover:text-destructive hover:bg-destructive/10 flex items-center justify-center"
                                onClick={() => removeItem(item.id)}
                                title="Eliminar del carrito"
                              >
                                <Trash2 className="h-5 w-5" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Resumen y acciones */}
                  <div className="border-t p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">Total:</span>
                      <span className="text-xl font-bold text-primary">{formatearPrecio(state.total)}</span>
                    </div>

                    <div className="space-y-2">
                      <Button 
                        className="w-full" 
                        size="lg"
                        onClick={handleCheckout}
                      >
                        Proceder al Checkout
                      </Button>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={handleContinueShopping}
                        >
                          Seguir Comprando
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearCart}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
