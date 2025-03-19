import { useEffect, useState } from "react";
import { cloneDeep } from "lodash";
import { useRouter } from "next/router";
import { useSocket } from "@/context/socket";
import usePeer from "@/hooks/usePeer";
import useMediaStream from "@/hooks/useMediaStream";
import usePlayer from "@/hooks/usePlayer";
import Player from "@/component/Player";
import Bottom from "@/component/Bottom";
import CopySection from "@/component/CopySection";

const Room = () => {
  const socket = useSocket();
  const { roomId } = useRouter().query;
  const { peer, myId } = usePeer();
  const { stream } = useMediaStream();
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");

  const { players, setPlayers, playerHighlighted, nonHighlightedPlayers, toggleAudio, toggleVideo, leaveRoom } =
    usePlayer(myId, roomId, peer);
  const [users, setUsers] = useState({});

  // Присоединяемся к комнате при загрузке
  useEffect(() => {
    if (!socket || !roomId || !myId) return;
    socket.emit('join-room', roomId, myId);
  }, [socket, roomId, myId]);

  // Обрабатываем получение сообщений
  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = ({ message, userId }) => {
      setMessages((prev) => [...prev, { message, userId }]);
    };

    socket.on('receive-message', handleReceiveMessage);
    return () => socket.off('receive-message', handleReceiveMessage);
  }, [socket]);

  // Отправка сообщения
  const sendMessage = () => {
    if (!message.trim() || !roomId || !myId) return;
    socket.emit('send-message', { roomId, message, userId: myId });
    setMessage(''); // Очищаем поле ввода после отправки
  };

  // Обработка подключения новых пользователей
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

  // Обработка переключения аудио/видео и выхода
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
            <Player key={playerId} url={url} muted={muted} playing={playing} isActive={false} />
          );
        })}
        <CopySection roomId={roomId} />
      </div>

      {/* Chat Section */}
      <div className="w-2/3 bg-white flex flex-col p-4 gap-4">
        <h2 className="text-xl font-bold mb-2">Chat</h2>
        <div className="flex-1 overflow-y-auto border rounded p-2">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`mb-2 ${msg.userId === myId ? 'text-blue-600' : 'text-black'}`}
            >
              <strong>{msg.userId === myId ? 'You' : msg.userId}:</strong> {msg.message}
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            className="flex-1 border rounded p-2"
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          />
          <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={sendMessage}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Room;