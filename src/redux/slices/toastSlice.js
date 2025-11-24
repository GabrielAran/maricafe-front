import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    toasts: [],
    pending: false,
    error: null,
}

const toastSlice = createSlice({
    name: 'toast',
    initialState,
    reducers: {
        toastEnqueued: (state, action) => {
            state.toasts.push(action.payload)
        },
        toastDismissed: (state, action) => {
            const id = action.payload
            state.toasts = state.toasts.filter((toast) => toast.id !== id)
        },
        allToastsCleared: (state) => {
            state.toasts = []
        },
    },
})

export const { toastEnqueued, toastDismissed, allToastsCleared } = toastSlice.actions;
export default toastSlice.reducer;