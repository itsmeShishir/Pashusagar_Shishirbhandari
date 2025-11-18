import { useState } from 'react';
import api from '../utils/api';
import { setTokens, setUserData, getToken, getUserData } from '../utils/auth';

const QuickLogin = () => {
    const [credentials, setCredentials] = useState({
        email: 'admin@test.com',
        password: 'testpass123'
    });
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState('');

    const handleLogin = async () => {
        setLoading(true);
        setResult('');

        try {
            const response = await api.post('/auth/login/', credentials);
            const { access, refresh, role, user_id, email, username, phone } = response.data;

            // Store tokens and user data
            setTokens(access, refresh);
            setUserData({ user_id, email, username, phone, role });

            setResult(`✅ Login successful! Role: ${role}, User ID: ${user_id}`);

            // Test dashboard call
            setTimeout(testDashboard, 1000);

        } catch (error) {
            setResult(`❌ Login failed: ${error.response?.data?.error || error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const testDashboard = async () => {
        try {
            const response = await api.get('/api/dashboard-stats/');
            setResult(prev => prev + `\n✅ Dashboard call successful: ${JSON.stringify(response.data)}`);
        } catch (error) {
            setResult(prev => prev + `\n❌ Dashboard call failed: ${error.response?.data?.detail || error.message}`);
        }
    };

    const checkCurrentAuth = () => {
        const token = getToken();
        const userData = getUserData();

        setResult(`Current Token: ${token ? 'EXISTS' : 'NONE'}\nUser Data: ${JSON.stringify(userData, null, 2)}`);
    };

    return (
        <div className="p-6 bg-gray-100 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Quick Authentication Test</h3>

            <div className="space-y-4">
                <div>
                    <input
                        type="email"
                        placeholder="Email"
                        value={credentials.email}
                        onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                        className="w-full p-2 border rounded"
                    />
                </div>

                <div>
                    <input
                        type="password"
                        placeholder="Password"
                        value={credentials.password}
                        onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                        className="w-full p-2 border rounded"
                    />
                </div>

                <div className="flex space-x-2">
                    <button
                        onClick={handleLogin}
                        disabled={loading}
                        className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
                    >
                        {loading ? 'Logging in...' : 'Test Login'}
                    </button>

                    <button
                        onClick={checkCurrentAuth}
                        className="px-4 py-2 bg-gray-500 text-white rounded"
                    >
                        Check Auth Status
                    </button>
                </div>

                {result && (
                    <pre className="mt-4 p-3 bg-white rounded border text-sm overflow-auto">
                        {result}
                    </pre>
                )}
            </div>
        </div>
    );
};

export default QuickLogin;