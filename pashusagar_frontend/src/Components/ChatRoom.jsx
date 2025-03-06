import React, { useEffect, useState, useRef } from "react";

const ChatRoom = () => {
  // Use a fixed room name for consultation chat
  const roomName = "consultation";

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  // State to hold list of veterinarians
  const [vets, setVets] = useState([]);
  // State to hold selected veterinarian's ID
  const [selectedVet, setSelectedVet] = useState("");

  const socketRef = useRef(null);

  // Get current user's id from localStorage.
  const senderId = localStorage.getItem("user_id");

  // Fetch the list of veterinarians (assuming your API returns an array of {id, username})
  useEffect(() => {
    const fetchVets = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/api/vets/");
        if (response.ok) {
          const data = await response.json();
          setVets(data);
          // Optionally, set a default veterinarian if available.
          if (data.length > 0) {
            setSelectedVet(data[0].id);
          }
        } else {
          console.error("Failed to fetch veterinarians");
        }
      } catch (error) {
        console.error("Error fetching veterinarians:", error);
      }
    };

    fetchVets();
  }, []);

  // Establish WebSocket connection to your backend
  useEffect(() => {
    const wsScheme = window.location.protocol === "https:" ? "wss" : "ws";
    // Explicitly use your backend's address and port.
    const backendHost = "127.0.0.1:8000";
    const socketUrl = `${wsScheme}://${backendHost}/ws/chat/${roomName}/`;
    console.log("Connecting to", socketUrl);
    socketRef.current = new WebSocket(socketUrl);

    socketRef.current.onopen = () => {
      console.log("WebSocket connection established.");
    };

    socketRef.current.onmessage = (e) => {
      const data = JSON.parse(e.data);
      setMessages((prev) => [...prev, data]);
    };

    socketRef.current.onclose = (e) => {
      console.error("WebSocket closed unexpectedly");
    };

    socketRef.current.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return () => {
      if (socketRef.current) socketRef.current.close();
    };
  }, [roomName]);

  const sendMessage = () => {
    if (input.trim() === "") return;

    // Ensure the socket is open
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      console.error("WebSocket is not open. Unable to send message.");
      return;
    }

    const messageData = {
      sender: senderId,
      recipient: selectedVet, // The selected veterinarian's ID
      message: input,
    };

    socketRef.current.send(JSON.stringify(messageData));

    // Optionally update the UI immediately
    setMessages((prev) => [
      ...prev,
      {
        sender: "You",
        message: input,
        timestamp: new Date().toISOString(),
      },
    ]);
    setInput("");
  };

  return (
    <div className="p-4 border rounded-lg shadow-lg max-w-2xl mx-auto my-8">
      <h2 className="text-xl font-bold mb-4">Chat with Your Veterinarian</h2>

      {/* Veterinarian Selection */}
      {vets.length > 0 && (
        <div className="mb-4">
          <label htmlFor="vet-select" className="block mb-2">
            Select a Veterinarian:
          </label>
          <select
            id="vet-select"
            value={selectedVet}
            onChange={(e) => setSelectedVet(e.target.value)}
            className="p-2 border rounded"
          >
            {vets.map((vet) => (
              <option key={vet.id} value={vet.id}>
                {vet.username}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Chat Messages */}
      <div className="h-80 overflow-y-auto border p-2 mb-4">
        {messages.length === 0 ? (
          <p className="text-gray-500">
            No messages yet. Start the conversation!
          </p>
        ) : (
          messages.map((msg, index) => (
            <div key={index} className="mb-2">
              <strong>{msg.sender}:</strong> {msg.message}{" "}
              <span className="text-xs text-gray-500">
                ({new Date(msg.timestamp).toLocaleTimeString()})
              </span>
            </div>
          ))
        )}
      </div>

      {/* Input and Send Button */}
      <div className="flex">
        <input
          type="text"
          className="flex-grow p-2 border rounded-l-lg"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter") sendMessage();
          }}
        />
        <button
          onClick={sendMessage}
          className="bg-blue-500 text-white px-4 rounded-r-lg"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatRoom;
