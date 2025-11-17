import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, User, Key, RefreshCw } from 'lucide-react';

const AuthStatus = () => {
    const [authData, setAuthData] = useState({
        hasAccessToken: false,
        hasRefreshToken: false,
        userData: null,
        tokenValid: false,
    });

    const checkAuthStatus = () => {
        const accessToken = localStorage.getItem('access_token');
        const refreshToken = localStorage.getItem('refresh_token');
        const userDataStr = localStorage.getItem('user_data');

        let userData = null;
        let tokenValid = false;

        if (userDataStr) {
            try {
                userData = JSON.parse(userDataStr);
            } catch (e) {
                console.error('Invalid user data in localStorage');
            }
        }

        // Check if access token is valid (basic check)
        if (accessToken) {
            try {
                const payload = JSON.parse(atob(accessToken.split('.')[1]));
                const currentTime = Date.now() / 1000;
                tokenValid = payload.exp > currentTime;
            } catch (e) {
                tokenValid = false;
            }
        }

        setAuthData({
            hasAccessToken: !!accessToken,
            hasRefreshToken: !!refreshToken,
            userData,
            tokenValid,
        });
    };

    const testApiCall = async () => {
        const accessToken = localStorage.getItem('access_token');

        if (!accessToken) {
            alert('No access token found. Please login first.');
            return;
        }

        try {
            const response = await fetch('http://127.0.0.1:8000/api/dashboard-stats/', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                alert('✅ API call successful! Check console for data.');
                console.log('Dashboard stats:', data);
            } else {
                const errorData = await response.json();
                alert(`❌ API call failed: ${response.status}`);
                console.error('API error:', errorData);
            }
        } catch (error) {
            alert('❌ Network error');
            console.error('Network error:', error);
        }
    };

    const clearAuth = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_data');
        checkAuthStatus();
    };

    useEffect(() => {
        checkAuthStatus();
    }, []);

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">Authentication Status</h2>
                <button
                    onClick={checkAuthStatus}
                    className="flex items-center px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                    <RefreshCw size={16} className="mr-2" />
                    Refresh
                </button>
            </div>

            {/* Token Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg border">
                    <div className="flex items-center space-x-2">
                        {authData.hasAccessToken ? (
                            <CheckCircle className="text-green-500" size={20} />
                        ) : (
                            <XCircle className="text-red-500" size={20} />
                        )}
                        <span className="font-medium">Access Token</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                        {authData.hasAccessToken ? 'Present' : 'Missing'}
                        {authData.hasAccessToken && (
                            <span className={`ml-2 ${authData.tokenValid ? 'text-green-600' : 'text-red-600'}`}>
                                ({authData.tokenValid ? 'Valid' : 'Expired'})
                            </span>
                        )}
                    </p>
                </div>

                <div className="bg-white p-4 rounded-lg border">
                    <div className="flex items-center space-x-2">
                        {authData.hasRefreshToken ? (
                            <CheckCircle className="text-green-500" size={20} />
                        ) : (
                            <XCircle className="text-red-500" size={20} />
                        )}
                        <span className="font-medium">Refresh Token</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                        {authData.hasRefreshToken ? 'Present' : 'Missing'}
                    </p>
                </div>
            </div>

            {/* User Data */}
            {authData.userData && (
                <div className="bg-white p-4 rounded-lg border">
                    <div className="flex items-center space-x-2 mb-3">
                        <User className="text-blue-500" size={20} />
                        <span className="font-medium">User Information</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        <div><strong>ID:</strong> {authData.userData.user_id}</div>
                        <div><strong>Role:</strong> {authData.userData.role}</div>
                        <div><strong>Email:</strong> {authData.userData.email}</div>
                        <div><strong>Username:</strong> {authData.userData.username}</div>
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className="flex space-x-4">
                <button
                    onClick={testApiCall}
                    disabled={!authData.hasAccessToken}
                    className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Key size={16} className="mr-2" />
                    Test API Call
                </button>

                <button
                    onClick={clearAuth}
                    className="flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                    <XCircle size={16} className="mr-2" />
                    Clear Auth Data
                </button>

                <a
                    href="/simple-login"
                    className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                    <User size={16} className="mr-2" />
                    Go to Login
                </a>
            </div>

            {/* Instructions */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-medium text-yellow-800 mb-2">How to Fix Token Issues:</h3>
                <ol className="text-sm text-yellow-700 space-y-1">
                    <li>1. Go to <a href="/simple-login" className="underline">/simple-login</a></li>
                    <li>2. Login with: admin@test.com / testpass123</li>
                    <li>3. Come back here and click "Refresh"</li>
                    <li>4. Click "Test API Call" to verify it works</li>
                </ol>
            </div>
        </div>
    );
};

export default AuthStatus;