import React, { useState, useEffect } from "react";
import api from "../utils/api";
import { Package, Calendar, User, Filter, RefreshCw } from "lucide-react";

const OrderHistory = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [filters, setFilters] = useState({
        status: "",
        payment_method: "",
    });
    const [totalOrders, setTotalOrders] = useState(0);

    useEffect(() => {
        fetchOrders();
    }, [filters]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await api.get("/api/admin/orders/", {
                params: {
                    status: filters.status || undefined,
                    payment_method: filters.payment_method || undefined,
                },
            });

            setOrders(response.data.orders);
            setTotalOrders(response.data.total_orders);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching orders:", err);
            if (err.response?.status === 401) {
                setError("Please log in as an admin to view orders.");
            } else if (err.response?.status === 403) {
                setError("You do not have permission to view orders.");
            } else {
                setError(err.message);
            }
            setLoading(false);
        }
    };

    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            await api.patch("/api/admin/orders/", {
                order_id: orderId,
                status: newStatus,
            });

            fetchOrders();
            alert(`Order ${orderId} status updated to ${newStatus}`);
        } catch (err) {
            console.error("Error updating order status:", err);
            const message =
                err.response?.data?.error ||
                err.response?.data?.detail ||
                "Failed to update order status";
            alert(message);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "Completed":
                return "bg-green-100 text-green-800";
            case "Pending":
                return "bg-yellow-100 text-yellow-800";
            case "Failed":
                return "bg-red-100 text-red-800";
            case "Refunded":
                return "bg-blue-100 text-blue-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const getPaymentMethodColor = (method) => {
        switch (method) {
            case "Khalti":
                return "bg-purple-100 text-purple-800";
            case "Cash on Delivery":
                return "bg-orange-100 text-orange-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const calculateOrderTotal = (items) => {
        return items.reduce((total, item) => {
            return total + (item.product_details?.price || 0) * item.quantity;
        }, 0);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#004d40]"></div>
            </div>
        );
    }

    if (error) {
        return <div className="text-red-500 text-center text-xl mt-10">{error}</div>;
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Order History</h2>
                <div className="flex items-center space-x-2">
                    <Package className="h-5 w-5 text-[#004d40]" />
                    <span className="text-sm text-gray-600">Total Orders: {totalOrders}</span>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow-md mb-6">
                <div className="flex items-center space-x-4">
                    <Filter className="h-5 w-5 text-gray-500" />
                    <div className="flex space-x-4">
                        <select
                            value={filters.status}
                            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                        >
                            <option value="">All Status</option>
                            <option value="Pending">Pending</option>
                            <option value="Completed">Completed</option>
                            <option value="Failed">Failed</option>
                            <option value="Refunded">Refunded</option>
                        </select>

                        <select
                            value={filters.payment_method}
                            onChange={(e) => setFilters({ ...filters, payment_method: e.target.value })}
                            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                        >
                            <option value="">All Payment Methods</option>
                            <option value="Khalti">Khalti</option>
                            <option value="Cash on Delivery">Cash on Delivery</option>
                        </select>

                        <button
                            onClick={fetchOrders}
                            className="flex items-center space-x-2 bg-[#004d40] text-white px-4 py-2 rounded-md hover:bg-[#00695c] transition-colors"
                        >
                            <RefreshCw className="h-4 w-4" />
                            <span>Refresh</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Orders List */}
            <div className="space-y-4">
                {orders.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>No orders found</p>
                    </div>
                ) : (
                    orders.map((order) => (
                        <div key={order.id} className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800">Order #{order.id}</h3>
                                    <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
                                        <Calendar className="h-4 w-4" />
                                        <span>{new Date(order.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.payment_status)}`}>
                                        {order.payment_status}
                                    </span>
                                    {order.payment_method && (
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPaymentMethodColor(order.payment_method)}`}>
                                            {order.payment_method}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Customer */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div className="flex items-center space-x-2">
                                    <User className="h-4 w-4 text-gray-500" />
                                    <span className="text-sm text-gray-600">
                                        Customer: {order.user}
                                    </span>
                                </div>
                            </div>

                            {/* Order Items */}
                            <div className="mb-4">
                                <h4 className="text-sm font-medium text-gray-700 mb-2">Items:</h4>

                                {order.items.length === 0 ? (
                                    <p className="text-sm text-gray-500">No items</p>
                                ) : (
                                    <div className="space-y-2">
                                        {order.items.map((item, index) => (
                                            <div key={index} className="flex justify-between items-center text-sm">
                                                <span>{item.product_details?.title ?? "Unknown Product"} x {item.quantity}</span>
                                                <span className="font-medium">
                                                    ₹{((item.product_details?.price || 0) * item.quantity).toFixed(2)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="border-t pt-2 mt-2">
                                    <div className="flex justify-between items-center font-semibold">
                                        <span>Total:</span>
                                        <span>₹{calculateOrderTotal(order.items).toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Admin Actions */}
                            <div className="flex space-x-2">
                                <select
                                    onChange={(e) => {
                                        if (e.target.value && e.target.value !== order.payment_status) {
                                            updateOrderStatus(order.id, e.target.value);
                                        }
                                    }}
                                    className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                                    defaultValue=""
                                >
                                    <option value="">Update Status</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Completed">Completed</option>
                                    <option value="Failed">Failed</option>
                                    <option value="Refunded">Refundeds</option>
                                </select>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default OrderHistory;
