import { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import Breadcrumbs from '../Components/BreadCrumbs';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';
import { useSelector, useDispatch } from 'react-redux';
import { hydrateCart, removeFromCart, updateQuantity, clearCart } from '../redux/cartSlice';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

const Cart = () => {
  const cartItems = useSelector((state) => state.cart.items);
  const dispatch = useDispatch();

  // Shipping info states
  const [shippingName, setShippingName] = useState('');
  const [shippingPhone, setShippingPhone] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [shippingCity, setShippingCity] = useState('');
  const [shippingState, setShippingState] = useState('');
  const [shippingZip, setShippingZip] = useState('');

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [error, setError] = useState("");
  const [loadingPayment, setLoadingPayment] = useState(false);
  const [stockLevels, setStockLevels] = useState({});

  // 1. Load any saved cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        if (parsedCart.items && parsedCart.items.length > 0) {
          dispatch(hydrateCart(parsedCart.items));
        }
      } catch (err) {
        console.error('Error parsing cart from localStorage:', err);
      }
    }
  }, [dispatch]);

  // 2. Fetch stock levels & adjust cart if needed
  useEffect(() => {
    const fetchStockLevels = async () => {
      try {
        const productIds = cartItems.map(item => item.id);
        const promises = productIds.map(id =>
          axios.get(`http://127.0.0.1:8000/api/products/${id}/`)
        );
        const responses = await Promise.all(promises);
        const stocks = {};
        responses.forEach(response => {
          stocks[response.data.id] = response.data.stock;
        });
        setStockLevels(stocks);
        
        cartItems.forEach(item => {
          if (item.quantity > stocks[item.id]) {
            dispatch(updateQuantity({ 
              id: item.id, 
              quantity: stocks[item.id] 
            }));
            toast.warning(
              `Quantity for ${item.title} adjusted to available stock of ${stocks[item.id]}`
            );
          }
        });
      } catch (error) {
        console.error('Error fetching stock levels:', error);
      }
    };

    if (cartItems.length > 0) {
      fetchStockLevels();
    }
  }, [cartItems, dispatch]);

  // 3. Calculate total
  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // 4. Handle quantity update
  const handleUpdateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return;

    const availableStock = stockLevels[id];
    if (availableStock === undefined) {
      toast.error("Unable to verify stock level. Please try again.");
      return;
    }

    if (newQuantity > availableStock) {
      toast.error(`Only ${availableStock} items available in stock`);
      dispatch(updateQuantity({ id, quantity: availableStock }));
      return;
    }

    dispatch(updateQuantity({ id, quantity: newQuantity }));
  };

  // 5. Remove item from cart
  const handleRemoveItem = (id) => {
    dispatch(removeFromCart(id));
  };

  // 6. Purchase button
  const handlePurchase = () => {
    // Validate stock levels again
    const stockValidation = cartItems.every(item => {
      const availableStock = stockLevels[item.id];
      if (item.quantity > availableStock) {
        setError(`Not enough stock for ${item.title}. Available: ${availableStock}`);
        return false;
      }
      return true;
    });
    if (!stockValidation) return;

    // Check payment method
    if (!paymentMethod) {
      setError("Please select a payment method (Khalti or Cash on Delivery)");
      return;
    }

    // Basic shipping validation (optional checks)
    if (!shippingName || !shippingPhone || !shippingAddress) {
      setError("Please fill out all required shipping fields (name, phone, address).");
      return;
    }

    setShowConfirmDialog(true);
  };

  // 7. Final confirm
  const handleConfirmOrder = async () => {
    setLoadingPayment(true);
    setError("");

    try {
      // Final stock check before confirming
      const stockChecks = await Promise.all(
        cartItems.map(item =>
          axios.get(`http://127.0.0.1:8000/api/products/${item.id}/`)
        )
      );

      const stockValidation = cartItems.every((item, index) => {
        const currentStock = stockChecks[index].data.stock;
        return item.quantity <= currentStock;
      });

      if (!stockValidation) {
        setError("Some items are no longer available in the requested quantity");
        setLoadingPayment(false);
        setShowConfirmDialog(false);
        return;
      }

      // 7a. Prepare request to your backend
      const token = localStorage.getItem("token");
      const payload = {
        payment_method: paymentMethod,

        // Include shipping fields
        shipping_name: shippingName,
        shipping_phone: shippingPhone,
        shipping_address: shippingAddress,
        shipping_city: shippingCity,
        shipping_state: shippingState,
        shipping_zip: shippingZip,

        items: cartItems.map(item => ({
          product: item.id,
          quantity: item.quantity,
        })),
      };

      const response = await axios.post(
        "http://127.0.0.1:8000/api/initiate-payment/",
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        }
      );

      // 7b. If user selected Khalti
      if (paymentMethod === 'Khalti') {
        if (response.data.payment_url) {
          window.location.href = response.data.payment_url; // Redirect to Khalti
        } else {
          // Fallback in case the URL isn't provided
          setError("Failed to retrieve Khalti payment URL. Please try again.");
        }
      } else {
        // 7c. If user selected COD, we can finalize immediately
        toast.success("Order placed successfully with Cash on Delivery!");
        dispatch(clearCart());
        setShowConfirmDialog(false);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to process order. Please try again.");
    } finally {
      setLoadingPayment(false);
    }
  };

  // Helper for product images (if stored on Django side)
  const getImageUrl = (imageUrl) => {
    if (imageUrl?.startsWith('http')) {
      return imageUrl;
    }
    return `http://127.0.0.1:8000${imageUrl}`;
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-[#004d40] to-[#00695c] pt-16">
        <Breadcrumbs
          items={[
            { label: "Home", path: "/" },
            { label: "Cart", path: "/mycart" },
          ]}
        />
        <div className="text-center">
          <h2 className="text-[#55DD4A] text-6xl">Purchase Products</h2>
          <h1 className="uppercase mt-9 text-xl text-[#ADE1B0]">
            Products you want for your animals.
          </h1>
          <hr className="mt-5 mb-4 border-[#ADE1B0]" />
        </div>

        <div className="container mx-auto text-center px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Left Section: Cart Items */}
            <div className="lg:col-span-2">
              <div className="text-white text-lg mb-4">
                <span>Items in Cart: {cartItems.length}</span>
              </div>

              {cartItems.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-8 text-center">
                  <p className="text-gray-500 text-lg">Your cart is empty</p>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div key={item.id} className="bg-white rounded-lg shadow mb-4">
                    <div className="p-4">
                      <div className="flex items-center gap-4">
                        <img
                          src={getImageUrl(item.images)}
                          alt={item.title}
                          className="w-24 h-24 object-cover rounded"
                        />
                        <div className="flex-1 text-left">
                          <p>{item.description}</p>
                          <h3 className="font-bold text-lg text-gray-800">{item.title}</h3>
                          <p className="text-gray-600">Rs. {item.price}</p>

                          {/* Quantity Controls */}
                          <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center border rounded">
                              <button
                                onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                className="px-3 py-1 border-r hover:bg-gray-100"
                              >
                                -
                              </button>
                              <span className="px-4 py-1">{item.quantity}</span>
                              <button
                                onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                className="px-3 py-1 border-l hover:bg-gray-100"
                              >
                                +
                              </button>
                            </div>
                            <button
                              onClick={() => handleRemoveItem(item.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 size={20} />
                            </button>
                          </div>

                          {/* Stock info */}
                          <p className="text-sm text-gray-500 mt-2">
                            Available Stock: {stockLevels[item.id] ?? 'Loading...'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">
                            Rs. {item.price * item.quantity}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Right Section: Order Summary + Shipping Form */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow p-6 sticky top-4">
                <h2 className="text-xl font-bold mb-4">Order Summary</h2>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>Rs. {calculateTotal()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery</span>
                    <span>Rs. 100</span>
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>Rs. {calculateTotal() + 100}</span>
                    </div>
                  </div>
                </div>

                {/* Shipping Form */}
                <div className="mt-6 space-y-4">
                  <h3 className="font-medium text-gray-700">Shipping Info</h3>
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={shippingName}
                    onChange={(e) => setShippingName(e.target.value)}
                    className="w-full px-4 py-2 border rounded"
                  />
                  <input
                    type="text"
                    placeholder="Phone"
                    value={shippingPhone}
                    onChange={(e) => setShippingPhone(e.target.value)}
                    className="w-full px-4 py-2 border rounded"
                  />
                  <textarea
                    rows="2"
                    placeholder="Address"
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    className="w-full px-4 py-2 border rounded"
                  />
                  <input
                    type="text"
                    placeholder="City"
                    value={shippingCity}
                    onChange={(e) => setShippingCity(e.target.value)}
                    className="w-full px-4 py-2 border rounded"
                  />
                  <input
                    type="text"
                    placeholder="State"
                    value={shippingState}
                    onChange={(e) => setShippingState(e.target.value)}
                    className="w-full px-4 py-2 border rounded"
                  />
                  <input
                    type="text"
                    placeholder="ZIP / Postal Code"
                    value={shippingZip}
                    onChange={(e) => setShippingZip(e.target.value)}
                    className="w-full px-4 py-2 border rounded"
                  />

                  {/* Payment Method Selection */}
                  <h3 className="font-medium text-gray-700">Payment Method</h3>

                  {/* Khalti Option */}
                  <label
                    className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors
                      ${paymentMethod === 'Khalti' 
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                      }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="Khalti"
                      checked={paymentMethod === 'Khalti'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="ml-3">
                      <span className="block text-sm font-medium text-gray-700">
                        Pay with Khalti
                      </span>
                      <span className="block text-sm text-gray-500">
                        Secure online payment
                      </span>
                    </div>
                  </label>

                  {/* Cash on Delivery Option */}
                  <label
                    className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors
                      ${paymentMethod === 'Cash on Delivery'
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-green-300'
                      }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="Cash on Delivery"
                      checked={paymentMethod === 'Cash on Delivery'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="h-4 w-4 text-green-600 focus:ring-green-500"
                    />
                    <div className="ml-3">
                      <span className="block text-sm font-medium text-gray-700">
                        Cash on Delivery
                      </span>
                      <span className="block text-sm text-gray-500">
                        Pay when received
                      </span>
                    </div>
                  </label>

                  {/* Order Button */}
                  <button
                    onClick={handlePurchase}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium transition-colors
                      disabled:bg-gray-400 disabled:cursor-not-allowed"
                    disabled={cartItems.length === 0 || !paymentMethod}
                  >
                    {paymentMethod === 'Khalti'
                      ? 'Proceed to Khalti Payment'
                      : 'Confirm Order'
                    }
                  </button>

                  {/* Error message display */}
                  {error && (
                    <p className="text-red-500 text-sm text-center mt-2">
                      {error}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Confirm Order Dialog */}
          {showConfirmDialog && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg max-w-md w-full p-6">
                {!loadingPayment ? (
                  <>
                    <div className="mb-4">
                      <h2 className="text-xl font-bold">Confirm Your Order</h2>
                      <p className="text-gray-600">
                        Please review your order details before confirming.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="border-t border-b py-3">
                        <div className="space-y-2">
                          {cartItems.map((item) => (
                            <div
                              key={item.id}
                              className="flex justify-between text-sm"
                            >
                              <span>
                                {item.title} x {item.quantity}
                              </span>
                              <span>
                                Rs. {item.price * item.quantity}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-between font-bold">
                        <span>Total Amount</span>
                        <span>Rs. {calculateTotal() + 100}</span>
                      </div>

                      <div className="text-gray-600">
                        Payment Method: {paymentMethod}
                      </div>

                      {/* Optionally display shipping details in the confirmation */}
                      <div className="text-gray-600">
                        <p>Shipping Name: {shippingName}</p>
                        <p>Phone: {shippingPhone}</p>
                        <p>Address: {shippingAddress}, {shippingCity}, {shippingState} {shippingZip}</p>
                      </div>

                      <div className="flex justify-end gap-3 mt-4">
                        <button
                          onClick={() => setShowConfirmDialog(false)}
                          className="px-4 py-2 border rounded-lg hover:bg-gray-100"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleConfirmOrder}
                          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                        >
                          Confirm Order
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-center">Processing Payment...</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Cart;
