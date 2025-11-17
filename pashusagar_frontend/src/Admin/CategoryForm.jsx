import React, { useState, useEffect } from 'react';
import { ArrowLeft, Upload, X } from 'lucide-react';
import api from '../utils/api';

const CategoryForm = ({ category, onBack, onSuccess }) => {
    const [formData, setFormData] = useState({
        name: '',
        category_image: null
    });
    const [imagePreview, setImagePreview] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const isEditing = !!category;

    useEffect(() => {
        if (category) {
            setFormData({
                name: category.name || '',
                category_image: null
            });
            setImagePreview(category.category_image || '');
        }
    }, [category]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({
                ...prev,
                category_image: file
            }));

            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setFormData(prev => ({
            ...prev,
            category_image: null
        }));
        setImagePreview('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            setError('Category name is required');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const submitData = new FormData();
            submitData.append('name', formData.name.trim());

            if (formData.category_image) {
                submitData.append('category_image', formData.category_image);
            }

            if (isEditing) {
                await api.put(
                    `/categories/${category.id}/`,
                    submitData,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                    }
                );
            } else {
                await api.post(
                    '/categories/',
                    submitData,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                    }
                );
            }

            // Success
            alert(`Category ${isEditing ? 'updated' : 'created'} successfully!`);
            onSuccess();

        } catch (error) {
            console.error('Error saving category:', error);
            if (error.response?.data?.name) {
                setError(error.response.data.name[0]);
            } else {
                setError(`Failed to ${isEditing ? 'update' : 'create'} category`);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center space-x-4">
                <button
                    onClick={onBack}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <ArrowLeft size={20} />
                </button>
                <h2 className="text-2xl font-bold text-gray-800">
                    {isEditing ? 'Edit Category' : 'Add New Category'}
                </h2>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
                {/* Error Message */}
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                        {error}
                    </div>
                )}

                {/* Category Name */}
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Category Name *
                    </label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Enter category name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004d40]"
                        required
                    />
                </div>

                {/* Category Image */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category Image
                    </label>

                    {/* Image Preview */}
                    {imagePreview && (
                        <div className="mb-4 relative inline-block">
                            <img
                                src={imagePreview}
                                alt="Category preview"
                                className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                            />
                            <button
                                type="button"
                                onClick={removeImage}
                                className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    )}

                    {/* File Input */}
                    <div className="flex items-center justify-center w-full">
                        <label
                            htmlFor="category_image"
                            className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
                        >
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <Upload className="w-8 h-8 mb-4 text-gray-500" />
                                <p className="mb-2 text-sm text-gray-500">
                                    <span className="font-semibold">Click to upload</span> or drag and drop
                                </p>
                                <p className="text-xs text-gray-500">PNG, JPG or JPEG (MAX. 5MB)</p>
                            </div>
                            <input
                                id="category_image"
                                name="category_image"
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                            />
                        </label>
                    </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex justify-end space-x-4 pt-6">
                    <button
                        type="button"
                        onClick={onBack}
                        className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 bg-[#004d40] text-white rounded-lg hover:bg-[#00695c] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <div className="flex items-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                {isEditing ? 'Updating...' : 'Creating...'}
                            </div>
                        ) : (
                            isEditing ? 'Update Category' : 'Create Category'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CategoryForm;