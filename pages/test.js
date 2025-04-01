

<div className="flex justify-between h-screen bg-indigo-950 p-10">
        <div className="w-[250px] text-white flex flex-col p-4">
          <div className="flex flex-row gap-4 mb-4">
            <div className="bg-orange-500 p-3 rounded-xl w-[50px] h-[50px] flex items-center justify-center">
              {showCams ? (
                <button className="w-full h-full flex items-center justify-center" onClick={() => setShowCams(false)}>
                  <Close />
                </button>
              ) : (
                <button className="w-full h-full flex items-center justify-center" onClick={() => setShowCams(true)}>
                  <People />
                </button>
              )}
            </div>
            <div className="bg-[#4EB396] p-3 rounded-xl w-[50px] h-[50px] flex items-center justify-center">
              <button className="w-full h-full flex items-center justify-center" onClick={() => setIsDeckModalActive(true)}>
                <Cards />
              </button>
            </div>
          </div>

          {showCams && (
            <div className="flex flex-col gap-2 overflow-y-auto bg-[#A6A7B9] p-2 rounded-[10px]">
              <div className="text-[#21244F] font-bold">
                Участники ({Object.keys(players).length})
              </div>
              <div className="flex flex-col gap-2">
                {playerHighlighted && (
                  <div className="relative rounded-md overflow-hidden w-full">
                    <Player
                      url={playerHighlighted.url}
                      muted={playerHighlighted.muted}
                      playing={playerHighlighted.playing}
                      isActive
                    />
                    <div className="absolute bottom-3 left-2 bg-black/50 px-2 py-1 rounded">
                      Вы 
                    </div>
                    {myId === creatorId && (
                      <>
                        <button
                          onClick={(e) => handleOpenAction(e, myId)}
                          className="absolute top-3 right-1 bg-[#3C3585] text-white rounded w-6 h-6 flex justify-center items-center"
                        >
                          <More />
                        </button>
                      </>
                    )}
                    

                  </div>
                )}

                {Object.keys(nonHighlightedPlayers).map((playerId) => {
                  const { url, muted, playing } = nonHighlightedPlayers[playerId];
                  return (
                    <div key={playerId} className="relative rounded-md overflow-hidden">
                      <Player url={url} muted={muted} playing={playing} isActive={false} />
                      <div className="absolute bottom-1 left-2 bg-black/50 px-2 py-1 rounded text-xs">
                        Игрок {playerId}
                      </div>
                      {myId === creatorId && (
                      <>
                        <button
                          onClick={(e) => handleOpenAction(e, playerId)}
                          className="absolute top-3 right-1 bg-[#3C3585] text-white rounded w-6 h-6 flex justify-center items-center"
                        >
                          <More />
                        </button>
                      </>
                    )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        <div className=" flex flex-col items-center justify-center">
          <div className="text-xl font-bold text-white">{gameData?.title}</div>
          {renderChips()}
          <div className=" flex items-center justify-center w-full">
            <div className=" w-[600px] h-[600px] aspect-square">
              <GameBoard
                field={gameData?.field}
                chipPositions={chipPositions}
                onCellClick={handleCellClick}
                players={players}
                currentTurn={currentTurn}
                ws={ws}
              />
            </div>
          </div>

          <div className="w-full flex flex-col items-center gap-4 mt-4">
            <div className="bg-[#FFFFFF33] text-white px-4 py-2 rounded-md">
              {myId === currentTurn ? "Ваш ход" : `Ход игрока ${currentTurn ? currentTurn : "не выбран"}`}
            </div>
            <div className="flex gap-4">
              <Bottom muted={playerHighlighted?.muted} playing={playerHighlighted?.playing} toggleAudio={toggleAudio} toggleVideo={toggleVideo} leaveRoom={leaveRoom} />
            </div>
          </div>
        </div>

        <div className=" p-3 rounded-xl w-1/6 h-[50px] flex justify-end">
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="bg-[#F0F0FF] p-3 rounded-xl w-[50px] h-[50px] flex items-center justify-center"
          >
            {menuOpen ? <Close stroke="black"/> : <Menu />}
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-[rgba(255,_255,_255,_0.5)]
 text-white rounded-lg shadow-lg z-10">
              <ul>
                <li
                  onClick={copyLink}
                  className="flex items-center gap-2 px-4 py-3  cursor-pointer rounded-t-lg "
                >
                  <Link /> 
                  <span>Скопировать ссылку</span>
                </li>
                <li
                  onClick={pauseGame}
                  className="flex items-center gap-2 px-4 py-3 cursor-pointer rounded-t-lg"
                >
                  <Pause />
                  <span>Приостановить игру</span>
                </li>
                <li
                  onClick={gameRules}
                  className="flex items-center gap-2 px-4 py-3 cursor-pointer rounded-t-lg"
                >
                  <Rules />
                  <span>Правила игры</span>
                </li>
                <li
                  onClick={finishGame}
                  className="flex items-center gap-2 px-4 py-3 cursor-pointer rounded-t-lg"
                >
                  <Leave />
                  <span>Завершить игру</span>
                </li>
              </ul>
            </div>
          )}
        </div>
        </div>
      </div>