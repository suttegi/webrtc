import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Стартуем API, если надо
    fetch('/api/socket').then(() => {
      const connection = io(); // Добавь сюда path если указал на сервере
      console.log("✅ Socket connection established", connection);
      setSocket(connection);

      connection.on('connect_error', (err) => {
        console.log("🚨 Error establishing socket", err);
      });

      // Clean up при размонтировании
      return () => {
        console.log("🧹 Cleaning up socket");
        connection.disconnect();
      };
    });
  }, []);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};
