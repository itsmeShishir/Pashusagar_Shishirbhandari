import React, { useEffect, useState, useRef } from "react";
import api from "../utils/api";

const VetChatRoom = () => {
    const roomName = "consultation";

    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [patients, setPatients] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState("");
    const [loading, setLoading] = useState(true);
    const [fatalError, setFatalError] = useState("");
    const [connectionError, setConnectionError] = useState("");
    const [socketStatus, setSocketStatus] = useState("idle");

    const socketRef = useRef(null);
    const messagesEndRef = useRef(null);

    const senderId = localStorage.getItem("user_id");
    const token = localStorage.getItem("access_token") || localStorage.getItem("token");

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        const fetchPatients = async () => {
            try {
                // Get all messages where this vet is the recipient or sender
                const response = await api.get("/messages/");

                // Extract unique patients from messages
                const uniquePatients = new Map();
                response.data.forEach(msg => {
                    if (msg.sender !== parseInt(senderId) && !uniquePatients.has(msg.sender)) {
                        uniquePatients.set(msg.sender, {
                            id: msg.sender,
                            name: msg.sender_name
                        });
                    }
                    if (msg.recipient !== parseInt(senderId) && !uniquePatients.has(msg.recipient)) {
                        uniquePatients.set(msg.recipient, {
                            id: msg.recipient,
                            name: msg.recipient_name
                        });
                    }
                });

                const patientsList = Array.from(uniquePatients.values());
                setPatients(patientsList);

                if (patientsList.length > 0) {
                    setSelectedPatient(patientsList[0].id);
                }
            } catch (fetchError) {
                console.error("Error fetching patients:", fetchError);
                setFatalError("Unable to load patient conversations.");
            } finally {
                setLoading(false);
            }
        };

        if (token && senderId) {
            fetchPatients();
        } else {
            setLoading(false);
        }
    }, [token, senderId]);

    useEffect(() => {
        const loadMessageHistory = async () => {
            if (!selectedPatient || !token) return;

            try {
                const response = await api.get("/messages/", {
                    params: { user_id: selectedPatient },
                });

                const formattedMessages = response.data.map((msg) => ({
                    sender_id: msg.sender,
                    sender: msg.sender_name,
                    recipient_id: msg.recipient,
                    recipient: msg.recipient_name,
                    message: msg.content,
                    timestamp: msg.timestamp,
                }));
                setMessages(formattedMessages);
            } catch (loadError) {
                console.error("Error loading message history:", loadError);
            }
        };

        loadMessageHistory();
    }, [selectedPatient, token]);

    useEffect(() => {
        if (!senderId || !token) return;

        let reconnectTimer;
        let socket;

        const createWebSocket = () => {
            const wsScheme = window.location.protocol === "https:" ? "wss" : "ws";
            const wsHost = import.meta.env.VITE_WS_HOST ?? window.location.hostname;
            const wsPort = import.meta.env.VITE_WS_PORT ?? "8000";
            const wsBase = import.meta.env.VITE_WS_URL ?? `${wsScheme}://${wsHost}:${wsPort}`;
            const socketUrl = `${wsBase}/ws/chat/${roomName}/`;

            console.log("Connecting to", socketUrl);
            setConnectionError("");
            setSocketStatus("connecting");

            socket = new WebSocket(socketUrl);
            socketRef.current = socket;

            socket.onopen = () => {
                console.log("WebSocket connection established.");
                setSocketStatus("connected");
            };

            socket.onmessage = (e) => {
                const data = JSON.parse(e.data);
                if (data.error) {
                    setConnectionError(data.error);
                    return;
                }
                if (data.type !== 'connection_established') {
                    setMessages((prev) => [...prev, data]);
                }
            };

            socket.onerror = (event) => {
                console.error("WebSocket error:", event);
                setSocketStatus("error");
                setConnectionError("Connection error occurred. Please verify that the Django server is running.");
            };

            socket.onclose = (event) => {
                if (event.code === 1000) {
                    setSocketStatus("closed");
                    return;
                }
                console.error("WebSocket closed unexpectedly", event);
                setSocketStatus("reconnecting");
                reconnectTimer = window.setTimeout(createWebSocket, 3000);
            };
        };

        createWebSocket();

        return () => {
            if (reconnectTimer) {
                window.clearTimeout(reconnectTimer);
            }
            socket?.close();
        };
    }, [roomName, senderId, token]);

    const sendMessage = () => {
        if (input.trim() === "" || !selectedPatient) return;

        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            const messageData = {
                sender: senderId,
                recipient: selectedPatient,
                message: input,
            };

            socketRef.current.send(JSON.stringify(messageData));
            setInput("");
        } else {
            console.error("WebSocket is not open. Unable to send message.");
            setConnectionError("Connection not available. Please refresh the page.");
        }
    };

    if (loading) {
        return (
            <div className="p-4 border rounded-lg shadow-lg max-w-4xl mx-auto my-8">
                <div className="text-center">Loading conversations...</div>
            </div>
        );
    }

    if (!token || !senderId) {
        return (
            <div className="p-6 border rounded-lg shadow-lg max-w-4xl mx-auto my-8 bg-white">
                <p className="text-center text-lg text-red-600">
                    Authentication required. Please refresh the page.
                </p>
            </div>
        );
    }

    if (fatalError) {
        return (
            <div className="p-4 border rounded-lg shadow-lg max-w-4xl mx-auto my-8">
                <div className="text-red-500 text-center">{fatalError}</div>
            </div>
        );
    }

    const connectionStatusMessage = () => {
        if (socketStatus === "connecting") {
            return "Connecting to chat server...";
        }
        if (socketStatus === "reconnecting") {
            return "Connection lost. Attempting to reconnect...";
        }
        if (socketStatus === "closed") {
            return "Connection closed. Refresh the page to try again.";
        }
        return "";
    };

    return (
        <div className="border rounded-lg shadow-lg max-w-4xl mx-auto my-8 bg-white">
            <div className="flex h-96">
                {/* Patient List Sidebar */}
                <div className="w-1/3 border-r bg-gray-50 p-4">
                    <h3 className="text-lg font-semibold mb-4">Patient Conversations</h3>

                    {(socketStatus !== "connected" || connectionError) && (
                        <p className="text-sm text-center text-yellow-600 mb-2">
                            {connectionError || connectionStatusMessage()}
                        </p>
                    )}

                    {patients.length === 0 ? (
                        <p className="text-gray-500 text-center">No conversations yet</p>
                    ) : (
                        <div className="space-y-2">
                            {patients.map((patient) => (
                                <button
                                    key={patient.id}
                                    onClick={() => setSelectedPatient(patient.id)}
                                    className={`w-full text-left p-3 rounded-lg transition-colors ${selectedPatient === patient.id
                                            ? "bg-blue-100 border-blue-300 border"
                                            : "bg-white hover:bg-gray-100 border border-gray-200"
                                        }`}
                                >
                                    <div className="font-medium">{patient.name}</div>
                                    <div className="text-sm text-gray-500">Patient ID: {patient.id}</div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Chat Area */}
                <div className="w-2/3 flex flex-col">
                    {/* Chat Header */}
                    <div className="p-4 border-b bg-gray-50">
                        <h3 className="font-semibold">
                            {selectedPatient ? `Chat with ${patients.find(p => p.id === selectedPatient)?.name || 'Patient'}` : 'Select a patient'}
                        </h3>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                        {!selectedPatient ? (
                            <p className="text-gray-500 text-center">Select a patient to start chatting</p>
                        ) : messages.length === 0 ? (
                            <p className="text-gray-500 text-center">No messages yet. Start the conversation!</p>
                        ) : (
                            messages.map((msg, index) => (
                                <div
                                    key={index}
                                    className={`mb-3 ${msg.sender_id == senderId ? "text-right" : "text-left"}`}
                                >
                                    <div
                                        className={`inline-block max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${msg.sender_id == senderId
                                                ? "bg-blue-500 text-white"
                                                : "bg-white border"
                                            }`}
                                    >
                                        <div className="font-medium text-sm mb-1">
                                            {msg.sender_id == senderId ? "You" : msg.sender}
                                        </div>
                                        <div>{msg.message}</div>
                                        <div
                                            className={`text-xs mt-1 ${msg.sender_id == senderId ? "text-blue-100" : "text-gray-500"
                                                }`}
                                        >
                                            {new Date(msg.timestamp).toLocaleTimeString()}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Message Input */}
                    <div className="p-4 border-t bg-white">
                        <div className="flex">
                            <input
                                type="text"
                                className="flex-grow p-3 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Type your message..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => {
                                    if (e.key === "Enter") sendMessage();
                                }}
                                disabled={!selectedPatient}
                            />
                            <button
                                onClick={sendMessage}
                                disabled={!selectedPatient || input.trim() === ""}
                                className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-6 rounded-r-lg transition-colors"
                            >
                                Send
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VetChatRoom;