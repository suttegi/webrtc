/* eslint-disable react/jsx-key */
import React, { useState, useRef, useEffect } from "react";

const GameBoard = ({ chipPositions, players, currentTurn, ws, field, chips }) => {
  const boardRef = useRef(null);
  const [boardWidth, setBoardWidth] = useState(0);
  const [dragging, setDragging] = useState(null);
  const [dragPosition, setDragPosition] = useState(null);

  useEffect(() => {
    if (boardRef.current) {
      setBoardWidth(boardRef.current.offsetWidth);
    }
  }, [boardRef.current]);

  const icons = [<img src={chips} alt="chip" className="w-8 h-8" />];
  const playerIcons = Object.fromEntries(
    Object.keys(players).map((playerId) => [playerId, icons[0]])
  );

  const getEventPos = (e) => {
    let clientX, clientY;
    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if (e.changedTouches && e.changedTouches.length > 0) {
      clientX = e.changedTouches[0].clientX;
      clientY = e.changedTouches[0].clientY;
    } else {
      clientX = e.clientX || 0;
      clientY = e.clientY || 0;
    }
    const boardRect = boardRef.current.getBoundingClientRect();
    return {
      x: (clientX - boardRect.left),
      y: (clientY - boardRect.top),
    };
  };
  

  const handleStart = (e, playerId) => {
    if (playerId !== currentTurn) return;
    e.preventDefault();
    const pos = getEventPos(e);
    setDragging({
      playerId,
      offset: { x: pos.x, y: pos.y },
    });
    setDragPosition({ x: pos.x, y: pos.y });
  };

  const handleMove = (e) => {
    if (!dragging) return;
    e.preventDefault();
    const pos = getEventPos(e);
    setDragPosition({ x: pos.x, y: pos.y });
    if (ws && ws.current) {
      ws.current.send(
        JSON.stringify({
          type: "DRAG_MOVE",
          payload: { playerId: dragging.playerId, pos: { x: pos.x, y: pos.y } },
        })
      );
    }
  };

  const handleEnd = (e) => {
    if (!dragging) return;
    e.preventDefault();
    const pos = getEventPos(e);
    if (ws && ws.current) {
      ws.current.send(
        JSON.stringify({
          type: "MOVE",
          payload: { playerId: dragging.playerId, move: { x: pos.x, y: pos.y } },
        })
      );
    }
    setDragging(null);
    setDragPosition(null);
  };

  useEffect(() => {
    if (dragging) {
      // добавляем обработчики как для мыши, так и для touch-событий
      window.addEventListener("mousemove", handleMove);
      window.addEventListener("mouseup", handleEnd);
      window.addEventListener("touchmove", handleMove);
      window.addEventListener("touchend", handleEnd);
      window.addEventListener("touchcancel", handleEnd);
    } else {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleEnd);
      window.removeEventListener("touchmove", handleMove);
      window.removeEventListener("touchend", handleEnd);
      window.removeEventListener("touchcancel", handleEnd);
    }
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleEnd);
      window.removeEventListener("touchmove", handleMove);
      window.removeEventListener("touchend", handleEnd);
      window.removeEventListener("touchcancel", handleEnd);
    };
  }, [dragging]);

  // Вычисляем общее количество игроков (фишек)
  const playerIds = Object.keys(players);
  const chipCount = playerIds.length;
  // Фиксированный шаг для размещения фишек
  const step = 50;
  // Вычисляем начальное смещение для центрирования ряда фишек
  const leftStart = (boardWidth - chipCount * step) / 2;


  const isPDF = field && field.toLowerCase().endsWith(".pdf");


  return (
    <div
      ref={boardRef}
      style={{
        position: "relative",
        display: "inline-block",
        userSelect: "none",
        marginTop: "20px",
      }}
    >
      <div style={{ position: "relative" }}>
        {playerIds.map((playerId, index) => {
          const pos = chipPositions[playerId] || {};
          if (dragging && dragging.playerId === playerId) return null;
          return (
            <div
              key={playerId}
              onMouseDown={(e) => handleStart(e, playerId)}
              onTouchStart={(e) => handleStart(e, playerId)}
              style={{
                position: "absolute",
                left: pos.x !== undefined ? pos.x : leftStart + index * step,
                top: pos.y !== undefined ? pos.y : -40,
                cursor: "pointer",
              }}
            >
              {playerIcons[playerId] || "❓"}
            </div>
          );
        })}
      </div>
      {isPDF ? (
        <iframe
        src={`${field}#toolbar=0&navpanes=0&scrollbar=0`}
        style={{ display: "block", width: "100%", height: "100%", border: "none" }}
        title="PDF Viewer"
      />
      ) : (
        <img
          src={field}
          alt="meow"
          style={{ display: "block" }}
          draggable={false}
        />
      )}
      {dragging && dragPosition && (
        <div
          style={{
            position: "absolute",
            top: dragPosition.y - 16,
            left: dragPosition.x - 16,
            pointerEvents: "none",
          }}
        >
          {playerIcons[dragging.playerId] || "❓"}
        </div>
      )}
    </div>
  );
};

export default GameBoard;
