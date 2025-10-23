import React, { useState } from 'react'
import { ShoppingCart, Check } from 'lucide-react'
import { useCart } from '../context/CartContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { getLoginRemainingTime } from '../utils/cartPersistence.js'
import Button from './ui/Button.jsx'

export default function AddToCartButton({ 
  product, 
  className = '', 
  size = "default", 
  children,
  disabled = false,
  onNavigate,
  quantity = 1,
  image = null
}) {
  const { dispatch } = useCart()
  const { isAuthenticated, user, token } = useAuth()
  const { showError } = useToast()
  const [added, setAdded] = useState(false)

  const handleAddToCart = () => {
    if (disabled) return
    
    // Check if user is not authenticated
    if (!isAuthenticated) {
      if (onNavigate) {
        onNavigate('login')
      } else {
        showError('Debes iniciar sesión para agregar productos al carrito.')
      }
      return
    }
    
    // Check if user is admin (admins can't add to cart)
    if (user?.role === 'ADMIN') {
      showError('Los administradores no pueden agregar productos al carrito.')
      return
    }
    
    // Check if user has USER role
    if (user?.role !== 'USER') {
      showError('Solo los usuarios registrados pueden agregar productos al carrito.')
      return
    }
    
    // Check if login session has expired (15 minutes)
    if (token) {
      const remainingTime = getLoginRemainingTime(token)
      if (remainingTime <= 0) {
        showError('Tu sesión ha expirado. Por favor, inicia sesión nuevamente para continuar comprando.')
        return
      }
    }
    
    // Add to cart for authenticated USER with selected quantity
    const productWithQuantity = { 
      ...product, 
      cantidad: quantity,
      imagen: image || product.imagen || null // Include image data if provided
    }
    dispatch({ type: "ADD_ITEM", payload: productWithQuantity })
    setAdded(true)
    
    // Reset the "added" state after 2 seconds
    setTimeout(() => {
      setAdded(false)
    }, 2000)
  }

  return (
    <Button 
      onClick={handleAddToCart} 
      className={className} 
      size={size}
      disabled={disabled || added}
    >
      {children || (
        <>
          {added ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              ¡Agregado!
            </>
          ) : disabled ? (
            <>
              <ShoppingCart className="h-4 w-4 mr-2" />
              Sin stock
            </>
          ) : (
            <>
              <ShoppingCart className="h-4 w-4 mr-2" />
              Agregar al carrito
            </>
          )}
        </>
      )}
    </Button>
  )
}
