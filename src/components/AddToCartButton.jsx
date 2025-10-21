import React, { useState } from 'react'
import { ShoppingCart, Check } from 'lucide-react'
import { useCart } from '../context/CartContext.jsx'
import Button from './ui/Button.jsx'

export default function AddToCartButton({ 
  product, 
  className = '', 
  size = "default", 
  children 
}) {
  const { dispatch } = useCart()
  const [added, setAdded] = useState(false)

  const handleAddToCart = () => {
    dispatch({ type: "ADD_ITEM", payload: product })
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
      disabled={added}
    >
      {children || (
        <>
          {added ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              ¡Agregado!
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
