import React, {useState} from 'react';
import CloseSquare from '@/icons/CloseSquare';
import Image from 'next/image';


const CardModal = ({
    active,
    setActive,
    playerId,
    myId,
    cardsCount = 64,
    ws,
    card_back
  }) => {
  const cardsArray = Array(cardsCount).fill(null);
  if(!active) return null;

  const canSelectCard = myId === playerId;

  const handleCardClick = (index) => {
    if (!canSelectCard) return;
    ws.current.send(JSON.stringify({ 
        type: "CARD_CHOSEN", 
        payload: { playerId, cardIndex: index } 
    }));
    console.log(`Игрок ${myId} выбрал карту №${index}`);
    setActive(false);

  };

  return (
    <div className={'w-screen h-screen bg-[rgba(60,_53,_133,_0.5)] backdrop-filter backdrop-blur-[2px] fixed top-0 left-0 flex items-center justify-center z-50'}>
    <div className="p-5 rounded-xl bg-white text-black">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">
          Колода раздается для игрока {playerId}
        </h2>
        <button 
          onClick={() => setActive(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          <CloseSquare />
        </button>
      </div>

      <div className='bg-[#F8F9FC] p-4 rounded-2xl'>
        <div className="grid grid-cols-5 gap-4 max-h-[500px] overflow-y-auto">
          {cardsArray.map((_, index) => (
            <Image
              key={index}
              src={card_back}
              alt="card"
              width={0}
              height={0}
              sizes='100vw'
              className={`w-full object-cover rounded ${canSelectCard ? 'cursor-pointer hover:opacity-80' : 'opacity-50'}`}
              onClick={() => handleCardClick(index)}
            />
          ))}
        </div>
        {!canSelectCard && (
          <div className="mt-4 text-center text-gray-600">
            Ожидание выбора карты от игрока {playerId}
          </div>
        )}
      </div>
    </div>
  </div>
  );
};

export default CardModal;