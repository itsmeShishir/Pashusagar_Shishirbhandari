import React, { useState, useEffect } from 'react';
import { Edit, Trash2, Plus, Search, Image } from 'lucide-react';
import axios from 'axios';

const CategoryList = ({ onAddCategory, onEditCategory }) => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    const token = localStorage.getItem('token');

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);

            // Check if token exists
            if (!token) {
                setError('Please login to access categories');
                setLoading(false);
                return;
            }

            const response = await axios.get('http://127.0.0.1:8000/api/categories/', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            setCategories(response.data);
            setError('');
        } catch (error) {
            console.error('Error fetching categories:', error);

            if (error.response?.status === 401) {
                setError('Authentication failed. Please login again.');
                // Optionally redirect to login
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
            } else if (error.response?.status === 403) {
                setError('You do not have permission to access categories.');
            } else {
                setError('Failed to load categories. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (categoryId) => {
        try {
            await axios.delete(`http://127.0.0.1:8000/api/categories/${categoryId}/`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            // Remove from local state
            setCategories(categories.filter(cat => cat.id !== categoryId));
            setDeleteConfirm(null);

            // Show success message (you can add a toast notification here)
            alert('Category deleted successfully!');
        } catch (error) {
            console.error('Error deleting category:', error);
            alert('Failed to delete category. It might be in use by products.');
        }
    };

    const filteredCategories = categories.filter(category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#004d40]"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-2xl font-bold text-gray-800">Category Management</h2>
                <button
                    onClick={onAddCategory}
                    className="flex items-center px-4 py-2 bg-[#004d40] text-white rounded-lg hover:bg-[#00695c] transition-colors"
                >
                    <Plus size={20} className="mr-2" />
                    Add Category
                </button>
            </div>

            {/* Search */}
            <div className="relative">
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search categories..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004d40]"
                />
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            )}

            {/* Categories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCategories.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-gray-500">
                        {searchTerm ? 'No categories found matching your search.' : 'No categories available. Add your first category!'}
                    </div>
                ) : (
                    filteredCategories.map((category) => (
                        <div key={category.id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                            {/* Category Image */}
                            <div className="h-48 bg-gray-100 rounded-t-lg flex items-center justify-center overflow-hidden">
                                {category.category_image ? (
                                    <img
                                        src={category.category_image}
                                        alt={category.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="text-gray-400">
                                        <Image size={48} />
                                    </div>
                                )}
                            </div>

                            {/* Category Info */}
                            <div className="p-4">
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">{category.name}</h3>

                                {/* Action Buttons */}
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-500">ID: {category.id}</span>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => onEditCategory(category)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="Edit Category"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            onClick={() => setDeleteConfirm(category.id)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Delete Category"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Confirm Delete</h3>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete this category? This action cannot be undone.
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDelete(deleteConfirm)}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CategoryList;