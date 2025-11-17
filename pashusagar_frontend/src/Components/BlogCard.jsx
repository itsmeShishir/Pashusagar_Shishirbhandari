import React from "react";
import { Link } from "react-router-dom";
import { Calendar, User, Tag, ArrowRight } from "lucide-react";

const BlogCard = ({ blog }) => {
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <article className="bg-white bg-opacity-95 rounded-xl shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 group">
            <div className="relative overflow-hidden rounded-t-xl">
                <img
                    src={blog.image || "/placeholder.svg"}
                    alt={blog.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {blog.category_name && (
                    <span className="absolute top-4 left-4 bg-[#55DD4A] text-white px-3 py-1 rounded-full text-sm font-medium flex items-center">
                        <Tag size={14} className="mr-1" />
                        {blog.category_name}
                    </span>
                )}

                {/* Reading Time Estimate */}
                <span className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded-full text-xs">
                    {Math.ceil((blog.description?.length || 0) / 200)} min read
                </span>
            </div>

            <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-3 line-clamp-2 group-hover:text-[#004D40] transition-colors">
                    {blog.title}
                </h3>

                <div className="flex items-center text-gray-500 text-sm mb-3 space-x-4">
                    {blog.author && (
                        <div className="flex items-center">
                            <User size={14} className="mr-1" />
                            {blog.author}
                        </div>
                    )}
                    {blog.created_at && (
                        <div className="flex items-center">
                            <Calendar size={14} className="mr-1" />
                            {formatDate(blog.created_at)}
                        </div>
                    )}
                </div>

                <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                    {blog.description}
                </p>

                <Link
                    to={`/singleblog/${blog.id}`}
                    className="inline-flex items-center px-4 py-2 bg-[#55DD4A] text-white rounded-lg font-medium 
            hover:bg-[#004D40] transition-all duration-300 transform hover:-translate-y-1
            focus:outline-none focus:ring-2 focus:ring-[#55DD4A] focus:ring-opacity-50 group"
                >
                    Read More
                    <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                </Link>
            </div>
        </article>
    );
};

export default BlogCard;