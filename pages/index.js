import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useGame } from '@/context/game';
import useMediaStream from '@/hooks/useMediaStream';
import usePeer from '@/hooks/usePeer';
import Bottom from '@/components/Bottom';
import DeckModal from '@/components/Modal/Deck';

export default function Home() {
  const router = useRouter();
  const [roomId, setRoomId] = useState('');
  const videoRef = useRef(null);
  const { stream } = useMediaStream();
  const { peer, myId } = usePeer()
  const [gameFile, setGameFile] = useState(null);
  const [coverFile, setCoverFile] = useState(gameFile);
  const [rulesFile, setRulesFile] = useState(gameFile);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream])

  

  const createAndJoin = async () => {
    try {
      if (!gameFile) {
        alert("Выберите файл для game_pdf");
        return;
      }
  
      const formData = new FormData();
      formData.append('title', 'test game');
      formData.append('description', 'Generated from frontend');
      formData.append('max_players', 4);
      formData.append('creator_id', myId);
  
      formData.append('game_pdf', gameFile);
      if (coverFile) formData.append('cover_pdf', coverFile);
      if (rulesFile) formData.append('rules_pdf', rulesFile);
  
      const response = await axios.post('http://localhost:8000/api/v1/game', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
  
      const newRoomId = response.data.id;
      console.log("✅ Game created with id:", newRoomId);
      router.push(`/${newRoomId}`);
    } catch (error) {
      console.error("❌ Failed to create game:", error);
      alert("Failed to create room. Try again.");
    }
  };
  
  

  const joinRoom = () => {
    if (roomId) router.push(`/${roomId}`);
    else alert("Please provide a valid room id");
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen text-white">
      <div className='w-[520px] flex flex-col items-center'>

        <h1 className="text-[42px] font-bold mb-1">Начало игровой сессии</h1>
        <p className='text-base text-[#C5C6D0]'>Настройте видео прежде чем начать</p>

        <div className="mb-6 w-[520px] h-[320px] bg-black rounded overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover transform scale-x-[-1]"
        />

        </div>
        <div className="flex flex-col w-full gap-4">
          <p>Ссылка на сессию</p>
          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <input 
              className="px-4 py-3 bg-indigo-950 rounded-md border border-white flex-1 focus:outline-none focus:ring-2 focus:ring-orange-400"
              placeholder="Enter Room ID" 
              value={roomId} 
              onChange={(e) => setRoomId(e?.target?.value)}
            />
          </div>
          <p>Выберите камеру</p>
          <div className="flex flex-col sm:flex-row gap-4 w-full ">
            <input 
              className="px-4 py-3 bg-indigo-950 rounded-md border border-white flex-1 focus:outline-none focus:ring-2 focus:ring-orange-400"
              placeholder="выберите камеру" 
              value={roomId} 
              onChange={(e) => setRoomId(e?.target?.value)}
            />
            <button 
              onClick={joinRoom}
              className="bg-orange-500 hover:bg-orange-600 px-6 py-3 rounded-md transition-colors duration-200"
            >
              Войти
            </button>
          </div>


          <div className='flex flex-row justify-between items-center'>
          <input 
            type="file" 
            onChange={(e) => setGameFile(e.target.files[0])} 
          />
          <button 
            onClick={createAndJoin}
            className="bg-orange-500 hover:bg-orange-600 px-6 py-3 rounded-md transition-colors duration-200"
          >
            Create a new room
          </button>

          </div>
        </div>
      </div>
    </div>
  );
}