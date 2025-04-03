import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const connection = io(`${process.env.NEXT_PUBLIC_IO_URL}`, { transports: ["websocket"] });

    console.log("Socket io connection established", connection);

    setSocket(connection);

    connection.on('connect_error', (err) => {
      console.log("Error establishing socket", err);
    });

    return () => {
      if (connection && connection.disconnect) {
        console.log("Cleaning up socket");
        connection.disconnect();
      }
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
