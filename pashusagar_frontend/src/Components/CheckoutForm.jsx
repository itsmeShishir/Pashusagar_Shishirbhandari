import React, { useState } from 'react';
import { CreditCard, Truck, AlertCircle, CheckCircle } from 'lucide-react';

const CheckoutForm = ({
    cartItems,
    onSubmit,
    loading = false,
    error = null
}) => {
    const [formData, setFormData] = useState({
        shipping_name: '',
        shipping_phone: '',
        shipping_address: '',
        shipping_city: '',
        shipping_state: '',
        shipping_zip: '',
        payment_method: ''
    });

    const [formErrors, setFormErrors] = useState({});

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error when user starts typing
        if (formErrors[name]) {
            setFormErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const errors = {};

        if (!formData.shipping_name.trim()) {
            errors.shipping_name = 'Full name is required';
        }

        if (!formData.shipping_phone.trim()) {
            errors.shipping_phone = 'Phone number is required';
        } else if (!/^[0-9]{10}$/.test(formData.shipping_phone.replace(/\D/g, ''))) {
            errors.shipping_phone = 'Please enter a valid 10-digit phone number';
        }

        if (!formData.shipping_address.trim()) {
            errors.shipping_address = 'Address is required';
        }

        if (!formData.shipping_city.trim()) {
            errors.shipping_city = 'City is required';
        }

        if (!formData.payment_method) {
            errors.payment_method = 'Please select a payment method';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (validateForm()) {
            onSubmit(formData);
        }
    };

    const calculateTotal = () => {
        const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
        const delivery = 100;
        return { subtotal, delivery, total: subtotal + delivery };
    };

    const { subtotal, delivery, total } = calculateTotal();

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h2>

            {/* Order Summary */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-3">Order Summary</h3>
                <div className="space-y-2 text-sm">
                    {cartItems.map((item) => (
                        <div key={item.id} className="flex justify-between">
                            <span>{item.name} × {item.quantity}</span>
                            <span>Rs. {item.price * item.quantity}</span>
                        </div>
                    ))}
                    <div className="border-t pt-2 mt-2">
                        <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span>Rs. {subtotal}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Delivery</span>
                            <span>Rs. {delivery}</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg">
                            <span>Total</span>
                            <span>Rs. {total}</span>
                        </div>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Shipping Information */}
                <div>
                    <h3 className="flex items-center text-lg font-semibold text-gray-900 mb-4">
                        <Truck className="mr-2" size={20} />
                        Shipping Information
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Full Name *
                            </label>
                            <input
                                type="text"
                                name="shipping_name"
                                value={formData.shipping_name}
                                onChange={handleInputChange}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${formErrors.shipping_name ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                placeholder="Enter your full name"
                            />
                            {formErrors.shipping_name && (
                                <p className="text-red-500 text-sm mt-1">{formErrors.shipping_name}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Phone Number *
                            </label>
                            <input
                                type="tel"
                                name="shipping_phone"
                                value={formData.shipping_phone}
                                onChange={handleInputChange}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${formErrors.shipping_phone ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                placeholder="9800000000"
                            />
                            {formErrors.shipping_phone && (
                                <p className="text-red-500 text-sm mt-1">{formErrors.shipping_phone}</p>
                            )}
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Address *
                            </label>
                            <textarea
                                name="shipping_address"
                                value={formData.shipping_address}
                                onChange={handleInputChange}
                                rows="3"
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${formErrors.shipping_address ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                placeholder="Enter your complete address"
                            />
                            {formErrors.shipping_address && (
                                <p className="text-red-500 text-sm mt-1">{formErrors.shipping_address}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                City *
                            </label>
                            <input
                                type="text"
                                name="shipping_city"
                                value={formData.shipping_city}
                                onChange={handleInputChange}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${formErrors.shipping_city ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                placeholder="Enter city"
                            />
                            {formErrors.shipping_city && (
                                <p className="text-red-500 text-sm mt-1">{formErrors.shipping_city}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                State
                            </label>
                            <input
                                type="text"
                                name="shipping_state"
                                value={formData.shipping_state}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Enter state"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                ZIP Code
                            </label>
                            <input
                                type="text"
                                name="shipping_zip"
                                value={formData.shipping_zip}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Enter ZIP code"
                            />
                        </div>
                    </div>
                </div>

                {/* Payment Method */}
                <div>
                    <h3 className="flex items-center text-lg font-semibold text-gray-900 mb-4">
                        <CreditCard className="mr-2" size={20} />
                        Payment Method
                    </h3>

                    <div className="space-y-3">
                        {/* Khalti Option */}
                        <label
                            className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${formData.payment_method === 'Khalti'
                                    ? 'border-purple-500 bg-purple-50'
                                    : 'border-gray-200 hover:border-purple-300'
                                }`}
                        >
                            <input
                                type="radio"
                                name="payment_method"
                                value="Khalti"
                                checked={formData.payment_method === 'Khalti'}
                                onChange={handleInputChange}
                                className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                            />
                            <div className="ml-3 flex-1">
                                <div className="flex items-center">
                                    <span className="block text-sm font-medium text-gray-700">
                                        Pay with Khalti
                                    </span>
                                    <img
                                        src="https://khalti.s3.ap-south-1.amazonaws.com/website/khalti-logo.png"
                                        alt="Khalti"
                                        className="ml-2 h-6"
                                    />
                                </div>
                                <span className="block text-sm text-gray-500">
                                    Secure online payment with digital wallet
                                </span>
                            </div>
                            {formData.payment_method === 'Khalti' && (
                                <CheckCircle className="text-purple-500" size={20} />
                            )}
                        </label>

                        {/* Cash on Delivery Option */}
                        <label
                            className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${formData.payment_method === 'Cash on Delivery'
                                    ? 'border-green-500 bg-green-50'
                                    : 'border-gray-200 hover:border-green-300'
                                }`}
                        >
                            <input
                                type="radio"
                                name="payment_method"
                                value="Cash on Delivery"
                                checked={formData.payment_method === 'Cash on Delivery'}
                                onChange={handleInputChange}
                                className="h-4 w-4 text-green-600 focus:ring-green-500"
                            />
                            <div className="ml-3 flex-1">
                                <span className="block text-sm font-medium text-gray-700">
                                    Cash on Delivery
                                </span>
                                <span className="block text-sm text-gray-500">
                                    Pay when your order is delivered
                                </span>
                            </div>
                            {formData.payment_method === 'Cash on Delivery' && (
                                <CheckCircle className="text-green-500" size={20} />
                            )}
                        </label>
                    </div>

                    {formErrors.payment_method && (
                        <p className="text-red-500 text-sm mt-2">{formErrors.payment_method}</p>
                    )}
                </div>

                {/* Error Display */}
                {error && (
                    <div className="flex items-center p-4 bg-red-50 border border-red-200 rounded-lg">
                        <AlertCircle className="text-red-500 mr-2" size={20} />
                        <span className="text-red-700 text-sm">{error}</span>
                    </div>
                )}

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={loading || cartItems.length === 0}
                    className={`w-full py-3 px-6 rounded-lg font-medium transition-all duration-200 ${loading || cartItems.length === 0
                            ? 'bg-gray-400 cursor-not-allowed'
                            : formData.payment_method === 'Khalti'
                                ? 'bg-purple-600 hover:bg-purple-700 text-white'
                                : 'bg-green-600 hover:bg-green-700 text-white'
                        }`}
                >
                    {loading ? (
                        <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                            Processing...
                        </div>
                    ) : (
                        <>
                            {formData.payment_method === 'Khalti'
                                ? `Pay Rs. ${total} with Khalti`
                                : `Place Order - Rs. ${total}`
                            }
                        </>
                    )}
                </button>
            </form>
        </div>
    );
};

export default CheckoutForm;