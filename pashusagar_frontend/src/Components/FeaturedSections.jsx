import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ProductCard from "./ProductCard";
import BlogCard from "./BlogCard";
import { ArrowRight, Package, BookOpen } from "lucide-react";

const FeaturedSections = () => {
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [featuredBlogs, setFeaturedBlogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFeaturedContent();
    }, []);

    const fetchFeaturedContent = async () => {
        try {
            // Fetch featured products (limit to 4)
            const productsResponse = await fetch("http://127.0.0.1:8000/api/products/?limit=4");
            if (productsResponse.ok) {
                const productsData = await productsResponse.json();
                setFeaturedProducts(productsData.slice(0, 4));
            }

            // Fetch featured blogs (limit to 3)
            const blogsResponse = await fetch("http://127.0.0.1:8000/api/blogs/?limit=3");
            if (blogsResponse.ok) {
                const blogsData = await blogsResponse.json();
                setFeaturedBlogs(blogsData.slice(0, 3));
            }
        } catch (error) {
            console.error("Error fetching featured content:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="py-16 bg-gradient-to-b from-gray-50 to-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#55DD4A]" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="py-16 bg-gradient-to-b from-gray-50 to-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Featured Products Section */}
                {featuredProducts.length > 0 && (
                    <div className="mb-16">
                        <div className="text-center mb-12">
                            <div className="flex items-center justify-center mb-4">
                                <Package className="text-[#004D40] mr-3" size={32} />
                                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                                    Featured Products
                                </h2>
                            </div>
                            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                                Discover our most popular and trusted products for your pets and livestock
                            </p>
                            <div className="h-px bg-gradient-to-r from-transparent via-[#55DD4A] to-transparent my-6 max-w-md mx-auto" />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            {featuredProducts.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>

                        <div className="text-center">
                            <Link
                                to="/products"
                                className="inline-flex items-center px-6 py-3 bg-[#55DD4A] text-white rounded-lg font-medium 
                  hover:bg-[#004D40] transition-all duration-300 transform hover:-translate-y-1
                  focus:outline-none focus:ring-2 focus:ring-[#55DD4A] focus:ring-opacity-50 group"
                            >
                                View All Products
                                <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                            </Link>
                        </div>
                    </div>
                )}

                {/* Featured Blogs Section */}
                {featuredBlogs.length > 0 && (
                    <div>
                        <div className="text-center mb-12">
                            <div className="flex items-center justify-center mb-4">
                                <BookOpen className="text-[#004D40] mr-3" size={32} />
                                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                                    Latest Articles
                                </h2>
                            </div>
                            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                                Stay informed with expert insights and tips for better animal care
                            </p>
                            <div className="h-px bg-gradient-to-r from-transparent via-[#55DD4A] to-transparent my-6 max-w-md mx-auto" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
                            {featuredBlogs.map((blog) => (
                                <BlogCard key={blog.id} blog={blog} />
                            ))}
                        </div>

                        <div className="text-center">
                            <Link
                                to="/blogs"
                                className="inline-flex items-center px-6 py-3 bg-[#55DD4A] text-white rounded-lg font-medium 
                  hover:bg-[#004D40] transition-all duration-300 transform hover:-translate-y-1
                  focus:outline-none focus:ring-2 focus:ring-[#55DD4A] focus:ring-opacity-50 group"
                            >
                                Read All Articles
                                <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                            </Link>
                        </div>
                    </div>
                )}

                {/* Call to Action Section */}
                <div className="mt-16 bg-gradient-to-r from-[#004D40] to-[#00695C] rounded-2xl p-8 md:p-12 text-center">
                    <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                        Need Expert Veterinary Care?
                    </h3>
                    <p className="text-[#ADE1B0] text-lg mb-8 max-w-2xl mx-auto">
                        Book an appointment with our certified veterinarians or get instant consultation online
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            to="/online-booking"
                            className="px-6 py-3 bg-[#55DD4A] text-white rounded-lg font-medium 
                hover:bg-white hover:text-[#004D40] transition-all duration-300 transform hover:-translate-y-1"
                        >
                            Book Appointment
                        </Link>
                        <Link
                            to="/online-consultation"
                            className="px-6 py-3 border-2 border-white text-white rounded-lg font-medium 
                hover:bg-white hover:text-[#004D40] transition-all duration-300 transform hover:-translate-y-1"
                        >
                            Online Consultation
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FeaturedSections;