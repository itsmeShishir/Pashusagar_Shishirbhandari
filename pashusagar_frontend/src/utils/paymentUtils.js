// Utility functions for payment handling

export const clearCartOnPaymentSuccess = () => {
  // Clear cart from localStorage when payment is successful
  localStorage.removeItem('cart');
};

export const handlePaymentReturn = (searchParams, dispatch, clearCart) => {
  // Check if this is a return from Khalti payment
  const orderId = searchParams.get('order_id');
  const status = searchParams.get('status');
  const paymentStatus = searchParams.get('payment_status');
  
  // If we have indicators of successful payment, clear the cart
  if (orderId || status === 'success' || paymentStatus === 'completed') {
    dispatch(clearCart());
    return true;
  }
  
  return false;
};

export const isPaymentSuccessUrl = (pathname, searchParams) => {
  // Check if current URL indicates payment success
  if (pathname === '/payment-success') {
    return true;
  }
  
  // Check for Khalti success parameters
  const orderId = searchParams.get('order_id');
  const status = searchParams.get('status');
  const paymentStatus = searchParams.get('payment_status');
  
  return !!(orderId || status === 'success' || paymentStatus === 'completed');
};