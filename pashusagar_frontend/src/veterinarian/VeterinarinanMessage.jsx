import React, { useEffect, useState, useRef } from "react";

const VeterinarinanMessage = () => {
  const roomName = "consultation";
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  const senderId = localStorage.getItem("user_id");
  const token = localStorage.getItem("access_token");

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch customers who have sent messages
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/api/messages/", {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          // Extract unique customers from messages
          const uniqueCustomers = [];
          const customerIds = new Set();
          
          data.forEach(msg => {
            const customerId = msg.sender !== parseInt(senderId) ? msg.sender : msg.recipient;
            const customerName = msg.sender !== parseInt(senderId) ? msg.sender_name : msg.recipient_name;
            
            if (!customerIds.has(customerId) && customerId !== parseInt(senderId)) {
              customerIds.add(customerId);
              uniqueCustomers.push({
                id: customerId,
                username: customerName
              });
            }
          });
          
          setCustomers(uniqueCustomers);
          if (uniqueCustomers.length > 0) {
            setSelectedCustomer(uniqueCustomers[0].id);
          }
        }
      } catch (error) {
        console.error("Error fetching customers:", error);
        setError("Error loading customers");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchCustomers();
    } else {
      setError("Please login to access messages");
      setLoading(false);
    }
  }, [token, senderId]);

  // Load message history when customer is selected
  useEffect(() => {
    const loadMessageHistory = async () => {
      if (!selectedCustomer || !token) return;
      
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/messages/?user_id=${selectedCustomer}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          const formattedMessages = data.map(msg => ({
            sender_id: msg.sender,
            sender: msg.sender_name,
            recipient_id: msg.recipient,
            recipient: msg.recipient_name,
            message: msg.content,
            timestamp: msg.timestamp,
          }));
          setMessages(formattedMessages);
        }
      } catch (error) {
        console.error("Error loading message history:", error);
      }
    };

    loadMessageHistory();
  }, [selectedCustomer, token]);

  // Establish WebSocket connection
  useEffect(() => {
    if (!senderId || !token) return;

    const wsScheme = window.location.protocol === "https:" ? "wss" : "ws";
    const backendHost = "127.0.0.1:8000";
    const socketUrl = `${wsScheme}://${backendHost}/ws/chat/${roomName}/`;
    
    socketRef.current = new WebSocket(socketUrl);

    socketRef.current.onopen = () => {
      console.log("WebSocket connection established.");
    };

    socketRef.current.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.error) {
        setError(data.error);
        return;
      }
      setMessages((prev) => [...prev, data]);
    };

    socketRef.current.onclose = (e) => {
      console.error("WebSocket closed unexpectedly");
    };

    socketRef.current.onerror = (error) => {
      console.error("WebSocket error:", error);
      setError("Connection error occurred");
    };

    return () => {
      if (socketRef.current) socketRef.current.close();
    };
  }, [roomName, senderId, token]);

  const sendMessage = () => {
    if (input.trim() === "" || !selectedCustomer) return;

    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      console.error("WebSocket is not open. Unable to send message.");
      setError("Connection not available. Please refresh the page.");
      return;
    }

    const messageData = {
      sender: senderId,
      recipient: selectedCustomer,
      message: input,
    };

    socketRef.current.send(JSON.stringify(messageData));
    setInput("");
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center">Loading messages...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-red-500 text-center">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Veterinarian Messages</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Customer List */}
        <div className="lg:col-span-1">
          <h3 className="text-lg font-semibold mb-4">Customers</h3>
          <div className="border rounded-lg">
            {customers.length === 0 ? (
              <p className="p-4 text-gray-500">No messages yet</p>
            ) : (
              customers.map((customer) => (
                <div
                  key={customer.id}
                  onClick={() => setSelectedCustomer(customer.id)}
                  className={`p-3 border-b cursor-pointer hover:bg-gray-50 ${
                    selectedCustomer == customer.id ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                >
                  <div className="font-medium">{customer.username}</div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-3">
          {selectedCustomer ? (
            <div className="border rounded-lg">
              {/* Chat Header */}
              <div className="p-4 border-b bg-gray-50">
                <h3 className="font-semibold">
                  Chat with {customers.find(c => c.id == selectedCustomer)?.username}
                </h3>
              </div>

              {/* Messages */}
              <div className="h-96 overflow-y-auto p-4 bg-gray-50">
                {messages.length === 0 ? (
                  <p className="text-gray-500 text-center">
                    No messages in this conversation yet.
                  </p>
                ) : (
                  messages.map((msg, index) => (
                    <div 
                      key={index} 
                      className={`mb-3 ${
                        msg.sender_id == senderId ? 'text-right' : 'text-left'
                      }`}
                    >
                      <div 
                        className={`inline-block max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          msg.sender_id == senderId 
                            ? 'bg-green-500 text-white' 
                            : 'bg-white border'
                        }`}
                      >
                        <div className="font-medium text-sm mb-1">
                          {msg.sender_id == senderId ? 'You' : msg.sender}
                        </div>
                        <div>{msg.message}</div>
                        <div className={`text-xs mt-1 ${
                          msg.sender_id == senderId ? 'text-green-100' : 'text-gray-500'
                        }`}>
                          {new Date(msg.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t">
                <div className="flex">
                  <input
                    type="text"
                    className="flex-grow p-3 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Type your response..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") sendMessage();
                    }}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={input.trim() === ""}
                    className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-6 rounded-r-lg transition-colors"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="border rounded-lg p-8 text-center text-gray-500">
              Select a customer to start chatting
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VeterinarinanMessage;
