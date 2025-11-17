import React, { useEffect, useState } from "react";
import Navbar from "../Components/Navbar";
import Breadcrumbs from "../Components/BreadCrumbs";
import ProductCard from "../Components/ProductCard";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Products = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [sortBy, setSortBy] = useState("name");

    const breadcrumbItems = [
        { label: "Home", path: "/" },
        { label: "Products", path: "/products" },
    ];

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await fetch("http://127.0.0.1:8000/api/products/");
            if (!response.ok) throw new Error("Failed to fetch products");
            const data = await response.json();
            setProducts(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await fetch("http://127.0.0.1:8000/api/categories/");
            if (response.ok) {
                const data = await response.json();
                setCategories(data);
            }
        } catch (err) {
            console.error("Failed to fetch categories:", err);
        }
    };



    const filteredProducts = products
        .filter(product =>
            selectedCategory === "all" ||
            product.category === selectedCategory ||
            product.category_name === selectedCategory
        )
        .sort((a, b) => {
            switch (sortBy) {
                case "price-low":
                    return a.price - b.price;
                case "price-high":
                    return b.price - a.price;
                case "name":
                default:
                    return (a.name || a.title || "").localeCompare(b.name || b.title || "");
            }
        });

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#004D40] to-[#00695C]">
            <Navbar />
            <div className="pt-16 px-4 md:px-6 lg:px-8">
                <Breadcrumbs items={breadcrumbItems} />

                <div className="max-w-7xl mx-auto text-center py-12">
                    <h2 className="text-[#55DD4A] text-4xl md:text-6xl font-bold animate-fade-in">
                        Our Products
                    </h2>
                    <p className="mt-6 text-[#ADE1B0] text-lg md:text-xl max-w-3xl mx-auto">
                        Discover our complete range of quality products for your pets and livestock.
                    </p>
                    <div className="h-px bg-gradient-to-r from-transparent via-[#ADE1B0] to-transparent my-8" />
                </div>

                {/* Filters */}
                <div className="max-w-7xl mx-auto mb-8">
                    <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6">
                        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                            <div className="flex flex-col sm:flex-row gap-4">
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="px-4 py-2 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#55DD4A]"
                                >
                                    <option value="all">All Categories</option>
                                    {categories.map((category) => (
                                        <option key={category.id} value={category.name || category.id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>

                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="px-4 py-2 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#55DD4A]"
                                >
                                    <option value="name">Sort by Name</option>
                                    <option value="price-low">Price: Low to High</option>
                                    <option value="price-high">Price: High to Low</option>
                                </select>
                            </div>

                            <div className="text-[#ADE1B0]">
                                {filteredProducts.length} products found
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto pb-16">
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#55DD4A]" />
                        </div>
                    ) : error ? (
                        <div className="text-red-400 text-center p-4 bg-red-900 bg-opacity-20 rounded-lg">
                            {error}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredProducts.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    )}

                    {!loading && !error && filteredProducts.length === 0 && (
                        <div className="text-center py-16">
                            <div className="text-[#ADE1B0] text-xl mb-4">No products found</div>
                            <p className="text-[#ADE1B0] opacity-75">Try adjusting your filters or check back later.</p>
                        </div>
                    )}
                </div>
            </div>
            <ToastContainer />
        </div>
    );
};

export default Products;