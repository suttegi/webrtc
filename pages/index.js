'use client'
import { Mic, Video, PhoneOff, MicOff, VideoOff } from "lucide-react";
import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import useMediaStream from '@/hooks/useMediaStream';
import usePeer from '@/hooks/usePeer';


// function parseJwt(token) {
//   try {
//     const base64Url = token.split(".")[1];
//     if (!base64Url) return null;
//     const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
//     const jsonPayload = decodeURIComponent(
//       atob(base64)
//         .split("")
//         .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
//         .join("")
//     );
//     return JSON.parse(jsonPayload);
//   } catch (error) {
//     console.error("Error parsing JWT:", error);
//     return null;
//   }
// }


export default function Home() {
  const router = useRouter();
  const [roomId, setRoomId] = useState('');
  const videoRef = useRef(null);
  const { stream: initialStream } = useMediaStream();
  const { peer, myId } = usePeer();

  const [localStream, setLocalStream] = useState(null);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [cameras, setCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState("");

  // useEffect(() => {
  //   const getCookie = (name) => {
  //     const value = `; ${document.cookie}`;
  //     const parts = value.split(`; ${name}=`);
  //     if (parts.length === 2) return parts.pop().split(";").shift();
  //     return null;
  //   };

  //   const authToken = getCookie("auth_token");
  //   if (authToken) {
  //     localStorage.setItem("auth_token", authToken);
  //     const parsed = parseJwt(authToken);
  //     if (parsed && parsed.user_id) {
  //       localStorage.setItem("user_id", parsed.user_id);
  //     }
  //   }
  // }, []);

  console.log(process.env.NEXT_PUBLIC_API_URL);

  // useEffect(() => {
  //   navigator.mediaDevices.enumerateDevices().then((devices) => {
  //     const videoDevices = devices.filter((device) => device.kind === "videoinput");
  //     setCameras(videoDevices);
  //     if (videoDevices.length > 0) {
  //       setSelectedCamera(videoDevices[0].deviceId);
  //     }
  //   });
  // }, []);

  useEffect(() => {
    if (initialStream && !localStream) {
      setLocalStream(initialStream);
      if (videoRef.current) {
        videoRef.current.srcObject = initialStream;
      }
    }
  }, [initialStream, localStream]);

  const toggleVideo = async () => {
    if (!localStream) {
      console.log('toggleVideo: localStream is undefined');
      return;
    }

    if (isVideoOn) {
      localStream.getVideoTracks().forEach((track, idx) => {
        track.stop();
      });
      setIsVideoOn(false);
    } else {
      try {
        const newStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: isAudioOn 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = newStream;
        }
        setLocalStream(newStream);
        setIsVideoOn(true);
      } catch (error) {
        console.error('restarting video:', error);
      }
    }
  };

  const toggleAudio = async () => {
    if (!localStream) {
      return;
    }

    if (isAudioOn) {

      localStream.getAudioTracks().forEach((track, idx) => {
        track.stop();
      });
      setIsAudioOn(false);
    } else {
      try {
        const newStream = await navigator.mediaDevices.getUserMedia({
          video: false,
          audio: true,
        });
        const videoTracks = localStream.getVideoTracks();
        const combinedStream = new MediaStream([...videoTracks, ...newStream.getAudioTracks()]);
        if (videoRef.current) {
          videoRef.current.srcObject = combinedStream;
        }
        setLocalStream(combinedStream);
        setIsAudioOn(true);
      } catch (error) {
        console.error('Error restarting audio:', error);
      }
    }
  };

  const joinRoom = () => {
    if (roomId) router.push(`/${roomId}`);
    else alert("Please provide a valid room id");
  };

  const switchCamera = async () => {
    if (!cameras.length) return;
    const currentIndex = cameras.findIndex(cam => cam.deviceId === selectedCamera);
    const nextIndex = (currentIndex + 1) % cameras.length;
    setSelectedCamera(cameras[nextIndex].deviceId);
    
    const newStream = await navigator.mediaDevices.getUserMedia({
      video: { deviceId: cameras[nextIndex].deviceId },
      audio: isAudioOn,
    });
    setLocalStream(newStream);
    videoRef.current.srcObject = newStream;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-white px-4">
  <div className='w-full max-w-[520px] flex flex-col items-center'>
    <h1 className="text-[42px] font-bold mb-1">Начало игровой сессии</h1>
    <p className='text-base text-[#C5C6D0]'>Настройте видео прежде чем начать</p>

    <div className="mb-6 w-full max-w-[520px] h-[320px] bg-black rounded overflow-hidden relative">
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="w-full h-full object-cover transform scale-x-[-1]"
      />
    </div>
    <div className="flex flex-row gap-2">
      <button 
        onClick={toggleAudio}
        className="bg-gray-800 px-3 py-2 rounded-md text-sm"
      >
        {isAudioOn ? <Mic /> : <MicOff />}
      </button>
      <button 
        onClick={toggleVideo}
        className="bg-gray-800 px-3 py-2 rounded-md text-sm"
      >
        {isVideoOn ? <Video /> : <VideoOff />}
      </button>
      <button onClick={switchCamera} className="w-12 h-12 bg-gray-800 rounded-md flex items-center justify-center sm:hidden">
        🔄
      </button>
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
      {/* <p>Выберите камеру</p>
      <div className="hidden sm:flex flex-col sm:flex-row gap-4 w-full">
        <select
          className="px-4 py-3 bg-indigo-950 rounded-md border border-white flex-1 focus:outline-none focus:ring-2 focus:ring-orange-400"
          value={selectedCamera}
          onChange={(e) => setSelectedCamera(e.target.value)}
        >
          {cameras.map((camera) => (
            <option key={camera.deviceId} value={camera.deviceId}>{camera.label}</option>
          ))}
        </select>
        <button 
          onClick={joinRoom}
          className="bg-orange-500 hover:bg-orange-600 px-6 py-3 rounded-md transition-colors duration-200"
        >
          Войти
        </button>
      </div> */}
    </div>
  </div>
</div>

  );
}
