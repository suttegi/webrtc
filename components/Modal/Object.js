import React, {useState} from 'react';
import CloseSquare from '@/icons/CloseSquare';
import Image from 'next/image';


const ObjectModal = ({
    active,
    setActive,
    objects = [], 
    onSelect
  }) => {
  const [selectedIndex, setSelectedIndex] = useState(null);

  const handleChoose = () => {
    if (selectedIndex === null) {
      alert("Сначала выберите объект");
      return;
    }
    const chosenObject = objects[selectedIndex];
    onSelect?.(chosenObject); 
    setActive(false);
  };

  if(!active) return null;
  return (
    <div className={'w-screen h-screen bg-[rgba(60,_53,_133,_0.5)] backdrop-filter backdrop-blur-[2px] fixed top-0 left-0 flex items-center justify-center z-50'}>
      <div className="p-5 rounded-xl bg-white text-black">
      <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            Выберите объект
          </h2>
          <button 
            onClick={() => setActive(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <CloseSquare />
          </button>
        </div>
        <div className="grid grid-cols-5 gap-4 max-h-[300px] overflow-y-auto mb-4">
          {objects.map((item, index) => {
            const src = typeof item === 'string' ? item : item.src;
            const alt = typeof item === 'string' ? '' : (item.alt || '');

            const isSelected = selectedIndex === index;

            return (
              <div
                key={index}
                onClick={() => setSelectedIndex(index)}
                className={`cursor-pointer p-1 rounded-md border-2 ${
                  isSelected ? 'border-[#5D4FBA]' : 'border-transparent'
                }`}
              >
                <Image
                  src={objects}
                  alt={alt}
                  width={0}
                  height={0}
                  sizes='100vw'
                  className="w-full h-auto object-contain"
                />
              </div>
            );
          })}
        </div>

        <div className="flex w-full">
          <button
            onClick={() => setActive(false)}
            className="text-[#989ABD] px-4 py-2 w-1/2"
          >
            Отмена
          </button>
          <button
            onClick={handleChoose}
            className="bg-[#5D4FBA] text-white px-6 py-2 rounded-md hover:bg-[#4a3ea9] w-1/2"
          >
            Выбрать
          </button>
        </div>

      </div>
    </div>
  );
};

export default ObjectModal;