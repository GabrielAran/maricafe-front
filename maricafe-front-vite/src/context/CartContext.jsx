import React, { createContext, useContext, useReducer, useEffect } from 'react'

// Cart Context - Sin TypeScript, solo JavaScript
const CartContext = createContext(null)

// Cart reducer function
function cartReducer(state, action) {
  switch (action.type) {
    case "ADD_ITEM": {
      const existingItem = state.items.find((item) => item.id === action.payload.id)

      let newItems
      if (existingItem) {
        newItems = state.items.map((item) =>
          item.id === action.payload.id ? { ...item, cantidad: item.cantidad + 1 } : item,
        )
      } else {
        newItems = [...state.items, { ...action.payload, cantidad: 1 }]
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

  // Cargar carrito desde localStorage al inicializar
  useEffect(() => {
    const savedCart = localStorage.getItem("maricafe-cart")
    if (savedCart) {
      try {
        const cartItems = JSON.parse(savedCart)
        dispatch({ type: "LOAD_CART", payload: cartItems })
      } catch (error) {
        console.error("Error loading cart from localStorage:", error)
      }
    }
  }, [])

  // Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem("maricafe-cart", JSON.stringify(state.items))
  }, [state.items])

  return <CartContext.Provider value={{ state, dispatch }}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
