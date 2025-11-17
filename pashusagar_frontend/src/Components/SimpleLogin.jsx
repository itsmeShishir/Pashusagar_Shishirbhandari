import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, User, Lock, Mail } from 'lucide-react';

const SimpleLogin = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [userInfo, setUserInfo] = useState(null);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        setError('');
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Make login request
            const response = await fetch('http://127.0.0.1:8000/api/auth/login/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                // Login successful - store access token and user info
                localStorage.setItem('access_token', data.access);
                localStorage.setItem('refresh_token', data.refresh);

                const userData = {
                    user_id: data.user_id,
                    email: data.email,
                    username: data.username,
                    phone: data.phone,
                    role: data.role,
                };

                localStorage.setItem('user_data', JSON.stringify(userData));

                // Show user information
                setUserInfo(userData);

                // Test API call with token
                testApiCall(data.access);

            } else {
                setError(data.error || data.detail || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const testApiCall = async (accessToken) => {
        try {
            const response = await fetch('http://127.0.0.1:8000/api/dashboard-stats/', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const stats = await response.json();
                console.log('✅ API call successful:', stats);
                alert('✅ Login and API call successful! Check console for details.');
            } else {
                console.error('❌ API call failed:', response.status);
                alert('❌ API call failed. Check console for details.');
            }
        } catch (error) {
            console.error('❌ API call error:', error);
        }
    };

    const goToAdmin = () => {
        navigate('/admin');
    };

    const logout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_data');
        setUserInfo(null);
        setFormData({ email: '', password: '' });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#004d40] to-[#00695c] py-12 px-4">
            <div className="max-w-md w-full space-y-8">
                <div className="bg-white rounded-lg shadow-xl p-8">
                    <div className="text-center">
                        <div className="mx-auto h-12 w-12 bg-[#004d40] rounded-full flex items-center justify-center">
                            <User className="h-6 w-6 text-white" />
                        </div>
                        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                            Simple Login Test
                        </h2>
                    </div>

                    {/* Show user info if logged in */}
                    {userInfo ? (
                        <div className="mt-8 space-y-4">
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <h3 className="text-lg font-semibold text-green-800 mb-2">
                                    ✅ Login Successful!
                                </h3>
                                <div className="space-y-2 text-sm">
                                    <p><strong>User ID:</strong> {userInfo.user_id}</p>
                                    <p><strong>Email:</strong> {userInfo.email}</p>
                                    <p><strong>Username:</strong> {userInfo.username}</p>
                                    <p><strong>Role:</strong> {userInfo.role}</p>
                                    <p><strong>Phone:</strong> {userInfo.phone}</p>
                                </div>
                            </div>

                            <div className="flex space-x-2">
                                <button
                                    onClick={goToAdmin}
                                    className="flex-1 py-2 px-4 bg-[#004d40] text-white rounded-lg hover:bg-[#00695c]"
                                >
                                    Go to Admin
                                </button>
                                <button
                                    onClick={logout}
                                    className="flex-1 py-2 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600"
                                >
                                    Logout
                                </button>
                            </div>
                        </div>
                    ) : (
                        /* Login form */
                        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Email</label>
                                    <div className="mt-1 relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                                            <Mail className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            name="email"
                                            type="email"
                                            required
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#004d40] focus:border-[#004d40]"
                                            placeholder="Enter your email"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Password</label>
                                    <div className="mt-1 relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                                            <Lock className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            name="password"
                                            type={showPassword ? 'text' : 'password'}
                                            required
                                            value={formData.password}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#004d40] focus:border-[#004d40]"
                                            placeholder="Enter your password"
                                        />
                                        <button
                                            type="button"
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-5 w-5 text-gray-400" />
                                            ) : (
                                                <Eye className="h-5 w-5 text-gray-400" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#004d40] hover:bg-[#00695c] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#004d40] disabled:opacity-50"
                            >
                                {loading ? 'Signing in...' : 'Sign in'}
                            </button>
                        </form>
                    )}

                    {/* Quick test credentials */}
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Test Credentials:</h4>
                        <p className="text-xs text-gray-600">
                            Email: admin@test.com<br />
                            Password: testpass123
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SimpleLogin;