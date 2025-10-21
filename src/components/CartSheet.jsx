import React, { useState } from 'react'
import { ShoppingCart, Plus, Minus, Trash2, X } from 'lucide-react'
import { useCart } from '../context/CartContext.jsx'
import Button from './ui/Button.jsx'

export default function CartSheet({ onNavigate }) {
  const { state, dispatch } = useCart()
  const [isOpen, setIsOpen] = useState(false)

  const formatearPrecio = (precio) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
    }).format(precio)
  }

  const updateQuantity = (id, cantidad) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { id, cantidad } })
  }

  const removeItem = (id) => {
    dispatch({ type: "REMOVE_ITEM", payload: id })
  }

  const clearCart = () => {
    dispatch({ type: "CLEAR_CART" })
  }

  const handleCheckout = () => {
    // Mostrar mensaje de funcionalidad próxima
    const message = 'La funcionalidad de checkout estará disponible próximamente. Por ahora, puedes contactarnos para realizar tu pedido.'
    alert(message)
  }

  const handleContinueShopping = () => {
    setIsOpen(false)
    onNavigate && onNavigate('productos')
  }

  return (
    <>
      {/* Cart Button */}
      <button 
        className="relative p-2 text-foreground hover:text-primary transition-colors"
        onClick={() => setIsOpen(true)}
      >
        <ShoppingCart className="h-5 w-5" />
        {state.itemCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {state.itemCount}
          </span>
        )}
      </button>

      {/* Cart Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Modal */}
          <div className="relative bg-background border rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] mx-4 flex flex-col">
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
                <div className="flex-1 flex flex-col items-center justify-center space-y-4 p-8">
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
                  <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {state.items.map((item) => (
                      <div key={item.id} className="flex space-x-3 p-3 border rounded-lg">
                        <img
                          src={item.imagen || "/placeholder.svg"}
                          alt={item.nombre}
                          className="w-16 h-16 object-cover rounded-md"
                        />

                        <div className="flex-1 space-y-2">
                          <div>
                            <h4 className="font-medium text-sm">{item.nombre}</h4>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded capitalize">
                                {item.categoria}
                              </span>
                              {item.vegana && (
                                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                  Vegana
                                </span>
                              )}
                              {item.sinTacc && (
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                  Sin TACC
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => updateQuantity(item.id, item.cantidad - 1)}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="text-sm font-medium w-8 text-center">{item.cantidad}</span>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => updateQuantity(item.id, item.cantidad + 1)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>

                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-bold">{formatearPrecio(item.precio * item.cantidad)}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                                onClick={() => removeItem(item.id)}
                              >
                                <Trash2 className="h-3 w-3" />
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
        </div>
      )}
    </>
  )
}
