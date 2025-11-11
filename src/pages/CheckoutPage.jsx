import React, { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, MapPin, ShoppingBag, CreditCard } from 'lucide-react'
import { useCart } from '../context/CartContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import Button from '../components/ui/Button.jsx'
import { createPortal } from 'react-dom'

const PICKUP_LOCATIONS = [
  {
    id: 'palermo',
    name: 'Maricafé Palermo',
    address: 'Honduras 4096, Palermo, Buenos Aires',
    schedule: 'Lun - Vie: 9:00 - 18:00 · Sáb: 10:00 - 22:00 · Dom: Cerrado'
  }
]

export default function CheckoutPage({ onNavigate }) {
  const { state, dispatch } = useCart()
  const { isAuthenticated, token } = useAuth()
  const { showError, showSuccess } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)

  useEffect(() => {
    if (!isAuthenticated || !token) {
      showError('Debes iniciar sesión para finalizar tu compra.')
      onNavigate && onNavigate('login')
      return
    }

    if (state.items.length === 0) {
      showError('Tu carrito está vacío. Agrega productos antes de continuar.')
      onNavigate && onNavigate('productos')
    }
  }, [isAuthenticated, token, state.items.length, onNavigate, showError])

  const subtotal = useMemo(() => {
    return state.items.reduce((acc, item) => acc + item.precio * item.cantidad, 0)
  }, [state.items])

  const handleConfirmOrder = async () => {
    if (isSubmitting) {
      return
    }

    if (!isAuthenticated || !token) {
      showError('Debes iniciar sesión para finalizar tu compra.')
      onNavigate && onNavigate('login')
      return
    }

    if (state.items.length === 0) {
      showError('Tu carrito está vacío.')
      onNavigate && onNavigate('productos')
      return
    }

    try {
      setIsSubmitting(true)

      const orderItems = state.items.map(item => ({
        product_id: item.id,
        quantity: item.cantidad,
        unit_price: item.precio
      }))

      const response = await fetch('http://localhost:4002/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          items: orderItems,
          pickup_location: PICKUP_LOCATIONS[0].name
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Error al crear la orden')
      }

      const data = await response.json()

      showSuccess('¡Orden creada exitosamente!')
      dispatch({ type: 'CLEAR_CART' })

      const newOrderId = data?.data?.order_id || data?.order_id || data?.id
      if (newOrderId) {
        onNavigate && onNavigate('order-details', { orderId: newOrderId })
      } else {
        onNavigate && onNavigate('profile')
      }
    } catch (error) {
      console.error('Error creating order:', error)
      showError(`Error al crear la orden: ${error.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isAuthenticated || state.items.length === 0) {
    return null
  }

  return (
    <div className="bg-background py-12">
      <div className="container mx-auto px-4 max-w-4xl space-y-8">
        <div className="flex items-center justify-between">
          <button
            onClick={() => onNavigate && onNavigate('productos')}
            className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al catálogo
          </button>
        </div>

        <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
          <div className="border-b px-6 py-4 flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">Confirmar tu pedido</h1>
              <p className="text-sm text-muted-foreground">
                Revisá los detalles antes de confirmar. Podrás retirar tu pedido en el punto seleccionado.
              </p>
            </div>
          </div>

          <div className="px-6 py-6 grid gap-8 md:grid-cols-[2fr,1fr]">
            <div className="space-y-6">
              <section>
                <h2 className="text-lg font-semibold mb-3">Productos del pedido</h2>
                <div className="space-y-4">
                  {state.items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4 rounded-lg border p-4">
                      <img
                        src={item.imagen || '/placeholder.svg'}
                        alt={item.nombre}
                        className="w-16 h-16 rounded-md object-cover"
                        onError={(e) => {
                          if (e.target.src !== '/placeholder.svg') {
                            e.target.src = '/placeholder.svg'
                          }
                        }}
                      />
                      <div className="flex-1 space-y-1">
                        <p className="font-medium text-sm sm:text-base">{item.nombre}</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          Cantidad: {item.cantidad}
                        </p>
                      </div>
                      <div className="text-sm sm:text-base font-semibold">
                        {new Intl.NumberFormat('es-AR', {
                          style: 'currency',
                          currency: 'ARS',
                          minimumFractionDigits: 0
                        }).format(item.precio * item.cantidad)}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h2 className="text-lg font-semibold mb-3">Punto de retiro</h2>
                <label
                  className="flex rounded-lg border p-4 bg-primary/5 border-primary cursor-default"
                >
                  <MapPin className="h-5 w-5 text-primary mr-3 mt-1" />
                  <div>
                    <p className="font-medium">Maricafé Palermo</p>
                    <p className="text-sm text-muted-foreground">Honduras 4096, Palermo, Buenos Aires</p>
                    <div className="text-xs text-muted-foreground mt-1 space-y-1">
                      <p>Lun - Vie: 9:00 - 18:00</p>
                      <p>Sáb: 10:00 - 22:00</p>
                      <p>Dom: Cerrado</p>
                    </div>
                  </div>
                </label>
              </section>
            </div>

            <aside className="space-y-4">
              <div className="rounded-lg border p-5 space-y-3 bg-muted/30">
                <h3 className="font-semibold text-lg">Resumen</h3>
                <div className="flex items-center justify-between text-sm">
                  <span>Subtotal</span>
                  <span className="font-medium">
                    {new Intl.NumberFormat('es-AR', {
                      style: 'currency',
                      currency: 'ARS',
                      minimumFractionDigits: 0
                    }).format(subtotal)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Retiro en local</span>
                  <span className="font-medium text-green-600">Sin cargo</span>
                </div>
                <div className="flex items-center justify-between border-t pt-3">
                  <span className="font-semibold">Total a pagar</span>
                  <span className="text-xl font-bold text-primary">
                    {new Intl.NumberFormat('es-AR', {
                      style: 'currency',
                      currency: 'ARS',
                      minimumFractionDigits: 0
                    }).format(subtotal)}
                  </span>
                </div>
              </div>

              <Button
                onClick={handleConfirmOrder}
                size="lg"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Confirmando...' : 'Confirmar pedido'}
              </Button>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => onNavigate && onNavigate('productos')}
                disabled={isSubmitting}
              >
                Seguir comprando
              </Button>

              <div className="rounded-lg border p-4 space-y-3">
                <div className="flex items-center space-x-3">
                  <CreditCard className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-semibold">Opciones de pago</p>
                    <p className="text-sm text-muted-foreground">Seleccioná tu método preferido</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setIsPaymentModalOpen(true)}
                >
                  Transferencia bancaria
                </Button>
              </div>
            </aside>
          </div>
        </div>
      </div>

      {isPaymentModalOpen && createPortal(
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsPaymentModalOpen(false)}
          />

          <div className="relative w-full max-w-sm bg-background border rounded-xl shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <div className="flex items-center space-x-3">
                <CreditCard className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Datos de transferencia</h3>
              </div>
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="rounded-lg p-2 hover:bg-muted transition-colors"
              >
                ×
              </button>
            </div>

            <div className="px-5 py-6 space-y-4">
              <div>
                <p className="text-sm font-semibold text-muted-foreground uppercase">CVU</p>
                <p className="text-lg font-mono font-semibold tracking-wide">1111222233334444</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-muted-foreground uppercase">Alias</p>
                <p className="text-lg font-semibold">maricafe.bbva</p>
              </div>
              <div className="rounded-md bg-muted/40 p-3 text-sm text-muted-foreground">
                Enviar comprobante a nuestro correo o número de teléfono
                <div className="mt-2 space-y-1 text-foreground">
                  <p>Email: contacto@maricafe.com</p>
                  <p>Teléfono: +54 11 2277-7434</p>
                </div>
              </div>
            </div>

            <div className="px-5 py-4 border-t bg-muted/20">
              <Button className="w-full" onClick={() => setIsPaymentModalOpen(false)}>
                Entendido
              </Button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}

