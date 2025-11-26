import { configureStore } from '@reduxjs/toolkit'
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist'
import storage from 'redux-persist/lib/storage'

import categoryReducer from './slices/category.slice.js'
import userReducer from './slices/user.slice.js'
import productsReducer from './slices/product.slice.js'
import attributeReducer from './slices/attribute.slice.js'
import discountReducer from './slices/discount.slice.js'
import imagesReducer from './slices/images.slice.js'
import orderReducer from './slices/order.slice.js'
import adminStatsReducer from './slices/adminStats.slice.js'
import cartReducer from './slices/cartSlice.js'
import toastReducer from './slices/toastSlice.js'

// Persist user authentication state
const userPersistConfig = {
  key: 'user',
  storage,
  whitelist: ['token', 'currentUser', 'loginTimestamp'],
}

// Persist cart state
const cartPersistConfig = {
  key: 'cart',
  storage,
  whitelist: ['cart', 'total', 'itemCount'],
}

const persistedUserReducer = persistReducer(userPersistConfig, userReducer)
const persistedCartReducer = persistReducer(cartPersistConfig, cartReducer)

export const store = configureStore({
  reducer: {
    category: categoryReducer,
    user: persistedUserReducer,
    products: productsReducer,
    attributes: attributeReducer,
    discount: discountReducer,
    images: imagesReducer,
    order: orderReducer,
    adminStats: adminStatsReducer,
    cart: persistedCartReducer,
    toast: toastReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
})

export const persistor = persistStore(store)
