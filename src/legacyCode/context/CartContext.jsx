import React, { createContext, useContext, useReducer, useEffect, useState } from 'react'
import { useAuth } from './AuthContext.jsx'
import { 
  saveCart, 
  loadCart, 
  clearCart, 
  clearAllCarts,
  setLoginTimestamp,
  getLoginRemainingTime,
  isLoginExpired
} from '../utils/cartPersistence.js'

// Cart Context - Sin TypeScript, solo JavaScript
const CartContext = createContext(null)

// Cart reducer function
function cartReducer(state, action) {
  switch (action.type) {
    case "ADD_ITEM": {
      console.log('ADD_ITEM action received:', action.payload, 'current state:', state)
      const existingItem = state.items.find((item) => item.id === action.payload.id)
      const quantityToAdd = action.payload.cantidad || 1

      let newItems
      if (existingItem) {
        newItems = state.items.map((item) =>
          item.id === action.payload.id ? { ...item, cantidad: item.cantidad + quantityToAdd } : item,
        )
      } else {
        newItems = [...state.items, { ...action.payload, cantidad: quantityToAdd }]
      }

      const total = newItems.reduce((sum, item) => sum + item.precio * item.cantidad, 0)
      const itemCount = newItems.reduce((sum, item) => sum + item.cantidad, 0)

      console.log('ADD_ITEM result:', { items: newItems, total, itemCount })
      return { items: newItems, total, itemCount }
    }

    case "REMOVE_ITEM": {
      const newItems = state.items.filter((item) => item.id !== action.payload)
      const total = newItems.reduce((sum, item) => sum + item.precio * item.cantidad, 0)
      const itemCount = newItems.reduce((sum, item) => sum + item.cantidad, 0)

      return { items: newItems, total, itemCount }
    }

    case "UPDATE_QUANTITY": {
      const newItems = state.items
        .map((item) =>
          item.id === action.payload.id ? { ...item, cantidad: Math.max(0, action.payload.cantidad) } : item,
        )
        .filter((item) => item.cantidad > 0)

      const total = newItems.reduce((sum, item) => sum + item.precio * item.cantidad, 0)
      const itemCount = newItems.reduce((sum, item) => sum + item.cantidad, 0)

      return { items: newItems, total, itemCount }
    }

    case "CLEAR_CART":
      return { items: [], total: 0, itemCount: 0 }

    case "CLEAR_TEMP_CART":
      return { items: [], total: 0, itemCount: 0 }

    case "LOAD_CART": {
      const total = action.payload.reduce((sum, item) => sum + item.precio * item.cantidad, 0)
      const itemCount = action.payload.reduce((sum, item) => sum + item.cantidad, 0)

      return { items: action.payload, total, itemCount }
    }

    default:
      return state
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    total: 0,
    itemCount: 0,
  })
  const { isAuthenticated, user, token } = useAuth()
  const [currentToken, setCurrentToken] = useState(null)

  // Track user changes and load appropriate cart
  useEffect(() => {
    console.log('CartContext useEffect - isAuthenticated:', isAuthenticated, 'user:', user, 'token:', !!token, 'currentToken:', !!currentToken)
    
    // If token changed, clear current cart first
    if (currentToken && currentToken !== token) {
      console.log('Token changed, clearing cart')
      dispatch({ type: "CLEAR_CART" })
    }
    
    setCurrentToken(token)
    
    if (isAuthenticated && user?.role === 'USER' && token) {
      console.log('User logged in, setting login timestamp and loading cart')
      // Set login timestamp when user logs in
      setLoginTimestamp(token)
      
      // Check if session has expired before loading cart
      if (isLoginExpired(token)) {
        console.log('Login session expired, clearing cart')
        clearCart(token)
        dispatch({ type: "CLEAR_CART" })
      } else {
        // Load cart for authenticated user only if session is valid
        const cartItems = loadCart(token)
        if (cartItems.length > 0) {
          console.log('Loading cart items:', cartItems)
          dispatch({ type: "LOAD_CART", payload: cartItems })
        }
      }
    } else if (user?.role === 'ADMIN') {
      console.log('Admin user, clearing cart')
      // Admin logged in - clear cart (admins can't use cart)
      dispatch({ type: "CLEAR_CART" })
      if (token) clearAllCarts(token)
    } else {
      console.log('Not authenticated or no token, clearing cart')
      // Not logged in or no token - clear cart
      dispatch({ type: "CLEAR_CART" })
    }
  }, [isAuthenticated, user?.role, token, currentToken])

  // Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    console.log('Cart save effect - isAuthenticated:', isAuthenticated, 'user role:', user?.role, 'token:', !!token, 'items:', state.items.length)
    
    if (!isAuthenticated || user?.role !== 'USER' || !token) return // Only save for authenticated users
    
    // Always save cart state (including empty cart) to persist removals
    console.log('Saving cart to localStorage:', state.items)
    saveCart(state.items, token)
  }, [state.items, isAuthenticated, user?.role, token])

  // Check for session expiration periodically
  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'USER' || !token) return

    const checkExpiration = () => {
      if (isLoginExpired(token)) {
        console.log('Login session expired, clearing cart')
        clearCart(token)
        dispatch({ type: "CLEAR_CART" })
      }
    }

    // Check immediately
    checkExpiration()
    
    // Check every minute
    const interval = setInterval(checkExpiration, 60000)
    
    return () => clearInterval(interval)
  }, [isAuthenticated, user?.role, token, dispatch])



  return <CartContext.Provider value={{ state, dispatch }}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
