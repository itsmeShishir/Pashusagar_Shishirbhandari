import React from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { addToCart } from "../redux/cartSlice";
import { toast } from "react-toastify";
import { ShoppingCart, Eye } from "lucide-react";

const ProductCard = ({ product, showAddToCart = true }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleAddToCart = (e) => {
        e.stopPropagation();
        const productToAdd = {
            id: product.id,
            name: product.name || product.title,
            price: product.price,
            description: product.description,
            quantity: 1,
            images: product.image || product.images,
        };
        dispatch(addToCart(productToAdd));

        toast.success(`${product.name || product.title} added to cart!`, {
            position: "top-right",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "colored",
            style: {
                background: "#004D40",
                color: "white",
            },
        });
    };

    const handleProductClick = () => {
        navigate(`/product/${product.id}`);
    };

    const handleViewDetails = (e) => {
        e.stopPropagation();
        navigate(`/product/${product.id}`);
    };

    return (
        <div
            onClick={handleProductClick}
            className="bg-white bg-opacity-95 rounded-xl shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 cursor-pointer group"
        >
            <div className="relative overflow-hidden rounded-t-xl">
                <img
                    src={product.image || product.images || "/placeholder.svg"}
                    alt={product.name || product.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* Category Badge */}
                {product.category_name && (
                    <span className="absolute top-2 left-2 bg-[#55DD4A] text-white px-2 py-1 rounded-full text-xs font-medium">
                        {product.category_name}
                    </span>
                )}

                {/* Stock Badge */}
                {product.stock !== undefined && product.stock <= 5 && product.stock > 0 && (
                    <span className="absolute top-2 right-2 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                        Low Stock
                    </span>
                )}

                {product.stock === 0 && (
                    <span className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                        Out of Stock
                    </span>
                )}

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                    <button
                        onClick={handleViewDetails}
                        className="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 bg-white text-[#004D40] px-4 py-2 rounded-lg font-medium flex items-center space-x-2 hover:bg-[#55DD4A] hover:text-white"
                    >
                        <Eye size={16} />
                        <span>View Details</span>
                    </button>
                </div>
            </div>

            <div className="p-4">
                <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-[#004D40] transition-colors">
                    {product.name || product.title}
                </h3>

                <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                    {product.description}
                </p>

                <div className="flex justify-between items-center mb-4">
                    <span className="text-xl font-bold text-[#004D40]">
                        Rs. {product.price}
                    </span>
                    {product.stock !== undefined && (
                        <span className="text-sm text-gray-500">
                            Stock: {product.stock}
                        </span>
                    )}
                </div>

                {showAddToCart && (
                    <div className="flex space-x-2">
                        <button
                            onClick={handleAddToCart}
                            disabled={product.stock === 0}
                            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-300 transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-opacity-50 flex items-center justify-center space-x-2 ${product.stock === 0
                                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                    : "bg-[#55DD4A] text-white hover:bg-[#004D40] focus:ring-[#55DD4A]"
                                }`}
                        >
                            <ShoppingCart size={16} />
                            <span>{product.stock === 0 ? "Out of Stock" : "Add to Cart"}</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductCard;