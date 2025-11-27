import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import { useSelector, useDispatch } from 'react-redux'
import { ShoppingCart, Plus, Minus, Trash2, X } from 'lucide-react'
import {
  updateQuantity,
  removeItem,
  clearCart,
  selectCart,
  selectCartTotal,
  selectCartItemCount,
  selectCartOwnerUserId,
} from '../redux/slices/cartSlice.js'
import {
  selectCurrentUser,
  selectToken,
  selectIsAuthenticated
} from '../redux/slices/user.slice.js'
import { incrementStock, decrementStock } from '../redux/slices/product.slice.js'
import { showError } from '../utils/toastHelper.js'
import Button from './ui/Button.jsx'

export default function CartSheet({ onNavigate }) {
  const dispatch = useDispatch()

  // Redux state - Cart
  const cartItems = useSelector(selectCart)
  const cartTotal = useSelector(selectCartTotal)
  const cartItemCount = useSelector(selectCartItemCount)
  const cartOwnerUserId = useSelector(selectCartOwnerUserId)

  // Redux state - Auth
  const currentUser = useSelector(selectCurrentUser)
  const token = useSelector(selectToken)
  const isAuthenticated = useSelector(selectIsAuthenticated)

  // UI state
  const [isOpen, setIsOpen] = useState(false)

  const isCartOwner = isAuthenticated && currentUser && cartOwnerUserId && currentUser.userId === cartOwnerUserId
  const visibleCartItems = isCartOwner ? cartItems : []
  const visibleCartItemCount = isCartOwner ? cartItemCount : 0


  const formatearPrecio = (precio) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
    }).format(precio)
  }

  const handleUpdateQuantity = (id, cantidad) => {
    // Find the item to check stock
    const item = cartItems.find(item => item.id === id)
    if (item && cantidad > item.stock) {
      // Don't allow quantity to exceed stock
      return
    }
    if (cantidad < 1) {
      // Don't allow quantity below 1
      return
    }
    const diff = cantidad - item.cantidad

    // Dispatch stock update first
    if (diff > 0) {
      dispatch(decrementStock({ productId: id, quantity: diff }))
    } else if (diff < 0) {
      dispatch(incrementStock({ productId: id, quantity: Math.abs(diff) }))
    }

    dispatch(updateQuantity({ id, cantidad }))
  }

  const handleRemoveItem = (id) => {
    const item = cartItems.find(item => item.id === id)
    if (item) {
      dispatch(incrementStock({ productId: id, quantity: item.cantidad }))
    }
    dispatch(removeItem(id))
  }

  const handleClearCart = () => {
    // Restore stock for all items
    cartItems.forEach(item => {
      dispatch(incrementStock({ productId: item.id, quantity: item.cantidad }))
    })
    dispatch(clearCart())
  }

  const handleCheckoutClick = () => {
    if (!isAuthenticated || !token) {
      showError(dispatch, 'Debes estar autenticado para proceder al checkout')
      return
    }

    // Only allow checkout if the current user is the cart owner and has visible items
    if (!isCartOwner || visibleCartItems.length === 0) {
      showError(dispatch, 'Tu carrito está vacío. Agrega productos antes de continuar.')
      return
    }

    setIsOpen(false)
    onNavigate && onNavigate('checkout')
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
    if (currentUser?.role === 'ADMIN') {
      showError(dispatch, 'Los administradores no pueden acceder al carrito de compras.')
      return
    }

    // Check if user has USER role
    if (currentUser?.role !== 'USER') {
      showError(dispatch, 'Solo los usuarios registrados pueden acceder al carrito de compras.')
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
        {visibleCartItemCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {visibleCartItemCount}
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
                <h2 className="text-lg font-semibold">Tu Carrito ({visibleCartItemCount})</h2>
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

              {visibleCartItems.length === 0 ? (
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
                    {visibleCartItems.map((item) => (
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
                                onClick={() => handleUpdateQuantity(item.id, item.cantidad - 1)}
                                disabled={item.cantidad <= 1}
                              >
                                <Minus className="h-5 w-5" />
                              </Button>
                              <span className="text-sm font-medium w-8 text-center">{item.cantidad}</span>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-10 w-10 p-0 flex items-center justify-center"
                                onClick={() => handleUpdateQuantity(item.id, item.cantidad + 1)}
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
                                onClick={() => handleRemoveItem(item.id)}
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
                      <span className="text-xl font-bold text-primary">{formatearPrecio(cartTotal)}</span>
                    </div>

                    <div className="space-y-2">
                      <Button
                        className="w-full"
                        size="lg"
                        onClick={handleCheckoutClick}
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
                          onClick={handleClearCart}
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
