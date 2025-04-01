/* eslint-disable @next/next/no-img-element */
import React, {useState} from 'react';
import CloseSquare from '@/icons/CloseSquare';

const CardChoosedModal = ({
    active,
    setActive,
    cardData,
    playerId,
  }) => {
  if(!active) return null;
  return (
    <div className={'w-screen h-screen bg-[rgba(60,_53,_133,_0.5)] backdrop-filter backdrop-blur-[2px] fixed top-0 left-0 flex items-center justify-center z-50'}>
      <div className="p-5 rounded-xl bg-white text-black">
      <div className="flex justify-between items-center mb-4">
          <h2 className="max-w-min text-xl font-bold">
            {playerId} выбрал карту
          </h2>
          <button 
            onClick={() => setActive(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <CloseSquare />
          </button>
        </div>

        <div className='bg-[#F8F9FC] p-4 w-60 rounded-2xl'>
                <img
                src="/card_back.png"
                alt="card"
                className="w-full object-cover rounded"
                />
        </div>

        <button 
            className="w-full border border-indigo-950 py-2 rounded-xl"
            onClick={() => setActive(false)}
            >
            Закрыть
        </button>



      </div>
    </div>
  );
};

export default CardChoosedModal;