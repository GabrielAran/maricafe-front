import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { api } from '../api/axiosInstance'

import { buildAuthHeaders } from './user.slice'
import { extractThumbnailUrl } from '../../utils/imageHelpers.js'

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
  // Store images organized by productId
  // Format: { [productId]: [base64String1, base64String2, ...] }
  // Images are sorted by imageOrder from backend (0 = main image, 1+ = additional)
  imagesByProductId: {},
  // Quick access to thumbnail (main image) for each product
  // Format: { [productId]: "data:image/png;base64,..." }
  thumbnailsByProductId: {},
  pending: false,
  error: null,
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
        
        const productId = action.meta.arg
        if (productId != null) {
          const images = Array.isArray(action.payload) ? action.payload : []
          // Store images by productId (backend returns them sorted by imageOrder)
          state.imagesByProductId[productId] = images
          
          // Extract thumbnail (first image, which has imageOrder = 0 = main image)
          const thumbnailUrl = extractThumbnailUrl(images)
          if (thumbnailUrl) {
            state.thumbnailsByProductId[productId] = thumbnailUrl
          } else {
            // Remove thumbnail if no images
            delete state.thumbnailsByProductId[productId]
          }
        }
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
        
        const productId = action.meta.arg
        if (productId != null) {
          const images = Array.isArray(action.payload) ? action.payload : []
          // Store images by productId (backend returns them sorted by imageOrder)
          state.imagesByProductId[productId] = images
          
          // Extract thumbnail (first image, which has imageOrder = 0 = main image)
          const thumbnailUrl = extractThumbnailUrl(images)
          if (thumbnailUrl) {
            state.thumbnailsByProductId[productId] = thumbnailUrl
          } else {
            // Remove thumbnail if no images
            delete state.thumbnailsByProductId[productId]
          }
        }
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
        // Backend returns "created:" + createdId, but we don't update images here
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
        // Backend returns "created:" + id1,id2,..., but we don't update images here
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
        // Remove the deleted image from all product image arrays
        const imageId = action.payload.imageId
        
        // Iterate through all products and remove the image with matching ID
        Object.keys(state.imagesByProductId).forEach(productId => {
          const images = state.imagesByProductId[productId]
          if (Array.isArray(images)) {
            const filteredImages = images.filter((item) => {
              // Handle both ImageResponse format {id, file} and simple string format
              if (typeof item === 'object' && item.id) {
                return item.id !== imageId
              }
              return true // Keep non-object images (base64 strings) - they don't have IDs
            })
            
            state.imagesByProductId[productId] = filteredImages
            
            // Update thumbnail if needed (first image after deletion)
            const thumbnailUrl = extractThumbnailUrl(filteredImages)
            if (thumbnailUrl) {
              state.thumbnailsByProductId[productId] = thumbnailUrl
            } else {
              delete state.thumbnailsByProductId[productId]
            }
          }
        })
      })
      .addCase(deleteImage.rejected, (state, action) => {
        state.pending = false
        state.error = action.error.message || null
      })
  }
})

export default imagesSlice.reducer

// Selector to get thumbnail (main image) for a product
export const selectThumbnailByProductId = (state, productId) =>
  (state.images.thumbnailsByProductId && state.images.thumbnailsByProductId[productId]) || null

// Selector to get all images for a product
export const selectImagesByProductId = (state, productId) =>
  (state.images.imagesByProductId && state.images.imagesByProductId[productId]) || []

