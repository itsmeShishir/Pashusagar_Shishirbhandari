import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { clearCart } from '../redux/cartSlice';

const CartDebug = () => {
    const cartItems = useSelector((state) => state.cart.items);
    const dispatch = useDispatch();

    if (process.env.NODE_ENV !== 'development') {
        return null;
    }

    return (
        <div className="fixed bottom-4 right-4 bg-black bg-opacity-75 text-white p-4 rounded-lg text-sm z-50">
            <div className="mb-2">
                <strong>Cart Debug:</strong>
            </div>
            <div>Items: {cartItems.length}</div>
            <div>
                Total: Rs. {cartItems.reduce((total, item) => total + (item.price * item.quantity), 0)}
            </div>
            <button
                onClick={() => dispatch(clearCart())}
                className="mt-2 px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
            >
                Clear Cart (Debug)
            </button>
        </div>
    );
};

export default CartDebug;