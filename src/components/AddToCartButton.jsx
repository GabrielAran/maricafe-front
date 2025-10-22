import React, { useState } from 'react'
import { ShoppingCart, Check } from 'lucide-react'
import { useCart } from '../context/CartContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import Button from './ui/Button.jsx'

export default function AddToCartButton({ 
  product, 
  className = '', 
  size = "default", 
  children,
  disabled = false,
  onNavigate,
  quantity = 1
}) {
  const { dispatch } = useCart()
  const { isAuthenticated, user } = useAuth()
  const [added, setAdded] = useState(false)

  const handleAddToCart = () => {
    if (disabled) return
    
    // Check if user is not authenticated
    if (!isAuthenticated) {
      if (onNavigate) {
        onNavigate('login')
      } else {
        alert('Debes iniciar sesión para agregar productos al carrito.')
      }
      return
    }
    
    // Check if user is admin (admins can't add to cart)
    if (user?.role === 'ADMIN') {
      alert('Los administradores no pueden agregar productos al carrito.')
      return
    }
    
    // Check if user has USER role
    if (user?.role !== 'USER') {
      alert('Solo los usuarios registrados pueden agregar productos al carrito.')
      return
    }
    
    // Add to cart for authenticated USER with selected quantity
    const productWithQuantity = { ...product, cantidad: quantity }
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
