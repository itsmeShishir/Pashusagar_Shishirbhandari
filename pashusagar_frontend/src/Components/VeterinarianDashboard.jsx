import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import VetChatRoom from './VetChatRoom';

const VeterinarianDashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('chat');
    const [appointments, setAppointments] = useState([]);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const userRole = localStorage.getItem('role');
    const username = localStorage.getItem('username');

    useEffect(() => {
        // Check if user is a veterinarian
        if (userRole !== '2') {
            navigate('/login');
            return;
        }

        fetchDashboardData();
    }, [userRole, navigate]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            // Fetch appointments for this veterinarian
            const appointmentsResponse = await api.get('/veterinarian-appointments/');
            setAppointments(appointmentsResponse.data);

            // Fetch recent messages
            const messagesResponse = await api.get('/api/messages/');
            setMessages(messagesResponse.data.slice(0, 5)); // Get last 5 messages

        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            setError('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center">
                            <h1 className="text-2xl font-bold text-gray-900">
                                Veterinarian Dashboard
                            </h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-gray-700">Welcome, Dr. {username}</span>
                            <button
                                onClick={handleLogout}
                                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Navigation Tabs */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8">
                        <button
                            onClick={() => setActiveTab('chat')}
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'chat'
                                ? 'border-green-500 text-green-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            Patient Chat
                        </button>
                        <button
                            onClick={() => setActiveTab('appointments')}
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'appointments'
                                ? 'border-green-500 text-green-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            Appointments
                        </button>
                        <button
                            onClick={() => setActiveTab('messages')}
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'messages'
                                ? 'border-green-500 text-green-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            Message History
                        </button>
                    </nav>
                </div>

                {/* Tab Content */}
                <div className="mt-6">
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                            {error}
                        </div>
                    )}

                    {activeTab === 'chat' && (
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                Live Chat with Patients
                            </h2>
                            <VetChatRoom />
                        </div>
                    )}

                    {activeTab === 'appointments' && (
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                Your Appointments
                            </h2>
                            {appointments.length === 0 ? (
                                <div className="bg-white rounded-lg shadow p-6 text-center">
                                    <p className="text-gray-500">No appointments scheduled</p>
                                </div>
                            ) : (
                                <div className="bg-white rounded-lg shadow overflow-hidden">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Patient
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Pet Name
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Date & Time
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Status
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {appointments.map((appointment) => (
                                                <tr key={appointment.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        {appointment.first_name} {appointment.last_name}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {appointment.pet_name}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {new Date(appointment.appointment_date).toLocaleString()}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${appointment.is_confirmed
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-yellow-100 text-yellow-800'
                                                            }`}>
                                                            {appointment.is_confirmed ? 'Confirmed' : 'Pending'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'messages' && (
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                Recent Messages
                            </h2>
                            {messages.length === 0 ? (
                                <div className="bg-white rounded-lg shadow p-6 text-center">
                                    <p className="text-gray-500">No messages yet</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {messages.map((message, index) => (
                                        <div key={index} className="bg-white rounded-lg shadow p-4">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-medium text-gray-900">
                                                        From: {message.sender_name}
                                                    </p>
                                                    <p className="text-gray-600 mt-1">{message.content}</p>
                                                </div>
                                                <span className="text-sm text-gray-500">
                                                    {new Date(message.timestamp).toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VeterinarianDashboard;