import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { api } from '../api/axiosInstance'

import { buildAuthHeaders } from './user.slice'

export const fetchCategories = createAsyncThunk(
  'category/fetchCategories',
  async (_, { getState }) => {
    const response = await api.get('/categories', {
      headers: buildAuthHeaders(getState()),
    })
    return response.data
  }
)

export const createCategory = createAsyncThunk(
  'category/createCategory',
  async (payload, { getState }) => {
    const response = await api.post('/categories', payload, {
      headers: buildAuthHeaders(getState(), true),
    })
    return response.data
  }
)

export const updateCategory = createAsyncThunk(
  'category/updateCategory',
  async ({ categoryId, data }, { getState }) => {
    const response = await api.put(`/categories/${categoryId}`, data, {
      headers: buildAuthHeaders(getState(), true),
    })
    return response.data
  }
)

export const deleteCategory = createAsyncThunk(
  'category/deleteCategory',
  async (categoryId, { getState }) => {
    const response = await api.delete(`/categories/${categoryId}`, {
      headers: buildAuthHeaders(getState()),
    })
    return response.data
  }
)

const initialState = {
  categories: [],
  pending: false,
  error: null,
}

const categorySlice = createSlice({
  name: 'category',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.pending = true
        state.error = null
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.pending = false
        const page = action.payload
        if (Array.isArray(page)) {
          state.categories = page
        } else if (page && Array.isArray(page.content)) {
          state.categories = page.content
        } else {
          state.categories = []
        }
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.pending = false
        state.error = action.error.message || null
      })

    builder
      .addCase(createCategory.pending, (state) => {
        state.pending = true
        state.error = null
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.pending = false
        const apiResponse = action.payload
        if (apiResponse && apiResponse.data) {
          state.categories.push(apiResponse.data)
        }
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.pending = false
        state.error = action.error.message || null
      })

    builder
      .addCase(updateCategory.pending, (state) => {
        state.pending = true
        state.error = null
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        state.pending = false
        const apiResponse = action.payload
        if (apiResponse && apiResponse.data && apiResponse.data.category_id != null) {
          const updated = apiResponse.data
          const index = state.categories.findIndex((c) => c.category_id === updated.category_id)
          if (index !== -1) {
            state.categories[index] = updated
          }
        }
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.pending = false
        state.error = action.error.message || null
      })

    builder
      .addCase(deleteCategory.pending, (state) => {
        state.pending = true
        state.error = null
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.pending = false
        const categoryId = action.meta.arg
        state.categories = state.categories.filter((c) => c.category_id !== categoryId)
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.pending = false
        state.error = action.error.message || null
      })
  },
})

export const selectCategoryCategories = (state) => state.category.categories
export const selectCategoryPending = (state) => state.category.pending
export const selectCategoryError = (state) => state.category.error

export default categorySlice.reducer
