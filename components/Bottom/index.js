import { Mic, Video, PhoneOff, MicOff, VideoOff } from "lucide-react";

const Bottom = ({ muted, playing, toggleAudio, toggleVideo, leaveRoom }) => {
  return (
    <div className="bottom-5 left-0 right-0 flex justify-between w-[200px]">
      {muted ? (
        <MicOff
          className="p-4 text-white cursor-pointer bg-secondary hover:bg-buttonPrimary bg-[#FFFFFF33] rounded-lg"
          size={55}
          onClick={toggleAudio}
        />
      ) : (
        <Mic
          className="p-4 text-white cursor-pointer bg-secondary hover:bg-buttonPrimary bg-[#FFFFFF33] rounded-lg"
          size={55}
          onClick={toggleAudio}
        />
      )}
      {playing ? (
        <Video
          className="p-4  text-white cursor-pointer bg-secondary hover:bg-buttonPrimary bg-[#FFFFFF33] rounded-lg"
          size={55}
          onClick={toggleVideo}
        />
      ) : (
        <VideoOff
          className="p-4  text-white cursor-pointer bg-secondary hover:bg-buttonPrimary bg-[#FFFFFF33] rounded-lg"
          size={55}
          onClick={toggleVideo}
        />
      )}
      <PhoneOff
        size={55}
        className="p-4 text-white cursor-pointer bg-secondary hover:bg-buttonPrimary bg-customPink rounded-lg"
        onClick={leaveRoom}
      />
    </div>
  );
};

export default Bottom;

