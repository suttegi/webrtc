/* eslint-disable @next/next/no-img-element */
import React, {useState} from 'react';
import { ChevronDown } from "lucide-react"; 
import CloseSquare from '@/icons/CloseSquare';



const decksData = [
  {
    id: 1,
    title: "Название колоды",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua",
    imageUrl: "/deck.png", 
  },
  {
    id: 2,
    title: "Название колоды",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua",
    imageUrl: "/deck.png",
  },
  {
    id: 3,
    title: "Название колоды",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua",
    imageUrl: "/deck.png",
  },
];


const DeckModal = ({active, setActive, players }) => {
  const [selectedPlayers, setSelectedPlayers] = useState({});
  
  const [openDropdown, setOpenDropdown] = useState(null);
  
  const handleSelectPlayer = (deckId, playerName) => {
    setSelectedPlayers((prev) => ({
      ...prev,
      [deckId]: playerName,
    }));
    setOpenDropdown(null); 
  };
  
  const handleGiveDeck = (deckId) => {
    const chosenPlayer = selectedPlayers[deckId];
    if (!chosenPlayer) {
      alert("Сначала выберите игрока");
      return;
    }
    alert(`Раздали колоду (ID: ${deckId}) игроку ${chosenPlayer}`);
  };
  
  if(!active) return null;
  return (
    <div className={'w-screen h-screen bg-[rgba(60,_53,_133,_0.5)] backdrop-filter backdrop-blur-[2px] fixed top-0 left-0 flex items-center justify-center z-50'}>
      <div className="p-5 rounded-xl bg-white text-black">
      <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Колоды</h2>
          <button 
            onClick={() => setActive(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <CloseSquare />
          </button>
        </div>
      {decksData.map((deck) => (
          <div
            key={deck.id}
            className="bg-white rounded-lg shadow flex flex-col md:flex-row items-start md:items-center gap-4 p-4"
            >
            <div className="w-16 flex-shrink-0">
              <img
                src={deck.imageUrl}
                alt={deck.title}
                className="w-full h-full object-cover rounded-md"
              />
            </div>

            <div className="flex-1">
              <h3 className="text-lg font-semibold">{deck.title}</h3>
              <p className="text-sm text-gray-600">{deck.description}</p>
            </div>

            <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-2">
              <button
                onClick={() =>
                  setOpenDropdown((prev) => (prev === deck.id ? null : deck.id))
                }
                className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md flex items-center gap-2 hover:bg-gray-50"
              >
                {selectedPlayers[deck.id] || "Выберите игрока"}
                <ChevronDown className="w-4 h-4" />
              </button>

              {openDropdown === deck.id && (
                <div className="absolute top-12 left-0 bg-white border border-gray-200 shadow-md rounded-md w-48 z-10 [box-shadow:0px_0px_10px_rgba(33,_36,_79,_0.1)]">
                  <ul className="py-1">
                    {players.map((player) => (
                      <li
                        key={player}
                        onClick={() => handleSelectPlayer(deck.id, player)}
                        className="px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer"
                      >
                        {player}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DeckModal;
