import { useEffect, useState } from "react";
import { cloneDeep } from "lodash";
import { useRouter } from "next/router";

import { useSocket } from "@/context/socket";
import { useWebSocket } from "@/context/websocket";
import usePeer from "@/hooks/usePeer";
import useMediaStream from "@/hooks/useMediaStream";
import usePlayer from "@/hooks/usePlayer";

import Player from "@/component/Player";
import Bottom from "@/component/Bottom";
import CopySection from "@/component/CopySection";
import DrawingBoard from "@/component/DrawingBoard/DrawingBoard";

const Room = () => {
  const socket = useSocket();
  const ws = useWebSocket();
  const { roomId } = useRouter().query;
  const { peer, myId } = usePeer();
  const { stream } = useMediaStream();
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");

  

  const {
    players,
    setPlayers,
    playerHighlighted,
    nonHighlightedPlayers,
    toggleAudio,
    toggleVideo,
    leaveRoom,
  } = usePlayer(myId, roomId, peer);

  const [users, setUsers] = useState({});
  const [clientId, setClientId] = useState(null);

  useEffect(() => {
    if (!socket || !peer || !stream) return;

    const handleUserConnected = (newUser) => {
      console.log(`user connected: ${newUser}`);
      const call = peer.call(newUser, stream);
      call.on("stream", (incomingStream) => {
        setPlayers((prev) => ({
          ...prev,
          [newUser]: { url: incomingStream, muted: true, playing: true },
        }));
        setUsers((prev) => ({ ...prev, [newUser]: call }));
      });
    };

    socket.on("user-connected", handleUserConnected);
    return () => socket.off("user-connected", handleUserConnected);
  }, [peer, setPlayers, socket, stream]);

  useEffect(() => {
    if (!socket) return;

    const handleToggleAudio = (userId) => {
      setPlayers((prev) => {
        const copy = cloneDeep(prev);
        if (copy[userId]) copy[userId].muted = !copy[userId].muted;
        return { ...copy };
      });
    };

    const handleToggleVideo = (userId) => {
      setPlayers((prev) => {
        const copy = cloneDeep(prev);
        if (copy[userId]) copy[userId].playing = !copy[userId].playing;
        return { ...copy };
      });
    };

    const handleUserLeave = (userId) => {
      users[userId]?.close();
      const playersCopy = cloneDeep(players);
      delete playersCopy[userId];
      setPlayers(playersCopy);
    };

    socket.on("user-toggle-audio", handleToggleAudio);
    socket.on("user-toggle-video", handleToggleVideo);
    socket.on("user-leave", handleUserLeave);

    return () => {
      socket.off("user-toggle-audio", handleToggleAudio);
      socket.off("user-toggle-video", handleToggleVideo);
      socket.off("user-leave", handleUserLeave);
    };
  }, [players, setPlayers, socket, users]);

  useEffect(() => {
    if (!peer || !stream) return;

    peer.on("call", (call) => {
      const { peer: callerId } = call;
      call.answer(stream);
      call.on("stream", (incomingStream) => {
        setPlayers((prev) => ({
          ...prev,
          [callerId]: { url: incomingStream, muted: true, playing: true },
        }));
        setUsers((prev) => ({ ...prev, [callerId]: call }));
      });
    });
  }, [peer, setPlayers, stream]);


  //ws
  useEffect(() => {
    if (!roomId) return;
    let roomKey = `room_${roomId}_client_counter`;
    let lastClientId = parseInt(localStorage.getItem(roomKey) || '0', 10);
    setClientId(lastClientId);
    localStorage.setItem(roomKey, lastClientId + 1);
  }, [roomId]);

  useEffect(() => {
    if (!roomId || clientId === null) return;
  
    ws.current = new WebSocket(`ws://localhost:8000/api/v1/websocket/ws/room/${roomId}/${clientId}`);
  
    ws.current.onopen = () => console.log('✅ Chat WebSocket connected');
    ws.current.onclose = () => console.log('❌ Chat WebSocket disconnected');
    ws.current.onerror = (err) => console.error('⚠️ Chat WS error:', err);
  
    ws.current.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        setMessages((prev) => [
          ...prev,
          `${parsed.client_id === clientId ? 'You' : 'Client ' + parsed.client_id}: ${parsed.message}`
        ]);
      } catch {
        setMessages((prev) => [...prev, event.data]);
      }
    };
  
    return () => ws.current?.close();
  }, [roomId, clientId, ws]);

  const sendMessage = () => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(message);
      setMessages((prev) => [...prev, `You: ${message}`]);
      setMessage('');
    }
  };

  useEffect(() => {
    if (!stream || !myId) return;
    setPlayers((prev) => ({
      ...prev,
      [myId]: { url: stream, muted: true, playing: true },
    }));
  }, [myId, setPlayers, stream]);

  return (
    <div className="flex h-screen w-full bg-black">
      {/* Video Chat Section */}
      <div className="w-1/3 bg-gray-900 text-white flex flex-col p-4 gap-4 overflow-y-auto">
        <h2 className="text-xl font-bold mb-2">Video Chat</h2>

        {playerHighlighted && (
          <Player
            url={playerHighlighted.url}
            muted={playerHighlighted.muted}
            playing={playerHighlighted.playing}
            isActive
          />
        )}

      <Bottom
        muted={playerHighlighted?.muted}
        playing={playerHighlighted?.playing}
        toggleAudio={toggleAudio}
        toggleVideo={toggleVideo}
        leaveRoom={leaveRoom}
      />
        {Object.keys(nonHighlightedPlayers).map((playerId) => {
          const { url, muted, playing } = nonHighlightedPlayers[playerId];
          return (
            <Player
              key={playerId}
              url={url}
              muted={muted}
              playing={playing}
              isActive={false}
            />
          );
        })}

        <CopySection roomId={roomId} />

      </div>
      {/* Chat Section */}
      <div className="w-2/3 bg-white flex flex-col p-4 gap-4">
          <h2 className="text-xl font-bold mb-2">Chat</h2>

          <div className="flex flex-col gap-2 mb-4 max-h-[500px] overflow-y-auto bg-gray-800 p-4 rounded-lg">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.startsWith('You:') ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`p-3 rounded-lg max-w-[70%] ${
                    msg.startsWith('You:') ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-200'
                  }`}
                >
                  {msg}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-4">
            <input
              type="text"
              className="flex-1 p-3 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            />
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition"
              onClick={sendMessage}
            >
              Send
            </button>
          </div>
        </div>

    </div>
  );
};

export default Room;