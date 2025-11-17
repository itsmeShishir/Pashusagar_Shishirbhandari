import { useEffect, useState } from "react";
import Navbar from "../Components/Navbar";
import Breadcrumbs from "../Components/BreadCrumbs";
import BlogCard from "../Components/BlogCard";
import { Search } from "lucide-react";

const BlogList = () => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [categories, setCategories] = useState([]);

    const breadcrumbItems = [
        { label: "Home", path: "/" },
        { label: "Blogs", path: "/blogs" },
    ];

    useEffect(() => {
        fetchBlogs();
        fetchCategories();
    }, []);

    const fetchBlogs = async () => {
        try {
            const response = await fetch("http://127.0.0.1:8000/api/blogs/");
            const data = await response.json();
            setBlogs(data);
        } catch (error) {
            console.error("Error fetching blogs:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await fetch("http://127.0.0.1:8000/api/blog-categories/");
            if (response.ok) {
                const data = await response.json();
                setCategories(data);
            }
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    };

    const filteredBlogs = blogs.filter(blog => {
        const matchesSearch = blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            blog.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === "all" ||
            blog.category_name === selectedCategory;
        return matchesSearch && matchesCategory;
    });



    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gradient-to-b from-[#004D40] to-[#00695C]">
                <div className="pt-16 px-4 md:px-6 lg:px-8">
                    <Breadcrumbs items={breadcrumbItems} />

                    <div className="max-w-7xl mx-auto text-center py-12">
                        <h2 className="text-[#55DD4A] text-4xl md:text-6xl font-bold animate-fade-in">
                            Our Blog
                        </h2>
                        <p className="mt-6 text-[#ADE1B0] text-lg md:text-xl max-w-3xl mx-auto">
                            Stay updated with the latest insights, tips, and stories about animal care and veterinary services.
                        </p>
                        <div className="h-px bg-gradient-to-r from-transparent via-[#ADE1B0] to-transparent my-8" />
                    </div>

                    {/* Search and Filter Section */}
                    <div className="max-w-7xl mx-auto mb-8">
                        <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6">
                            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                                <div className="flex flex-col sm:flex-row gap-4 flex-1">
                                    <div className="relative flex-1 max-w-md">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                        <input
                                            type="text"
                                            placeholder="Search blogs..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#55DD4A]"
                                        />
                                    </div>

                                    <select
                                        value={selectedCategory}
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                        className="px-4 py-2 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#55DD4A]"
                                    >
                                        <option value="all">All Categories</option>
                                        {categories.map((category) => (
                                            <option key={category.id} value={category.name}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="text-[#ADE1B0]">
                                    {filteredBlogs.length} articles found
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="max-w-7xl mx-auto pb-16">
                        {loading ? (
                            <div className="flex justify-center items-center h-64">
                                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#55DD4A]" />
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {filteredBlogs.map((blog) => (
                                    <BlogCard key={blog.id} blog={blog} />
                                ))}
                            </div>
                        )}

                        {!loading && filteredBlogs.length === 0 && (
                            <div className="text-center py-16">
                                <div className="text-[#ADE1B0] text-xl mb-4">No articles found</div>
                                <p className="text-[#ADE1B0] opacity-75">Try adjusting your search or filter criteria.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default BlogList;
