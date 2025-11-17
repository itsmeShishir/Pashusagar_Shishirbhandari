import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { clearCart } from '../redux/cartSlice';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';
import { CheckCircle, Home, Package } from 'lucide-react';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order_id');
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Clear cart when payment is successful
  useEffect(() => {
    dispatch(clearCart());
    toast.success('Your cart has been cleared after successful payment!', {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: "colored",
      style: {
        background: "#004D40",
        color: "white",
      },
    });
  }, [dispatch]);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-[#004D40] to-[#00695C] pt-16">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8 text-center">
            {/* Success Icon */}
            <div className="mb-6">
              <CheckCircle className="mx-auto text-green-500" size={80} />
            </div>

            {/* Success Message */}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Payment Successful!
            </h1>

            <div className="mb-6">
              {orderId ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <p className="text-lg text-gray-700 mb-2">
                    Your order has been successfully placed.
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Order ID:</strong> {orderId}
                  </p>
                </div>
              ) : (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <p className="text-lg text-gray-700">
                    Your payment was successful! Your order is being processed.
                  </p>
                </div>
              )}
            </div>

            {/* Additional Info */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-semibold text-gray-900 mb-2">What happens next?</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• You will receive an order confirmation email shortly</li>
                <li>• Your order will be processed and prepared for delivery</li>
                <li>• You can track your order status in your account</li>
                <li>• Our team will contact you if any additional information is needed</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/')}
                className="flex items-center justify-center px-6 py-3 bg-[#55DD4A] text-white rounded-lg font-medium 
                  hover:bg-[#004D40] transition-all duration-300 transform hover:-translate-y-1
                  focus:outline-none focus:ring-2 focus:ring-[#55DD4A] focus:ring-opacity-50"
              >
                <Home size={20} className="mr-2" />
                Go to Home
              </button>

              <button
                onClick={() => navigate('/history')}
                className="flex items-center justify-center px-6 py-3 border-2 border-[#55DD4A] text-[#004D40] rounded-lg font-medium 
                  hover:bg-[#55DD4A] hover:text-white transition-all duration-300 transform hover:-translate-y-1
                  focus:outline-none focus:ring-2 focus:ring-[#55DD4A] focus:ring-opacity-50"
              >
                <Package size={20} className="mr-2" />
                View Orders
              </button>
            </div>

            {/* Thank You Message */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-gray-600">
                Thank you for choosing Pashusagar for your animal care needs!
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
      <ToastContainer />
    </>
  );
};

export default PaymentSuccess;
