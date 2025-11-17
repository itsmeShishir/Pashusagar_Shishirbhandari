// src/redux/cartSlice.js
import { createSlice } from '@reduxjs/toolkit';

const loadCartState = () => {
  try {
    const serializedCart = localStorage.getItem('cart');
    if (serializedCart === null) {
      return { items: [] };
    }
    return JSON.parse(serializedCart);
  } catch (err) {
    console.error('Error loading cart from localStorage:', err);
    return { items: [] };
  }
};

const initialState = loadCartState();

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const { id, name, price, description, quantity = 1, images } = action.payload;
      const existingItem = state.items.find(item => item.id === id);
      
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.items.push({
          id,
          name,
          price,
          description,
          quantity,
          images
        });
      }
    },
    removeFromCart: (state, action) => {
      state.items = state.items.filter(item => item.id !== action.payload);
    },
    updateQuantity: (state, action) => {
      const { id, quantity } = action.payload;
      const item = state.items.find(item => item.id === id);
      if (item) {
        item.quantity = quantity;
      }
    },
    clearCart: (state) => {
      state.items = [];
      // Also clear from localStorage
      localStorage.removeItem('cart');
    },

    hydrateCart: (state, action) => {
      state.items = action.payload;
    }
  }
});

// Middleware to save cart to localStorage
export const saveCartToLocalStorage = (store) => (next) => (action) => {
  const result = next(action);
  
  // Save cart state to localStorage after any cart action
  if (action.type.startsWith('cart/')) {
    const cartState = store.getState().cart;
    try {
      localStorage.setItem('cart', JSON.stringify(cartState));
    } catch (err) {
      console.error('Error saving cart to localStorage:', err);
    }
  }
  
  return result;
};

export const { addToCart, removeFromCart, updateQuantity, clearCart, hydrateCart } = cartSlice.actions;
export default cartSlice.reducer;