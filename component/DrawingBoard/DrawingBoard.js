import { useRef, useEffect, useState } from "react";
import { useSocket } from "@/context/socket";
import { useRouter } from "next/router";

const DrawingBoard = () => {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const isDrawing = useRef(false);

  const socket = useSocket();
  const { roomId } = useRouter().query;

  const [color, setColor] = useState("#000000");
  const [lineWidth, setLineWidth] = useState(3);

  useEffect(() => {
    if (socket && roomId) {
      socket.emit('join-room', roomId);
      console.log('Joined room:', roomId);
    }
  }, [socket, roomId]);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth * 0.66;
    canvas.height = window.innerHeight;
    canvas.style.background = "#fff";
    const ctx = canvas.getContext("2d");
    ctx.lineCap = "round";
    ctxRef.current = ctx;
  }, []);

  const startDrawing = (e) => {
    isDrawing.current = true;
    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    prevPos.current = { x, y };
  };
  

  const endDrawing = () => {
    isDrawing.current = false;
    ctxRef.current.beginPath();
  };

  const prevPos = useRef({ x: 0, y: 0 });

  const draw = (e) => {
    if (!isDrawing.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;
  
    // Рисуем на локальном канвасе
    ctxRef.current.strokeStyle = color;
    ctxRef.current.lineWidth = lineWidth;
    ctxRef.current.beginPath();
    ctxRef.current.moveTo(prevPos.current.x, prevPos.current.y);
    ctxRef.current.lineTo(x, y);
    ctxRef.current.stroke();
  
    socket.emit("draw", { roomId, x0: prevPos.current.x, y0: prevPos.current.y, x1: x, y1: y, color, lineWidth });
    console.log(roomId)
  
    prevPos.current = { x, y };
  };
  

  useEffect(() => {
    const resizeCanvas = () => {
      const canvas = canvasRef.current;
      const ctx = ctxRef.current;
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      canvas.width = window.innerWidth * 0.66;
      canvas.height = window.innerHeight;
      ctx.putImageData(imageData, 0, 0);
    };
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);
  

  useEffect(() => {
    if (!socket) return;
    const ctx = ctxRef.current;
    const handleDraw = ({ x0, y0, x1, y1, color, lineWidth }) => {
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.stroke();
      ctx.closePath();
    };
  
    socket.on("draw", handleDraw);
  
    return () => socket.off("draw", handleDraw);
  }, [socket]);

  // Очистка доски (опционально)
  const clearBoard = () => {
    const canvas = canvasRef.current;
    ctxRef.current.clearRect(0, 0, canvas.width, canvas.height);
    socket.emit("clear-board");
  };

  useEffect(() => {
    if (!socket) return;
    const handleClear = () => {
      const canvas = canvasRef.current;
      ctxRef.current.clearRect(0, 0, canvas.width, canvas.height);
    };
    socket.on("clear-board", handleClear);
    return () => socket.off("clear-board", handleClear);
  }, [socket]);

  return (
    <div className="relative w-full h-full bg-white">
      <canvas
        ref={canvasRef}
        className="border"
        onMouseDown={startDrawing}
        onMouseUp={endDrawing}
        onMouseMove={draw}
        onMouseLeave={endDrawing}
        onTouchStart={startDrawing}
        onTouchEnd={endDrawing}
        onTouchMove={draw}
        />
      <div className="absolute top-4 left-4 flex gap-2 bg-white p-2 rounded shadow">
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
        />
        <input
          type="range"
          min="1"
          max="10"
          value={lineWidth}
          onChange={(e) => setLineWidth(e.target.value)}
        />
        <button onClick={clearBoard} className="bg-red-500 text-white px-2 py-1 rounded">Очистить</button>
      </div>
    </div>
  );
};

export default DrawingBoard;
