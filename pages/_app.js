import "@/styles/globals.css";

import { SocketProvider } from "@/context/socket";
import { WebSocketProvider } from "@/context/websocket";

export default function App({ Component, pageProps }) {
  return (
    <WebSocketProvider>

      <SocketProvider>
        <Component {...pageProps} />
      </SocketProvider>
    </WebSocketProvider>
  );
}
