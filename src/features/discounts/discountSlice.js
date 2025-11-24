import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

const API_BASE_URL = 'http://127.0.0.1:4002'

// Async Thunks
export const createDiscount = createAsyncThunk(
    'discounts/create',
    async ({ productId, discountPercentage, authHeaders }) => {
        const response = await axios.post(
            `${API_BASE_URL}/discounts/${productId}`,
            { discount_percentage: discountPercentage },
            { headers: authHeaders }
        )
        return response.data
    }
)

export const updateDiscount = createAsyncThunk(
    'discounts/update',
    async ({ discountId, discountPercentage, authHeaders }) => {
        const response = await axios.patch(
            `${API_BASE_URL}/discounts/${discountId}`,
            { discount_percentage: discountPercentage },
            { headers: authHeaders }
        )
        return response.data
    }
)

export const deleteDiscount = createAsyncThunk(
    'discounts/delete',
    async ({ discountId, authHeaders }) => {
        await axios.delete(
            `${API_BASE_URL}/discounts/${discountId}`,
            { headers: authHeaders }
        )
        return discountId
    }
)

export const createBulkDiscounts = createAsyncThunk(
    'discounts/createBulk',
    async ({ productIds, discountPercentage, authHeaders }) => {
        const promises = productIds.map(productId =>
            axios.post(
                `${API_BASE_URL}/discounts/${productId}`,
                { discount_percentage: discountPercentage },
                { headers: authHeaders }
            ).then(res => res.data)
        )
        return await Promise.all(promises)
    }
)

export const updateBulkDiscounts = createAsyncThunk(
    'discounts/updateBulk',
    async ({ discountIds, discountPercentage, authHeaders }) => {
        const promises = discountIds.map(discountId =>
            axios.patch(
                `${API_BASE_URL}/discounts/${discountId}`,
                { discount_percentage: discountPercentage },
                { headers: authHeaders }
            ).then(res => res.data)
        )
        return await Promise.all(promises)
    }
)

export const deleteBulkDiscounts = createAsyncThunk(
    'discounts/deleteBulk',
    async ({ discountIds, authHeaders }) => {
        const promises = discountIds.map(discountId =>
            axios.delete(
                `${API_BASE_URL}/discounts/${discountId}`,
                { headers: authHeaders }
            ).then(() => discountId)
        )
        return await Promise.all(promises)
    }
)

const discountSlice = createSlice({
    name: 'discounts',
    initialState: {
        loading: false,
        error: null,
        successMessage: null,
    },
    reducers: {
        clearMessages: (state) => {
            state.error = null
            state.successMessage = null
        },
    },
    extraReducers: (builder) => {
        builder
            // Create
            .addCase(createDiscount.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(createDiscount.fulfilled, (state) => {
                state.loading = false
                state.successMessage = 'Descuento creado exitosamente'
            })
            .addCase(createDiscount.rejected, (state, action) => {
                state.loading = false
                state.error = action.error.message
            })
            // Update
            .addCase(updateDiscount.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(updateDiscount.fulfilled, (state) => {
                state.loading = false
                state.successMessage = 'Descuento actualizado exitosamente'
            })
            .addCase(updateDiscount.rejected, (state, action) => {
                state.loading = false
                state.error = action.error.message
            })
            // Delete
            .addCase(deleteDiscount.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(deleteDiscount.fulfilled, (state) => {
                state.loading = false
                state.successMessage = 'Descuento eliminado exitosamente'
            })
            .addCase(deleteDiscount.rejected, (state, action) => {
                state.loading = false
                state.error = action.error.message
            })
            // Bulk Create
            .addCase(createBulkDiscounts.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(createBulkDiscounts.fulfilled, (state) => {
                state.loading = false
                state.successMessage = 'Descuentos masivos creados exitosamente'
            })
            .addCase(createBulkDiscounts.rejected, (state, action) => {
                state.loading = false
                state.error = action.error.message
            })
            // Bulk Delete
            .addCase(deleteBulkDiscounts.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(deleteBulkDiscounts.fulfilled, (state) => {
                state.loading = false
                state.successMessage = 'Descuentos masivos eliminados exitosamente'
            })
            .addCase(deleteBulkDiscounts.rejected, (state, action) => {
                state.loading = false
                state.error = action.error.message
            })
    },
})

export const { clearMessages } = discountSlice.actions
export default discountSlice.reducer
