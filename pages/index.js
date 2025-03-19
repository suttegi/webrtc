import { v4 as uuidv4 } from 'uuid';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Home() {
  const router = useRouter();
  const [roomId, setRoomId] = useState('');

  const createAndJoin = () => {
    const roomId = uuidv4();
    router.push(`/${roomId}`);
  };

  const joinRoom = () => {
    if (roomId) router.push(`/${roomId}`);
    else {
      alert("Please provide a valid room id");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-indigo-950 text-white p-6">
      <h1 className="text-3xl font-bold mb-8">Начало игровой сессии</h1>
      <p className=''>Настройте видео прежде чем начать</p>
      <div className="flex flex-col w-full max-w-md gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <input 
            className="px-4 py-3 bg-indigo-900 rounded-md border border-indigo-800 flex-1 focus:outline-none focus:ring-2 focus:ring-orange-400"
            placeholder="Enter Room ID" 
            value={roomId} 
            onChange={(e) => setRoomId(e?.target?.value)}
          />
          <button 
            onClick={joinRoom}
            className="bg-orange-500 hover:bg-orange-600 px-6 py-3 rounded-md transition-colors duration-200"
          >
            Join Room
          </button>
        </div>
        <div className="flex items-center justify-center w-full my-4">
          <span className="text-gray-400">--------------- OR ---------------</span>
        </div>
        <button 
          onClick={createAndJoin}
          className="bg-orange-500 hover:bg-orange-600 px-6 py-3 rounded-md transition-colors duration-200"
        >
          Create a new room
        </button>
      </div>
    </div>
  );
}