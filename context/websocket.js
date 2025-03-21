import { createContext, useContext, useEffect, useRef, useState } from "react";

const SocketContext = createContext(null);

export const useWebSocket = () => useContext(SocketContext);

export const WebSocketProvider = ({ children, roomId, clientId }) => {
  const socketRef = useRef(null);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!roomId || !clientId) return;

    const ws = new WebSocket(`ws://localhost:8000/api/v1/websocket/ws/${roomId}/${clientId}`);
    socketRef.current = ws;

    ws.onopen = () => {
      console.log("✅ WebSocket connected");
    };

    ws.onmessage = (event) => {
      console.log("📨 Received:", event.data);
      setMessages((prev) => [...prev, event.data]);
    };

    ws.onerror = (err) => {
      console.error("❌ WebSocket error:", err);
    };

    ws.onclose = () => {
      console.log("🔌 WebSocket disconnected");
    };

    return () => {
      ws.close();
    };
  }, [roomId, clientId]);

  const sendMessage = (message) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(message);
    }
  };

  const value = {
    sendMessage,
    messages,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
