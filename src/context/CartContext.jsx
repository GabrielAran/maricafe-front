import React, { createContext, useContext, useReducer, useEffect, useState } from 'react'
import { useAuth } from './AuthContext.jsx'
import { 
  saveCart, 
  loadCart, 
  saveTempCart, 
  loadTempCart, 
  clearCart, 
  clearTempCart, 
  clearAllCarts,
  hasValidTempCart 
} from '../utils/cartPersistence.js'

// Cart Context - Sin TypeScript, solo JavaScript
const CartContext = createContext(null)

// Cart reducer function
function cartReducer(state, action) {
  switch (action.type) {
    case "ADD_ITEM": {
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
      clearTempCart()
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
    // If token changed, clear current cart first
    if (currentToken && currentToken !== token) {
      dispatch({ type: "CLEAR_CART" })
    }
    
    setCurrentToken(token)
    
    if (isAuthenticated && user?.role === 'USER' && token) {
      // User is logged in - first check for temporary cart, then regular cart
      const { items: tempCartItems, isValid: tempCartValid } = loadTempCart(token)
      
      if (tempCartValid && tempCartItems.length > 0) {
        // Restore temporary cart and convert to regular cart
        dispatch({ type: "LOAD_CART", payload: tempCartItems })
        // Clear the temporary cart since we're now logged in
        clearTempCart(token)
      } else {
        // No valid temporary cart, load regular cart
        const cartItems = loadCart(token)
        if (cartItems.length > 0) {
          dispatch({ type: "LOAD_CART", payload: cartItems })
        }
      }
    } else if (token) {
      // User is not logged in but we have a token - check for temporary cart
      const { items: tempCartItems, isValid } = loadTempCart(token)
      if (isValid && tempCartItems.length > 0) {
        dispatch({ type: "LOAD_CART", payload: tempCartItems })
      } else if (!isValid) {
        // Clear expired temporary cart from state
        dispatch({ type: "CLEAR_TEMP_CART" })
      }
    } else {
      // No token - clear cart
      dispatch({ type: "CLEAR_CART" })
    }
  }, [isAuthenticated, user?.role, token, currentToken])

  // Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    if (!token) return // Don't save if no token
    
    if (isAuthenticated && user?.role === 'USER') {
      // User is logged in - save to regular cart
      saveCart(state.items, token)
    } else {
      // User is not logged in - save to temporary cart
      if (state.items.length > 0) {
        saveTempCart(state.items, token)
      }
    }
  }, [state.items, isAuthenticated, user?.role, token])

  // Handle cart when user logs out or when admin logs in
  useEffect(() => {
    if (!token) return
    
    if (!isAuthenticated) {
      // User logged out - save current cart as temporary if it has items
      if (state.items.length > 0) {
        saveTempCart(state.items, token)
      }
      // Don't clear the cart immediately - let it persist temporarily
    } else if (user?.role === 'ADMIN') {
      // Admin logged in - clear cart (admins can't use cart)
      dispatch({ type: "CLEAR_CART" })
      clearAllCarts(token)
    }
  }, [isAuthenticated, user?.role, token, state.items])

  return <CartContext.Provider value={{ state, dispatch }}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
