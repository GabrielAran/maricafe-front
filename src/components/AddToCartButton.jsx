import React, { useState } from 'react'
import { ShoppingCart, Check } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { showError, showWarning } from '../utils/toastHelper.js'
import { getLoginRemainingTime } from '../utils/cartRemainingTime.js'
import { addItem, clearCart, setCartOwner, selectCartOwnerUserId } from '../redux/slices/cartSlice.js'
import {
  selectToken,
  selectCurrentUser,
  selectIsAuthenticated,
  selectLoginTimestamp,
  refreshLoginTimestamp,
} from '../redux/slices/user.slice.js'
import { decrementStock } from '../redux/slices/product.slice.js'
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
  const dispatch = useDispatch()
  const token = useSelector(selectToken)
  const currentUser = useSelector(selectCurrentUser)
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const loginTimestamp = useSelector(selectLoginTimestamp)
  const userRole = currentUser?.role
  const cartOwnerUserId = useSelector(selectCartOwnerUserId)
  const [added, setAdded] = useState(false)

  const handleAddToCart = () => {
    if (disabled) return

    // Check if user is not authenticated
    if (!isAuthenticated) {
      if (onNavigate) {
        onNavigate('login')
      } else {
        showError(dispatch, 'Debes iniciar sesión para agregar productos al carrito.')
      }
      return
    }

    // Check if user is admin (admins can't add to cart)
    if (userRole === 'ADMIN') {
      showError(dispatch, 'Los administradores no pueden agregar productos al carrito.')
      return
    }

    // Check if user has USER role
    if (userRole !== 'USER') {
      showError(dispatch, 'Solo los usuarios registrados pueden agregar productos al carrito.')
      return
    }

    // Check remaining time for cart session (based on login time)
    const remainingTime = getLoginRemainingTime(loginTimestamp)

    if (remainingTime <= 0) {
      // Expiró la "sesión de carrito": vaciamos carrito pero el usuario sigue logueado
      dispatch(clearCart())
      dispatch(setCartOwner(null))
      dispatch(refreshLoginTimestamp())
      showWarning(
        dispatch,
        'Tu carrito ha expirado por inactividad. Lo hemos vaciado, pero podés seguir agregando productos.'
      )
      // Importante: cortamos acá. El siguiente click ya será con carrito limpio y tiempo renovado.
      return
    }

    if (!currentUser || !currentUser.userId) {
      return
    }

    if (cartOwnerUserId && cartOwnerUserId !== currentUser.userId) {
      dispatch(clearCart())
    }

    if (!cartOwnerUserId || cartOwnerUserId !== currentUser.userId) {
      dispatch(setCartOwner(currentUser.userId))
    }

    // Check stock availability
    // Check stock availability
    if (product.stock < quantity) {
      const message = product.stock === 0 ? 'Stock agotado' : `Solo quedan ${product.stock} unidades disponibles.`
      showError(dispatch, message)
      return
    }

    const productWithQuantity = {
      ...product,
      cantidad: quantity,
      imagen: image || product.imagen || null // Include image data if provided
    }
    dispatch(addItem(productWithQuantity))
    dispatch(decrementStock({ productId: product.id, quantity }))
    setAdded(true)

    // Reset the "added" state after 2 seconds
    setTimeout(() => {
      setAdded(false)
    }, 1000)
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
