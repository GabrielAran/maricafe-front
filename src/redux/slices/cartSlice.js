import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    cart: [],
    total: 0,
    itemCount: 0,
    ownerUserId: null,
};

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        addItem: (state, action) => {
            const existingItem = state.cart.find((item) => item.id === action.payload.id);
            const quantityToAdd = action.payload.cantidad || 1;

            if (existingItem) {
                existingItem.cantidad += quantityToAdd;
            } else {
                state.cart.push({ ...action.payload, cantidad: quantityToAdd });
            }

            state.total = state.cart.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
            state.itemCount = state.cart.reduce((sum, item) => sum + item.cantidad, 0);
        },
        removeItem: (state, action) => {
            state.cart = state.cart.filter((item) => item.id !== action.payload);
            state.total = state.cart.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
            state.itemCount = state.cart.reduce((sum, item) => sum + item.cantidad, 0);
        },
        updateQuantity: (state, action) => {
            const { id, cantidad } = action.payload;
            const item = state.cart.find((item) => item.id === id);

            if (item) {
                item.cantidad = Math.max(0, cantidad);
            }

            state.cart = state.cart.filter((item) => item.cantidad > 0);

            state.total = state.cart.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
            state.itemCount = state.cart.reduce((sum, item) => sum + item.cantidad, 0);
        },
        clearCart: (state) => {
            state.cart = [];
            state.total = 0;
            state.itemCount = 0;
        },
        setCartOwner: (state, action) => {
            state.ownerUserId = action.payload;
        },
        loadCart: (state, action) => {
            state.cart = action.payload;
            state.total = state.cart.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
            state.itemCount = state.cart.reduce((sum, item) => sum + item.cantidad, 0);
        },
    },
});

export const { addItem, removeItem, updateQuantity, clearCart, loadCart, setCartOwner } = cartSlice.actions;

export const selectCart = (state) => state.cart.cart;
export const selectCartTotal = (state) => state.cart.total;
export const selectCartItemCount = (state) => state.cart.itemCount;
export const selectCartOwnerUserId = (state) => state.cart.ownerUserId;

export default cartSlice.reducer;
