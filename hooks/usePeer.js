import { useSocket } from "@/context/socket";
import { useRouter } from "next/router";
import { useState, useEffect, useRef } from "react";

const usePeer = () => {
  const socket = useSocket();
  const { query } = useRouter();
  const roomId = query.roomId;
  const [peer, setPeer] = useState(null);
  const [myId, setMyId] = useState('');
  const isPeerSet = useRef(false);
  useEffect(() => {
    if (isPeerSet.current || !socket) return;
    isPeerSet.current = true;

    (async function initPeer() {
      if (typeof window !== 'undefined') {
        const Peer = (await import('peerjs')).default;
        const storedPeerId = localStorage.getItem("peerId")
        const userId = localStorage.getItem("user_id");
        const myPeer = userId ? new Peer(userId) : new Peer();
        // const myPeer = storedPeerId ? new Peer(storedPeerId) : new Peer();

        setPeer(myPeer);

        myPeer.on('open', (id) => {
          console.log(`Your peer id is ${id}`);
          setMyId(id);
          localStorage.setItem("peerId", id);
        });
      }
    })();
  }, [roomId, socket]);

  useEffect(() => {
    if (!roomId || !socket || !myId) return;
    console.log("тут есть рум айди " + roomId + " пользователь: " + myId);
    socket.emit('join-room', roomId, myId);
  }, [roomId, socket, myId]);

  return {
    peer,
    myId
  };
};

export default usePeer;
