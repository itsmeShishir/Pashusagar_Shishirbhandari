import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import api from "../utils/api";

const ChatRoom = () => {
  const roomName = "consultation";

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [vets, setVets] = useState([]);
  const [selectedVet, setSelectedVet] = useState("");
  const [loading, setLoading] = useState(true);
  const [fatalError, setFatalError] = useState("");
  const [connectionError, setConnectionError] = useState("");
  const [socketStatus, setSocketStatus] = useState("idle");

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  const senderId = localStorage.getItem("user_id");
  const token = localStorage.getItem("access_token") || localStorage.getItem("token");

  // Debug logging
  console.log("ChatRoom - senderId:", senderId);
  console.log("ChatRoom - token:", token ? "exists" : "missing");
  console.log("ChatRoom - all localStorage keys:", Object.keys(localStorage));
  console.log("ChatRoom - all localStorage keys:", Object.keys(localStorage));

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const fetchVets = async () => {
      try {
        const response = await api.get("/api/vets/");
        setVets(response.data);
        if (response.data.length > 0) {
          setSelectedVet(response.data[0].id);
        }
      } catch (fetchError) {
        console.error("Error fetching veterinarians:", fetchError);
        setFatalError(
          "Unable to load veterinarians. Please make sure you are logged in and the backend is running."
        );
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchVets();
    } else {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    const loadMessageHistory = async () => {
      if (!selectedVet || !token) return;

      try {
        const response = await api.get("/api/messages/", {
          params: { user_id: selectedVet },
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
  }, [selectedVet, token]);

  useEffect(() => {
    if (!senderId || !token) return;

    let reconnectTimer;
    let socket;

    const createWebSocket = () => {
      const wsScheme = window.location.protocol === "https:" ? "wss" : "ws";
      const wsHost =
        import.meta.env.VITE_WS_HOST ?? window.location.hostname;
      const wsPort = import.meta.env.VITE_WS_PORT ?? "8000";
      const wsBase =
        import.meta.env.VITE_WS_URL ?? `${wsScheme}://${wsHost}:${wsPort}`;
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
        setMessages((prev) => [...prev, data]);
      };

      socket.onerror = (event) => {
        console.error("WebSocket error:", event);
        setSocketStatus("error");
        setConnectionError(
          "Connection error occurred. Please verify that the Django server (with Channels) and Redis are running."
        );
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
    if (input.trim() === "" || !selectedVet) return;

    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      const messageData = {
        sender: senderId,
        recipient: selectedVet,
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
      <div className="p-4 border rounded-lg shadow-lg max-w-2xl mx-auto my-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!token || !senderId) {
    console.log("Authentication check failed - token:", !!token, "senderId:", !!senderId);
    return (
      <div className="p-6 border rounded-lg shadow-lg max-w-2xl mx-auto my-8 bg-white">
        <p className="text-center text-lg">
          You must be logged in to start an online consultation.{" "}
          <Link to="/login" className="text-blue-500 hover:underline">
            Login here
          </Link>
          .
        </p>
        <div className="mt-4 text-sm text-gray-600">
          <p>Debug info:</p>
          <p>Token exists: {!!token ? "Yes" : "No"}</p>
          <p>User ID exists: {!!senderId ? "Yes" : "No"}</p>
          <p>Available localStorage keys: {Object.keys(localStorage).join(", ")}</p>
        </div>
      </div>
    );
  }

  if (fatalError) {
    return (
      <div className="p-4 border rounded-lg shadow-lg max-w-2xl mx-auto my-8">
        <div className="text-red-500 text-center">{fatalError}</div>
      </div>
    );
  }

  const connectionStatusMessage = () => {
    if (socketStatus === "connecting") {
      return "Connecting to the consultation server...";
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
    <div className="p-4 border rounded-lg shadow-lg max-w-2xl mx-auto my-8">
      <h2 className="text-xl font-bold mb-4">Chat with Your Veterinarian</h2>

      {(socketStatus !== "connected" || connectionError) && (
        <p className="text-sm text-center text-yellow-600 mb-2">
          {connectionError || connectionStatusMessage()}
        </p>
      )}

      {connectionError && (
        <p className="text-sm text-center text-red-600 mb-3">
          {connectionError}
        </p>
      )}

      {vets.length > 0 && (
        <div className="mb-4">
          <label htmlFor="vet-select" className="block mb-2 font-medium">
            Select a Veterinarian:
          </label>
          <select
            id="vet-select"
            value={selectedVet}
            onChange={(e) => setSelectedVet(e.target.value)}
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {vets.map((vet) => (
              <option key={vet.id} value={vet.id}>
                {vet.first_name && vet.last_name
                  ? `${vet.first_name} ${vet.last_name}`
                  : vet.username}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="h-64 overflow-y-auto border rounded-lg p-4 mb-4 bg-gray-50">
        {messages.length === 0 ? (
          <p className="text-gray-500 text-center">
            No messages yet. Start the conversation!
          </p>
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
          disabled={!selectedVet}
        />
        <button
          onClick={sendMessage}
          disabled={!selectedVet || input.trim() === ""}
          className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-6 rounded-r-lg transition-colors"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatRoom;
