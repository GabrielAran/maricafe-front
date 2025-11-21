import { configureStore } from '@reduxjs/toolkit'
import categoryReducer from './slices/category.slice.js'

export const store = configureStore({
  reducer: {
    category: categoryReducer,
  },
})
