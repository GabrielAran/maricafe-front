import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { api } from '../api/axiosInstance'

import { buildAuthHeaders } from './user.slice'

// GET /images/{productId}
// Returns: List<String> (base64 strings)
export const fetchProductImages = createAsyncThunk(
  'images/fetchProductImages',
  async (productId, { getState }) => {
    const res = await api.get(`/images/${productId}`, {
      headers: buildAuthHeaders(getState())
    })
    return res.data
  }
)

// GET /images/{productId}/with-ids
// Returns: List<ImageResponse> where ImageResponse = {id: Long, file: String}
export const fetchProductImagesWithIds = createAsyncThunk(
  'images/fetchProductImagesWithIds',
  async (productId, { getState }) => {
    const res = await api.get(`/images/${productId}/with-ids`, {
      headers: buildAuthHeaders(getState())
    })
    return res.data
  }
)

// POST /images (multipart/form-data)
// Returns: "created:" + createdId (String)
export const createImage = createAsyncThunk(
  'images/createImage',
  async ({ file, productId }, { getState }) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('productId', productId)

    const res = await api.post('/images', formData, {
      headers: buildAuthHeaders(getState())
    })
    return res.data
  }
)

// POST /images/multiple (multipart/form-data)
// Returns: "created:" + id1,id2,... (String)
export const createMultipleImages = createAsyncThunk(
  'images/createMultipleImages',
  async ({ files, productId }, { getState }) => {
    const formData = new FormData()
    files.forEach(file => {
      formData.append('files', file)
    })
    formData.append('productId', productId)

    const res = await api.post('/images/multiple', formData, {
      headers: buildAuthHeaders(getState())
    })
    return res.data
  }
)

// DELETE /images/{imageId}
// Returns: "Imagen eliminada correctamente" (String)
export const deleteImage = createAsyncThunk(
  'images/deleteImage',
  async (imageId, { getState }) => {
    const res = await api.delete(`/images/${imageId}`, {
      headers: buildAuthHeaders(getState())
    })
    return { imageId, response: res.data }
  }
)

const initialState = {
  items: [],
  pending: false,
  error: null
}

const imagesSlice = createSlice({
  name: 'images',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // fetchProductImages
    builder
      .addCase(fetchProductImages.pending, (state) => {
        state.pending = true
        state.error = null
      })
      .addCase(fetchProductImages.fulfilled, (state, action) => {
        state.pending = false
        state.items = Array.isArray(action.payload) ? action.payload : []
      })
      .addCase(fetchProductImages.rejected, (state, action) => {
        state.pending = false
        state.error = action.error.message || null
      })

    // fetchProductImagesWithIds
    builder
      .addCase(fetchProductImagesWithIds.pending, (state) => {
        state.pending = true
        state.error = null
      })
      .addCase(fetchProductImagesWithIds.fulfilled, (state, action) => {
        state.pending = false
        state.items = Array.isArray(action.payload) ? action.payload : []
      })
      .addCase(fetchProductImagesWithIds.rejected, (state, action) => {
        state.pending = false
        state.error = action.error.message || null
      })

    // createImage
    builder
      .addCase(createImage.pending, (state) => {
        state.pending = true
        state.error = null
      })
      .addCase(createImage.fulfilled, (state, action) => {
        state.pending = false
        // Backend returns "created:" + createdId, but we don't update items here
        // Components should refetch images after creation if needed
      })
      .addCase(createImage.rejected, (state, action) => {
        state.pending = false
        state.error = action.error.message || null
      })

    // createMultipleImages
    builder
      .addCase(createMultipleImages.pending, (state) => {
        state.pending = true
        state.error = null
      })
      .addCase(createMultipleImages.fulfilled, (state, action) => {
        state.pending = false
        // Backend returns "created:" + id1,id2,..., but we don't update items here
        // Components should refetch images after creation if needed
      })
      .addCase(createMultipleImages.rejected, (state, action) => {
        state.pending = false
        state.error = action.error.message || null
      })

    // deleteImage
    builder
      .addCase(deleteImage.pending, (state) => {
        state.pending = true
        state.error = null
      })
      .addCase(deleteImage.fulfilled, (state, action) => {
        state.pending = false
        // Remove the deleted image from items array
        const imageId = action.payload.imageId
        state.items = state.items.filter((item) => {
          // Handle both ImageResponse format {id, file} and simple string format
          if (typeof item === 'object' && item.id) {
            return item.id !== imageId
          }
          return true // Keep non-object items (base64 strings) - they don't have IDs
        })
      })
      .addCase(deleteImage.rejected, (state, action) => {
        state.pending = false
        state.error = action.error.message || null
      })
  }
})

export default imagesSlice.reducer

