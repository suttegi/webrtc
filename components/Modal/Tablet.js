import React, {useState} from 'react';
import CloseSquare from '@/icons/CloseSquare';
import Image from 'next/image';


const CardModal = ({
    active,
    setActive,
    myId,
  }) => {
  if(!active) return null;

  return (
    <div className={'w-screen h-screen bg-[rgba(60,_53,_133,_0.5)] backdrop-filter backdrop-blur-[2px] fixed top-0 left-0 flex items-center justify-center z-50'}>
    <div className="p-5 rounded-xl bg-white text-black">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">
          Мой планшет
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
            <h2 className="text-xl font-bold">
            Мои карты
            </h2>
        </div>
      </div>

      <div className='bg-[#F8F9FC] p-4 rounded-2xl'>
        <div className="grid grid-cols-5 gap-4 max-h-[500px] overflow-y-auto">
            <h2 className="text-xl font-bold">
            Мои объекты
            </h2>
        </div>
      </div>
    </div>
  </div>
  );
};

export default CardModal;