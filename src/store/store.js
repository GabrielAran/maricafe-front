import { configureStore } from '@reduxjs/toolkit'
import discountReducer from './slices/discountSlice.js'

// Redux store configuration
// This will gradually replace Context API providers
export const store = configureStore({
  reducer: {
    // Domain Slices
    discount: discountReducer,
    // TODO - migrate these:
    // auth: authReducer,      // User/authentication state
    // cart: cartReducer,      // Shopping cart state
  },
})
