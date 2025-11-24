import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { api } from '../api/axiosInstance'

const getAuthHeaders = () => {
  const token = localStorage.getItem('maricafe-token')
  if (!token) return {}
  return {
    Authorization: `Bearer ${token}`,
  }
}

export const fetchCategories = createAsyncThunk(
  'category/fetchCategories',
  async () => {
    const response = await api.get('/categories', {
      headers: {
        ...getAuthHeaders(),
      },
    })
    return response.data
  }
)

export const createCategory = createAsyncThunk(
  'category/createCategory',
  async (payload) => {
    const response = await api.post('/categories', payload, {
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      },
    })
    return response.data
  }
)

export const updateCategory = createAsyncThunk(
  'category/updateCategory',
  async ({ categoryId, data }) => {
    const response = await api.put(`/categories/${categoryId}`, data, {
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      },
    })
    return response.data
  }
)

export const deleteCategory = createAsyncThunk(
  'category/deleteCategory',
  async (categoryId) => {
    const response = await api.delete(`/categories/${categoryId}`, {
      headers: {
        ...getAuthHeaders(),
      },
    })
    return response.data
  }
)

const initialState = {
  items: [],
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
          state.items = page
        } else if (page && Array.isArray(page.content)) {
          state.items = page.content
        } else {
          state.items = []
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
          state.items.push(apiResponse.data)
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
          const index = state.items.findIndex((c) => c.category_id === updated.category_id)
          if (index !== -1) {
            state.items[index] = updated
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
        state.items = state.items.filter((c) => c.category_id !== categoryId)
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.pending = false
        state.error = action.error.message || null
      })
  },
})

export const selectCategoryItems = (state) => state.category.items
export const selectCategoryPending = (state) => state.category.pending
export const selectCategoryError = (state) => state.category.error

export default categorySlice.reducer
