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
  // Images are sorted by imageOrder from backend (0 = main image/thumbnail, 1+ = additional)
  // The first image (index 0) is always the thumbnail/main image
  imagesByProductId: {},
  pending: false,
  error: null,
}

const imagesSlice = createSlice({
  name: 'images',
  initialState,
  reducers: {
    // Permite que componentes actualicen directamente la cache de imágenes
    // para un producto específico (por ejemplo, usando previews locales)
    setProductImages: (state, action) => {
      const { productId, images } = action.payload || {}
      if (productId == null) return
      if (!Array.isArray(images)) return
      state.imagesByProductId[productId] = images
    },
  },
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
          // First image (index 0) is the thumbnail/main image
          state.imagesByProductId[productId] = images
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
          // First image (index 0) is the thumbnail/main image
          state.imagesByProductId[productId] = images
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
        // Remove the deleted image from product image arrays
        const imageId = action.payload.imageId
        
        // Find and update the product that has this image
        for (const productId in state.imagesByProductId) {
          const images = state.imagesByProductId[productId]
          if (Array.isArray(images)) {
            // Check if this product has the image we're deleting
            const hasImage = images.some(item => 
              typeof item === 'object' && item.id && item.id === imageId
            )
            
            if (hasImage) {
              // Filter out the deleted image
              const filteredImages = images.filter((item) => {
                if (typeof item === 'object' && item.id) {
                  return item.id !== imageId
                }
                return true // Keep non-object images (base64 strings) - they don't have IDs
              })
              
              state.imagesByProductId[productId] = filteredImages
              // First image (index 0) is automatically the new thumbnail
              break // Found and updated, no need to continue
            }
          }
        }
      })
      .addCase(deleteImage.rejected, (state, action) => {
        state.pending = false
        state.error = action.error.message || null
      })
  }
})

export const { setProductImages } = imagesSlice.actions

export default imagesSlice.reducer

// Selector to get all images for a product
export const selectImagesByProductId = (state, productId) =>
  (state.images.imagesByProductId && state.images.imagesByProductId[productId]) || []

// Selector to get thumbnail (main image) for a product - derived from first image in array
export const selectThumbnailByProductId = (state, productId) => {
  const images = selectImagesByProductId(state, productId)
  if (!Array.isArray(images) || images.length === 0) return null
  
  // First image (index 0) is always the thumbnail/main image
  return extractThumbnailUrl([images[0]])
}

