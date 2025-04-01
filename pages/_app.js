import "@/styles/globals.css";

import { SocketProvider } from "@/context/socket";
import { WebSocketProvider } from "@/context/websocket";
import { GameProvider } from "@/context/game";

export default function App({ Component, pageProps }) {
  return (
    <GameProvider>
      <WebSocketProvider>
        <SocketProvider>
          <Component {...pageProps} />
        </SocketProvider>
      </WebSocketProvider>
    </GameProvider>
  );
}
