import Circle from '@/icons/Circle';
import Dice from '@/icons/Dice';
import GiveCard from '@/icons/GiveCard';
import GiveObject from '@/icons/GiveObject';
import Leave from '@/icons/Leave';
import React, { useRef, useState } from 'react';
import ReactDOM from 'react-dom';

const Action = ({ active, coordinates, setActive, id, onMoveChip, onCardIssue, onObjectPick }) => {
  if (!active || !coordinates) return null; 
  console.log(id)
  const style = {
    position: 'absolute',
    top: coordinates.top + coordinates.height + 5 + 'px',
    left: coordinates.left + 'px',
    zIndex: 30,
  };

  return ReactDOM.createPortal(
    <div
      style={style}
      className="flex flex-col items-center max-w-52 bg-[#9092a7ee] rounded-xl divide-y divide-white/10"
      onClick={() => setActive(false)}
    >
      {[
        { icon: <Dice />, text: "Бросать кубик" },
        { icon: <Circle />, text: "Двигать фишку", onClick: () => onMoveChip(id) },
        { icon: <GiveCard />, text: "Выдать карту", onClick: () => onCardIssue(id) },
        { icon: <GiveObject />, text: "Выдать объект", onClick: () => onObjectPick(id) },
        { icon: <Leave />, text: "Удалить из игры" },
      ].map(({ icon, text, onClick }, index) => (
        <button
          key={index}
          className="flex items-center w-full px-4 py-3 text-white hover:bg-[#7d8097] transition rounded-none"
          onClick={onClick}
        >
          <div className="w-6 h-6 flex items-center justify-center">{icon}</div>
          <span className="flex-1 text-left pl-3">{text}</span>
        </button>
      ))}
    </div>
,
    document.body
  );
};

export default Action;
