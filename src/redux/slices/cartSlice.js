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
        // Adds an item to the cart. If it exists, increases quantity; otherwise, adds it new.
        addItem: (state, action) => {
            const existingItem = state.cart.find((item) => item.id === action.payload.id);
            const quantityToAdd = action.payload.cantidad || 1;

            if (existingItem) {
                // If item is already in cart, just update the quantity
                existingItem.cantidad += quantityToAdd;
            } else {
                // If item is new, push it to the array with the specified quantity
                state.cart.push({ ...action.payload, cantidad: quantityToAdd });
            }

            // Recalculate total price and total item count
            state.total = state.cart.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
            state.itemCount = state.cart.reduce((sum, item) => sum + item.cantidad, 0);
        },
        // Removes an item completely from the cart by its ID.
        removeItem: (state, action) => {
            state.cart = state.cart.filter((item) => item.id !== action.payload);
            // Recalculate totals after removal
            state.total = state.cart.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
            state.itemCount = state.cart.reduce((sum, item) => sum + item.cantidad, 0);
        },
        // Updates the quantity of a specific item.
        updateQuantity: (state, action) => {
            const { id, cantidad } = action.payload;
            const item = state.cart.find((item) => item.id === id);

            if (item) {
                // Ensure quantity doesn't go below 0
                item.cantidad = Math.max(0, cantidad);
            }

            // Remove items that have 0 quantity
            state.cart = state.cart.filter((item) => item.cantidad > 0);

            // Recalculate totals
            state.total = state.cart.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
            state.itemCount = state.cart.reduce((sum, item) => sum + item.cantidad, 0);
        },
        // Resets the cart to its initial empty state.
        clearCart: (state) => {
            state.cart = [];
            state.total = 0;
            state.itemCount = 0;
        },
        setCartOwner: (state, action) => {
            state.ownerUserId = action.payload;
        },
        // Loads a cart from an external source (like local storage or API) replacing current state.
        loadCart: (state, action) => {
            state.cart = action.payload;
            state.total = state.cart.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
            state.itemCount = state.cart.reduce((sum, item) => sum + item.cantidad, 0);
        },
    },
});

export const { addItem, removeItem, updateQuantity, clearCart, loadCart, setCartOwner } = cartSlice.actions;

// Selectors
export const selectCart = (state) => state.cart.cart;
export const selectCartTotal = (state) => state.cart.total;
export const selectCartItemCount = (state) => state.cart.itemCount;
export const selectCartOwnerUserId = (state) => state.cart.ownerUserId;

export default cartSlice.reducer;
