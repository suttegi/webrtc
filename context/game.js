import { createContext, useContext, useState } from 'react';

const GameContext = createContext();

export const GameProvider = ({ children }) => {
  const [gameData, setGameData] = useState(null);

  return (
    <GameContext.Provider value={{ gameData, setGameData }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => useContext(GameContext);
