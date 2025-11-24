import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    items: [],
    pending: false,
    error: null,
}

const toastSlice = createSlice({
    name: 'toast',
    initialState,
    reducers: {
        toastEnqueued: (state, action) => {
            state.items.push(action.payload)
        },
        toastDismissed: (state, action) => {
            const id = action.payload
            state.items = state.items.filter((toast) => toast.id !== id)
        },
        allToastsCleared: (state) => {
            state.items = []
        },
    },
})

export const { toastEnqueued, toastDismissed, allToastsCleared } = toastSlice.actions;
export default toastSlice.reducer;