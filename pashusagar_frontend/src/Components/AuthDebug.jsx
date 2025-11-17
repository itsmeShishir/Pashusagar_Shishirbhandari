import React from 'react';

const AuthDebug = () => {
    const allKeys = Object.keys(localStorage);

    return (
        <div className="p-4 border rounded-lg shadow-lg max-w-2xl mx-auto my-8 bg-gray-100">
            <h3 className="text-lg font-bold mb-4">Authentication Debug Info</h3>

            <div className="space-y-2">
                <p><strong>All localStorage keys:</strong> {allKeys.join(', ')}</p>

                {allKeys.map(key => (
                    <div key={key} className="text-sm">
                        <strong>{key}:</strong> {localStorage.getItem(key)}
                    </div>
                ))}
            </div>

            <div className="mt-4 space-y-2">
                <p><strong>Expected for ChatRoom:</strong></p>
                <p>user_id: {localStorage.getItem('user_id') || 'MISSING'}</p>
                <p>access_token: {localStorage.getItem('access_token') || 'MISSING'}</p>
                <p>token (fallback): {localStorage.getItem('token') || 'MISSING'}</p>
            </div>
        </div>
    );
};

export default AuthDebug;