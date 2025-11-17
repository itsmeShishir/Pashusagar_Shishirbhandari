import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, AlertTriangle, Home, Package } from 'lucide-react';
import { toast } from 'react-toastify';

const PaymentStatus = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('loading');
    const [message, setMessage] = useState('');
    const [orderId, setOrderId] = useState(null);

    useEffect(() => {
        const error = searchParams.get('error');
        const orderIdParam = searchParams.get('order_id');
        const statusParam = searchParams.get('status');
        const paymentStatus = searchParams.get('payment_status');
        const paymentMethod = searchParams.get('payment_method');

        setOrderId(orderIdParam);

        if (error) {
            handleError(error, orderIdParam);
        } else if (statusParam === 'success' || paymentStatus === 'completed') {
            setStatus('success');
            setMessage('Your payment was successful!');
            toast.success('Payment completed successfully!');
        } else if (paymentMethod === 'cod') {
            setStatus('success');
            setMessage('Your order has been placed successfully!');
            toast.success('Order placed with Cash on Delivery!');
        } else {
            setStatus('unknown');
            setMessage('Payment status unknown. Please contact support if you have any concerns.');
        }
    }, [searchParams]);

    const handleError = (error, orderIdParam) => {
        switch (error) {
            case 'no_pidx':
                setStatus('error');
                setMessage('Payment verification failed. No payment ID found.');
                break;
            case 'order_not_found':
                setStatus('error');
                setMessage('Order not found. Please contact support.');
                break;
            case 'payment_pending':
                setStatus('pending');
                setMessage('Your payment is still being processed. Please wait a moment.');
                break;
            case 'payment_canceled':
                setStatus('canceled');
                setMessage('Payment was canceled. You can try again or choose a different payment method.');
                break;
            case 'payment_failed':
                setStatus('error');
                setMessage('Payment failed. Please try again or contact support.');
                break;
            case 'verification_failed':
                setStatus('error');
                setMessage('Payment verification failed. Please contact support.');
                break;
            case 'verification_timeout':
                setStatus('error');
                setMessage('Payment verification timed out. Please contact support to confirm your payment status.');
                break;
            case 'verification_error':
                setStatus('error');
                setMessage('An error occurred during payment verification. Please contact support.');
                break;
            default:
                setStatus('error');
                setMessage('An unknown error occurred. Please contact support.');
        }
    };

    const getStatusIcon = () => {
        switch (status) {
            case 'success':
                return <CheckCircle className="text-green-500" size={64} />;
            case 'error':
                return <XCircle className="text-red-500" size={64} />;
            case 'pending':
                return <Clock className="text-yellow-500" size={64} />;
            case 'canceled':
                return <AlertTriangle className="text-orange-500" size={64} />;
            default:
                return <AlertTriangle className="text-gray-500" size={64} />;
        }
    };

    const getStatusColor = () => {
        switch (status) {
            case 'success':
                return 'text-green-600';
            case 'error':
                return 'text-red-600';
            case 'pending':
                return 'text-yellow-600';
            case 'canceled':
                return 'text-orange-600';
            default:
                return 'text-gray-600';
        }
    };

    const getStatusTitle = () => {
        switch (status) {
            case 'success':
                return 'Payment Successful!';
            case 'error':
                return 'Payment Failed';
            case 'pending':
                return 'Payment Pending';
            case 'canceled':
                return 'Payment Canceled';
            default:
                return 'Payment Status Unknown';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#004D40] to-[#00695C] flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
                {/* Status Icon */}
                <div className="mb-6">
                    {getStatusIcon()}
                </div>

                {/* Status Title */}
                <h1 className={`text-2xl md:text-3xl font-bold mb-4 ${getStatusColor()}`}>
                    {getStatusTitle()}
                </h1>

                {/* Status Message */}
                <p className="text-gray-700 mb-6 leading-relaxed">
                    {message}
                </p>

                {/* Order ID Display */}
                {orderId && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                        <p className="text-sm text-gray-600">
                            <strong>Order ID:</strong> {orderId}
                        </p>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-3">
                    {status === 'success' && (
                        <>
                            <button
                                onClick={() => navigate('/history')}
                                className="w-full flex items-center justify-center px-6 py-3 bg-[#55DD4A] text-white rounded-lg font-medium 
                  hover:bg-[#004D40] transition-all duration-300 transform hover:-translate-y-1
                  focus:outline-none focus:ring-2 focus:ring-[#55DD4A] focus:ring-opacity-50"
                            >
                                <Package size={20} className="mr-2" />
                                View My Orders
                            </button>

                            <button
                                onClick={() => navigate('/')}
                                className="w-full flex items-center justify-center px-6 py-3 border-2 border-[#55DD4A] text-[#004D40] rounded-lg font-medium 
                  hover:bg-[#55DD4A] hover:text-white transition-all duration-300 transform hover:-translate-y-1
                  focus:outline-none focus:ring-2 focus:ring-[#55DD4A] focus:ring-opacity-50"
                            >
                                <Home size={20} className="mr-2" />
                                Continue Shopping
                            </button>
                        </>
                    )}

                    {(status === 'error' || status === 'canceled') && (
                        <>
                            <button
                                onClick={() => navigate('/mycart')}
                                className="w-full flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium 
                  hover:bg-blue-700 transition-all duration-300 transform hover:-translate-y-1
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                            >
                                Try Again
                            </button>

                            <button
                                onClick={() => navigate('/')}
                                className="w-full flex items-center justify-center px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium 
                  hover:bg-gray-50 transition-all duration-300 transform hover:-translate-y-1
                  focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-opacity-50"
                            >
                                <Home size={20} className="mr-2" />
                                Go to Home
                            </button>
                        </>
                    )}

                    {status === 'pending' && (
                        <>
                            <button
                                onClick={() => window.location.reload()}
                                className="w-full flex items-center justify-center px-6 py-3 bg-yellow-600 text-white rounded-lg font-medium 
                  hover:bg-yellow-700 transition-all duration-300 transform hover:-translate-y-1
                  focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-50"
                            >
                                Refresh Status
                            </button>

                            <button
                                onClick={() => navigate('/')}
                                className="w-full flex items-center justify-center px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium 
                  hover:bg-gray-50 transition-all duration-300 transform hover:-translate-y-1
                  focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-opacity-50"
                            >
                                <Home size={20} className="mr-2" />
                                Go to Home
                            </button>
                        </>
                    )}

                    {status === 'unknown' && (
                        <button
                            onClick={() => navigate('/')}
                            className="w-full flex items-center justify-center px-6 py-3 bg-gray-600 text-white rounded-lg font-medium 
                hover:bg-gray-700 transition-all duration-300 transform hover:-translate-y-1
                focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
                        >
                            <Home size={20} className="mr-2" />
                            Go to Home
                        </button>
                    )}
                </div>

                {/* Support Contact */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                    <p className="text-sm text-gray-500">
                        Need help? Contact our support team at{' '}
                        <a href="mailto:support@pashusagar.com" className="text-[#004D40] hover:underline">
                            support@pashusagar.com
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PaymentStatus;