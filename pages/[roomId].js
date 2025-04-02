/* eslint-disable @next/next/no-img-element */
import { useEffect, useState, useRef } from "react";
import { cloneDeep } from "lodash";
import { useRouter } from "next/router";
import axios from "axios";

import { useSocket } from "@/context/socket";
import { useWebSocket } from "@/context/websocket";
import usePeer from "@/hooks/usePeer";
import useMediaStream from "@/hooks/useMediaStream";
import usePlayer from "@/hooks/usePlayer";
import { useGame } from "@/context/game";

import GameBoard from "@/components/GameBoard/GameBoard";
import Player from "@/components/Player";
import Bottom from "@/components/Bottom";
import DeckModal from "@/components/Modal/Deck";
import CardModal from "@/components/Modal/Card";
import ObjectModal from '@/components/Modal/Object'
import Action from '@/components/Action'

import Cards from "@/icons/Cards";
import Close from "@/icons/Close";
import People from "@/icons/People";
import { Menu } from "lucide-react";
import More from "@/icons/More";
import Link from "@/icons/Link";
import Pause from "@/icons/Pause";
import Leave from "@/icons/Leave";
import Rules from "@/icons/Rules";
import CardChoosedModal from "@/components/Modal/CardChoosed";


//деки
//по юзер айди получать юзернейм
//создать планшет для каждого юзера


const Room = () => {
  const socket = useSocket();
  const ws = useWebSocket();
  const { roomId } = useRouter().query;
  const { peer, myId } = usePeer();
  const { stream } = useMediaStream();
  const { gameData, setGameData } = useGame();

  const [creatorId, setCreatorId] = useState();
  const [currentTurn, setCurrentTurn] = useState(null);
  const [chipPositions, setChipPositions] = useState({});
  const {
    players,
    setPlayers,
    playerHighlighted,
    nonHighlightedPlayers,
    toggleAudio,
    toggleVideo,
    leaveRoom,
  } = usePlayer(myId, roomId, peer);

  const [users, setUsers] = useState({});
  const [clientId, setClientId] = useState(null);

  const [showCams, setShowCams] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [deckModal, setIsDeckModalActive] = useState(false);
  const [actionActive, setActionActive] = useState(false);
  const [actionCoordinates, setActionCoordinates] = useState(null);
  const [selectedPlayerId, setSelectedPlayerId] = useState(null);
  const [cardChoosedModalActive, setCardChoosedModalActive] = useState(false)
  const [chosenCardData, setChosenCardData] = useState(null)
  const [cardModalPlayerId, setCardModalPlayerId] = useState(null);
  const [assignedDecks, setAssignedDecks] = useState({});

  const assignedDeckId = assignedDecks[cardModalPlayerId];
  const assignedDeck = gameData?.decks.find(deck => deck.id === assignedDeckId);



  const buttonRef = useRef(null);

  const handleOpenAction = (event, playerId) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setActionCoordinates(rect);
    setSelectedPlayerId(playerId);
    setActionActive(true);
  };

  const [cardActive, setCardActive] = useState(false);
  const [objectActive, setObjectActive] = useState(false);
  const handleSelectObject = (obj) => {
    console.log('Выбран объект:', obj);
  };

  const [elapsedTime, setElapsedTime] = useState(0);
  const [paused, setPaused] = useState(false);
  const [finished, setFinished] = useState(false);


  useEffect(() => {
    if (!roomId) return;
  
    axios
      // .get(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/game/${roomId}`)
      // .then((response) => {
      //   console.log("✅ Game data fetched:", response.data);
    axios
      .get(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/game`, {
        params: { user_id: "3f49cf0e-712a-4ade-b5bb-eaf77d8d72ce" }
      })
      .then((response) => {
        console.log("✅ Game data fetched:", response.data);
        const game = response.data.find(game => game.id === roomId);
        if (!game) {
          throw new Error("Game not found");
        }
        console.log("✅ Game data fetched:", game);

        setGameData(game);
        setCreatorId(game.creator_id);
        console.log("myid in userids "+response.data.user_ids.includes(myId))
        if (!response.data.user_ids.includes(myId)) {
          return axios.patch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/v1/game/${roomId}/join`,
            new URLSearchParams({ user_id: myId }),
            { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
          );
        }
      })
      .then((joinResponse) => {
        if (joinResponse) {
          console.log("✅ Successfully joined the game:", joinResponse.data);
        }
      })
      .catch((error) => {
        console.error("❌ Error:", error);
      });
  }, [myId, roomId, setGameData]);

  useEffect(() => {
    if (!gameData?.created_at) return;
    const startTime = new Date(gameData.created_at).getTime();
    const interval = setInterval(() => {
      if (!paused && !finished) {
        const now = new Date().getTime();
        setElapsedTime(Math.floor((now - startTime) / 1000));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [gameData, paused, finished]);

  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  // подключение новых пользователей
  useEffect(() => {
    if (!socket || !peer || !stream) return;

    const handleUserConnected = (newUser) => {
      console.log(`user connected: ${newUser}`);
      const call = peer.call(newUser, stream);
      call.on("stream", (incomingStream) => {
        setPlayers((prev) => ({
          ...prev,
          [newUser]: { url: incomingStream, muted: true, playing: true },
        }));
        setUsers((prev) => ({ ...prev, [newUser]: call }));
      });
    };

    socket.on("user-connected", handleUserConnected);
    return () => socket.off("user-connected", handleUserConnected);
  }, [peer, setPlayers, socket, stream]);

  // обработка событий видео/аудио
  useEffect(() => {
    if (!socket) return;

    const handleToggleAudio = (userId) => {
      setPlayers((prev) => {
        const copy = cloneDeep(prev);
        if (copy[userId]) copy[userId].muted = !copy[userId].muted;
        return { ...copy };
      });
    };

    const handleToggleVideo = (userId) => {
      setPlayers((prev) => {
        const copy = cloneDeep(prev);
        if (copy[userId]) copy[userId].playing = !copy[userId].playing;
        return { ...copy };
      });
    };

    const handleUserLeave = (userId) => {
      users[userId]?.close();
      const playersCopy = cloneDeep(players);
      delete playersCopy[userId];
      setPlayers(playersCopy);
    };

    socket.on("user-toggle-audio", handleToggleAudio);
    socket.on("user-toggle-video", handleToggleVideo);
    socket.on("user-leave", handleUserLeave);

    return () => {
      socket.off("user-toggle-audio", handleToggleAudio);
      socket.off("user-toggle-video", handleToggleVideo);
      socket.off("user-leave", handleUserLeave);
    };
  }, [players, setPlayers, socket, users]);

  // обработка входящих звонков
  useEffect(() => {
    if (!peer || !stream) return;

    peer.on("call", (call) => {
      const { peer: callerId } = call;
      call.answer(stream);
      call.on("stream", (incomingStream) => {
        setPlayers((prev) => ({
          ...prev,
          [callerId]: { url: incomingStream, muted: true, playing: true },
        }));
        setUsers((prev) => ({ ...prev, [callerId]: call }));
      });
    });
  }, [peer, setPlayers, stream]);

  // ws client
  useEffect(() => {
    if (!roomId) return;
    let roomKey = `room_${roomId}_client_counter`;
    let lastClientId = parseInt(localStorage.getItem(roomKey) || "0", 10);
    setClientId(lastClientId);
    localStorage.setItem(roomKey, lastClientId + 1);
  }, [roomId]);

  // инициализация ws
  useEffect(() => {
    if (!roomId || clientId === null) return;

    ws.current = new WebSocket(`ws://localhost:8000/api/v1/websocket/ws/room/${roomId}/${clientId}`);

    ws.current.onopen = () => console.log("✅ Chat WebSocket connected");
    ws.current.onclose = () => console.log("❌ Chat WebSocket disconnected");
    ws.current.onerror = (err) => console.error("⚠️ Chat WS error:", err);

    ws.current.onmessage = (event) => {
      let jsonString;
      try {
        const jsonMatch = event.data.match(/\{.*\}/);
        jsonString = jsonMatch ? jsonMatch[0] : event.data;
        const data = JSON.parse(jsonString);

        if (data.type === "TURN_UPDATE") {
          setCurrentTurn(data.payload);
        }
        if (data.type === "DRAG_MOVE") {
          const { playerId, pos } = data.payload;
          setChipPositions((prev) => ({
            ...prev,
            [playerId]: pos,
          }));
        }
        if (data.type === "MOVE") {
          const { playerId, move } = data.payload;
          setChipPositions((prev) => ({
            ...prev,
            [playerId]: move,
          }));
          console.log(`Игрок ${playerId} переместил фишку в: строка ${move.row}, столбец ${move.col}`);
        }
        if (data.type === "SHOW_CARD_MODAL") {
          setCardModalPlayerId(data.payload)
          setCardActive(true)
        }
        if (data.type === "CARD_CHOSEN") {
          setChosenCardData(data.payload)
          setCardActive(false)
          setCardChoosedModalActive(true)
        }
      } catch (error) {
        console.log("received connection message", event.data);
      }
    };

    return () => ws.current?.close();
  }, [roomId, clientId, ws]);

  useEffect(() => {
    const initialPositions = {};
    Object.keys(players).forEach((playerId) => {
      initialPositions[playerId] = { row: 0, col: 0 };
    });
    setChipPositions(initialPositions);
  }, [players]);

  useEffect(() => {
    if (!stream || !myId) return;
    setPlayers((prev) => ({
      ...prev,
      [myId]: { url: stream, muted: true, playing: true },
    }));
  }, [myId, setPlayers, stream]);

  const handleChoosePlayer = () => {
    ws.current.send(
      JSON.stringify({
        type: "TURN_UPDATE",
        payload: selectedPlayerId,
      })
    );
    setActionActive(false);
  };

  const handleCellClick = (row, col) => {
    if (myId !== currentTurn) return;
    ws.current.send(
      JSON.stringify({
        type: "MOVE",
        payload: {
          playerId: myId,
          move: { row, col },
        },
      })
    );
  };
  const copyLink = () => {
    const link = window.location.href;
    navigator.clipboard.writeText(link)
    setMenuOpen(false);
  };

  const pauseGame = () => {
    setPaused(true);
    setMenuOpen(false);
  };

  const finishGame = () => {
    setFinished(true);
    setPaused(true);
    setMenuOpen(false);
  };

  const gameRules = () => {
    setMenuOpen(false);
  };

  const handleCardIssue = (playerId) => {
    ws.current.send(JSON.stringify({
      type: "SHOW_CARD_MODAL",
      payload: playerId
    }))
  }
  

  useEffect(() => {
    if (!stream || !myId) return;
    setPlayers((prev) => ({
      ...prev,
      [myId]: { url: stream, muted: true, playing: true },
    }));
  }, [myId, setPlayers, stream]);

  return (
    <>
      <div className="flex flex-col h-screen bg-indigo-950 p-6">
        <div className=" md:hidden flex flex-col">
          <div>
            <div className="text-xl font-bold text-white">
                {gameData?.title} <span className="text-xl font-bold text-[#FFD54C]">{formatTime(elapsedTime)}</span>
              </div>
          </div>
          <div className="flex flex-row">
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
            <div className="order-3 relative md:ml-[66px]">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="bg-[#F0F0FF] p-3 rounded-xl w-[50px] h-[50px] flex items-center justify-center"
            >
              {menuOpen ? <Close stroke="black"/> : <Menu />}
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-[rgba(255,_255,_255,_0.5)] text-white rounded-lg shadow-lg z-20">
                <ul>
                  <li
                    onClick={copyLink}
                    className="flex items-center gap-2 px-4 py-3 cursor-pointer rounded-t-lg"
                  >
                    <Link /> 
                    <span>Скопировать ссылку</span>
                  </li>
                  <li
                    onClick={pauseGame}
                    className="flex items-center gap-2 px-4 py-3 cursor-pointer"
                  >
                    <Pause />
                    <span>Приостановить игру</span>
                  </li>
                  <li
                    onClick={gameRules}
                    className="flex items-center gap-2 px-4 py-3 cursor-pointer"
                  >
                    <Rules />
                    <span>Правила игры</span>
                  </li>
                  <li
                    onClick={finishGame}
                    className="flex items-center gap-2 px-4 py-3 cursor-pointer rounded-b-lg"
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
        <div className="hidden md:flex w-full mb-3 md:items-center md:justify-between">

          <div className="order-1 md:order-2 flex justify-center mb-4 md:mb-0">
            <div className="text-xl font-bold text-white">
              {gameData?.title} <span className="text-xl font-bold text-[#FFD54C]">{formatTime(elapsedTime)}</span>
            </div>
          </div>

          <div className="order-2 md:order-1 flex flex-row gap-4  items-center">
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

 

          <div className="order-3 relative md:ml-[66px]">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="bg-[#F0F0FF] p-3 rounded-xl w-[50px] h-[50px] flex items-center justify-center"
            >
              {menuOpen ? <Close stroke="black"/> : <Menu />}
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-[rgba(255,_255,_255,_0.5)] text-white rounded-lg shadow-lg z-20">
                <ul>
                  <li
                    onClick={copyLink}
                    className="flex items-center gap-2 px-4 py-3 cursor-pointer rounded-t-lg"
                  >
                    <Link /> 
                    <span>Скопировать ссылку</span>
                  </li>
                  <li
                    onClick={pauseGame}
                    className="flex items-center gap-2 px-4 py-3 cursor-pointer"
                  >
                    <Pause />
                    <span>Приостановить игру</span>
                  </li>
                  <li
                    onClick={gameRules}
                    className="flex items-center gap-2 px-4 py-3 cursor-pointer"
                  >
                    <Rules />
                    <span>Правила игры</span>
                  </li>
                  <li
                    onClick={finishGame}
                    className="flex items-center gap-2 px-4 py-3 cursor-pointer rounded-b-lg"
                  >
                    <Leave />
                    <span>Завершить игру</span>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-grow relative">
          {showCams && (
            <div className="absolute left-0 top-0 w-[250px] z-20 flex flex-col gap-2 bg-[#A6A7B9] p-4 rounded-[10px] max-h-[80vh] overflow-y-auto">
              <div className="text-[#21244F] font-bold">
                Участники ({Object.keys(players).length})
              </div>
              <div className="flex flex-col gap-2">
                {playerHighlighted && (
                  <div className="relative rounded-md overflow-hidden">
                    <Player
                      url={playerHighlighted.url}
                      muted={playerHighlighted.muted}
                      playing={playerHighlighted.playing}
                      isActive
                    />
                    <div className="absolute bottom-5 text-white left-2 bg-black/50 px-2 py-1 rounded">
                      Вы 
                    </div>
                    {myId === creatorId && (
                      <button
                        onClick={(e) => handleOpenAction(e, myId)}
                        className="absolute top-3 right-2 bg-[#3C3585] text-white rounded w-6 h-6 flex justify-center items-center"
                      >
                        <More />
                      </button>
                    )}
                  </div>
                )}

                {Object.keys(nonHighlightedPlayers).map((playerId) => {
                  const { url, muted, playing } = nonHighlightedPlayers[playerId];
                  return (
                    <div key={playerId} className="relative rounded-md overflow-hidden w-full">
                      <Player url={url} muted={muted} playing={playing} isActive={false} />
                      <div className="absolute bottom-1 left-2 bg-black/50 px-2 py-1 rounded text-xs">
                        Игрок {playerId}
                      </div>
                      {myId === creatorId && (
                        <button
                          onClick={(e) => handleOpenAction(e, playerId)}
                          className="absolute top-3 right-1 bg-[#3C3585] text-white rounded w-6 h-6 flex justify-center items-center"
                        >
                          <More />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex flex-col items-center justify-center w-full">
            <div className="flex items-center justify-center w-full mb-3">
              <div className="flex justify-center md:max-w-[650px] aspect-squar">
                <GameBoard
                  field={gameData?.field_path}
                  chips={gameData?.chips}
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
                <Bottom 
                  muted={playerHighlighted?.muted} 
                  playing={playerHighlighted?.playing} 
                  toggleAudio={toggleAudio} 
                  toggleVideo={toggleVideo} 
                  leaveRoom={leaveRoom} 
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <DeckModal active={deckModal} setActive={setIsDeckModalActive} players={gameData?.user_ids} gameData={gameData} onAssignDeck={(deckId, playerId) => {
    setAssignedDecks(prev => ({ ...prev, [playerId]: deckId }));
  }}/>
      <CardModal active={cardActive} myId={myId} playerId={cardModalPlayerId} setActive={setCardActive} ws={ws} card_back={assignedDeck ? assignedDeck.cards[0].back : gameData?.decks[0].cards[0].back}/>
      <CardChoosedModal active={cardChoosedModalActive} setActive={setCardChoosedModalActive} cardData={chosenCardData} playerId={cardModalPlayerId} card_body={gameData?.decks[0].cards[0].back}/>
      <ObjectModal active={objectActive} setActive={setObjectActive} objects={gameData?.game_objects[0].image} onSelect={handleSelectObject} />
      {actionActive && (
        <Action 
          active={actionActive} 
          coordinates={actionCoordinates} 
          setActive={setActionActive}
          id={selectedPlayerId}
          onMoveChip={handleChoosePlayer}
          onCardIssue={handleCardIssue}
          onObjectPick={() => setObjectActive(true)}
        />
      )}
    </>
  );
};

export default Room;