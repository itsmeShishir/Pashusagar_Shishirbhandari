import React, { useState } from 'react';
import CategoryList from './CategoryList';
import CategoryForm from './CategoryForm';

const CategoryManagement = () => {
    const [currentView, setCurrentView] = useState('list'); // 'list', 'add', 'edit'
    const [selectedCategory, setSelectedCategory] = useState(null);

    const handleAddCategory = () => {
        setSelectedCategory(null);
        setCurrentView('add');
    };

    const handleEditCategory = (category) => {
        setSelectedCategory(category);
        setCurrentView('edit');
    };

    const handleBackToList = () => {
        setSelectedCategory(null);
        setCurrentView('list');
    };

    const handleSuccess = () => {
        // Go back to list and refresh
        setCurrentView('list');
        setSelectedCategory(null);
        // The CategoryList component will automatically refresh when it mounts
    };

    const renderContent = () => {
        switch (currentView) {
            case 'add':
                return (
                    <CategoryForm
                        category={null}
                        onBack={handleBackToList}
                        onSuccess={handleSuccess}
                    />
                );
            case 'edit':
                return (
                    <CategoryForm
                        category={selectedCategory}
                        onBack={handleBackToList}
                        onSuccess={handleSuccess}
                    />
                );
            default:
                return (
                    <CategoryList
                        onAddCategory={handleAddCategory}
                        onEditCategory={handleEditCategory}
                    />
                );
        }
    };

    return (
        <div className="w-full">
            {renderContent()}
        </div>
    );
};

export default CategoryManagement;