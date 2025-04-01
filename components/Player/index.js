import { useRef, useEffect } from "react";
import { Mic, MicOff, UserSquare2 } from "lucide-react";

const Player = ({ url, muted, playing, isActive }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && url instanceof MediaStream) {
      videoRef.current.srcObject = url;
    }
  }, [url]);

  return (
    <div
      className={`relative overflow-hidden mb-5 h-full ${
        isActive
          ? "rounded-lg"
          : "rounded-md h-full shadow-[0_0_11px_-1px_rgba(0,0,0,0.75)]"
      } ${!playing ? "flex items-center justify-center" : ""}`}
    >
      {playing ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={muted} 
          style={{ transform: "scaleX(-1)", width: "100%", height: "100%" }}
        />
      ) : (
        <div
          className="flex items-center justify-center bg-gray-600 text-white rounded-full"
          style={{ transform: "scaleX(-1)", width: "100%", height: "150px" }}
        >
          <span className="text-3xl font-bold">A</span>
        </div>
      )}

      {!isActive &&
        (muted ? (
          <MicOff className="text-white absolute right-2 bottom-2" size={20} />
        ) : (
          <Mic className="text-white absolute right-2 bottom-2" size={20} />
        ))}
    </div>
  );
};

export default Player;
