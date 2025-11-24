import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { api } from '../api/axiosInstance'
import { buildAuthHeaders } from './user.slice'

// GET /products/attributes/category/{categoryId}
export const fetchAttributesByCategory = createAsyncThunk(
  'attributes/fetchAttributesByCategory',
  async (categoryId, { getState }) => {
    const response = await api.get(`/products/attributes/category/${categoryId}`, {
      headers: buildAuthHeaders(getState()),
    })
    return response.data
  }
)

// GET /products/attributes/all
export const fetchAllAttributes = createAsyncThunk(
  'attributes/fetchAllAttributes',
  async (_, { getState }) => {
    const response = await api.get('/products/attributes/all', {
      headers: buildAuthHeaders(getState()),
    })
    return response.data
  }
)

// GET /products/{productId}/attributes
export const fetchProductAttributes = createAsyncThunk(
  'attributes/fetchProductAttributes',
  async (productId, { getState }) => {
    const response = await api.get(`/products/${productId}/attributes`, {
      headers: buildAuthHeaders(getState()),
    })
    return response.data
  }
)

// POST /products/attributes
export const createAttribute = createAsyncThunk(
  'attributes/createAttribute',
  async (payload, { getState }) => {
    const response = await api.post('/products/attributes', payload, {
      headers: buildAuthHeaders(getState(), true),
    })
    return response.data
  }
)

// POST /products/{productId}/attributes/{attributeId}
export const setProductAttributeValue = createAsyncThunk(
  'attributes/setProductAttributeValue',
  async ({ productId, attributeId, value }, { getState }) => {
    const response = await api.post(`/products/${productId}/attributes/${attributeId}`, value, {
      headers: {
        ...buildAuthHeaders(getState(), true),
        'Content-Type': 'application/json',
      },
    })
    return response.data
  }
)

// DELETE /products/{productId}/attributes/{attributeId}
export const deleteProductAttributeValue = createAsyncThunk(
  'attributes/deleteProductAttributeValue',
  async ({ productId, attributeId }, { getState }) => {
    const response = await api.delete(`/products/${productId}/attributes/${attributeId}`, {
      headers: buildAuthHeaders(getState()),
    })
    return response.data
  }
)

const initialState = {
  attributes: [],
  productAttributes: {}, // key: productId, value: array of attribute values
  pending: false,
  error: null,
}

const attributeSlice = createSlice({
  name: 'attributes',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Fetch attributes by category
    builder
      .addCase(fetchAttributesByCategory.pending, (state) => {
        state.pending = true
        state.error = null
      })
      .addCase(fetchAttributesByCategory.fulfilled, (state, action) => {
        state.pending = false
        state.attributes = Array.isArray(action.payload) ? action.payload : []
      })
      .addCase(fetchAttributesByCategory.rejected, (state, action) => {
        state.pending = false
        state.error = action.error.message || null
      })

    // Fetch all attributes
    builder
      .addCase(fetchAllAttributes.pending, (state) => {
        state.pending = true
        state.error = null
      })
      .addCase(fetchAllAttributes.fulfilled, (state, action) => {
        state.pending = false
        state.attributes = Array.isArray(action.payload) ? action.payload : []
      })
      .addCase(fetchAllAttributes.rejected, (state, action) => {
        state.pending = false
        state.error = action.error.message || null
      })

    // Fetch product attributes
    builder
      .addCase(fetchProductAttributes.pending, (state) => {
        state.pending = true
        state.error = null
      })
      .addCase(fetchProductAttributes.fulfilled, (state, action) => {
        state.pending = false
        const productId = action.meta.arg
        state.productAttributes[productId] = Array.isArray(action.payload) ? action.payload : []
      })
      .addCase(fetchProductAttributes.rejected, (state, action) => {
        state.pending = false
        state.error = action.error.message || null
      })

    // Create attribute
    builder
      .addCase(createAttribute.pending, (state) => {
        state.pending = true
        state.error = null
      })
      .addCase(createAttribute.fulfilled, (state, action) => {
        state.pending = false
        const apiResponse = action.payload
        if (apiResponse && apiResponse.data) {
          state.attributes.push(apiResponse.data)
        }
      })
      .addCase(createAttribute.rejected, (state, action) => {
        state.pending = false
        state.error = action.error.message || null
      })

    // Set product attribute value
    builder
      .addCase(setProductAttributeValue.pending, (state) => {
        state.pending = true
        state.error = null
      })
      .addCase(setProductAttributeValue.fulfilled, (state, action) => {
        state.pending = false
        const { productId } = action.meta.arg
        const apiResponse = action.payload
        if (apiResponse && apiResponse.data) {
          if (!state.productAttributes[productId]) {
            state.productAttributes[productId] = []
          }
          const attributeValue = apiResponse.data
          const index = state.productAttributes[productId].findIndex(
            (av) => av.attributeId === attributeValue.attributeId
          )
          if (index !== -1) {
            state.productAttributes[productId][index] = attributeValue
          } else {
            state.productAttributes[productId].push(attributeValue)
          }
        }
      })
      .addCase(setProductAttributeValue.rejected, (state, action) => {
        state.pending = false
        state.error = action.error.message || null
      })

    // Delete product attribute value
    builder
      .addCase(deleteProductAttributeValue.pending, (state) => {
        state.pending = true
        state.error = null
      })
      .addCase(deleteProductAttributeValue.fulfilled, (state, action) => {
        state.pending = false
        const { productId, attributeId } = action.meta.arg
        if (state.productAttributes[productId]) {
          state.productAttributes[productId] = state.productAttributes[productId].filter(
            (av) => av.attributeId !== attributeId
          )
        }
      })
      .addCase(deleteProductAttributeValue.rejected, (state, action) => {
        state.pending = false
        state.error = action.error.message || null
      })
  },
})

export default attributeSlice.reducer

