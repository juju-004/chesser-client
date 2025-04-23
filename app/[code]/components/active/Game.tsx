"use client";
// TODO: restructure, i could use some help with this :>

import type { FormEvent } from "react";

import React, { useEffect, useReducer, useRef, useState } from "react";

import type { GameTimer, Lobby, Message } from "@/types";
import type { Game } from "@/types";

import type { Move, Square } from "chess.js";
import { Chess } from "chess.js";
import type { ClearPremoves } from "react-chessboard";
import { Chessboard } from "react-chessboard";

import { API_URL, CLIENT_URL } from "@/config";
import { io } from "socket.io-client";

import { lobbyReducer, squareReducer } from "../reducers";
import { initSocket } from "../socketEvents";
import { syncPgn, syncSide } from "../utils";
import { CopyLinkButton, ShareButton } from "../CopyLink";
import Chat from "../ui/Chat";
import { useToast } from "@/context/ToastContext";
import { getWallet } from "@/lib/user";
import MenuOptions, { EndReason, MenuAlert } from "../ui/MenuOptions";
import MenuDrawer from "../ui/MenuDrawer";
import { useChessSounds } from "../ui/SoundManager";
import { useSession } from "@/context/SessionProvider";
import ArchivedGame from "../archive/Game";
import GameOver from "../ui/GameOver";
import Dock from "../ui/Dock";
import PlayerHtml from "../ui/PlayerHtml";

const socket = io(API_URL, { withCredentials: true, autoConnect: false });

export default function ActiveGame({ initialLobby }: { initialLobby: Game }) {
  const session = useSession();

  const [lobby, updateLobby] = useReducer(lobbyReducer, {
    ...initialLobby,
    actualGame: new Chess(),
    side: "s",
  });
  const [customSquares, updateCustomSquares] = useReducer(squareReducer, {
    options: {},
    lastMove: {},
    rightClicked: {},
    check: {},
  });

  const [moveFrom, setMoveFrom] = useState<string | Square | null>(null);
  const [boardWidth, setBoardWidth] = useState(480);
  const chessboardRef = useRef<ClearPremoves>(null);

  const [navFen, setNavFen] = useState<string | null>(null);
  const [navIndex, setNavIndex] = useState<number | null>(null);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);

  const [play, setPlay] = useState(false);
  const [clock, setClock] = useState<GameTimer>({
    white: initialLobby.timeControl * 60 * 1000,
    black: initialLobby.timeControl * 60 * 1000,
  });

  const [perspective, setPerspective] = useState(false);
  const [chatDot, setchatDot] = useState<boolean>(false);
  const [draw, setDraw] = useState<boolean>(false);
  const [abandonSeconds, setAbandonSeconds] = useState(30);

  const { playSound } = useChessSounds();
  const { toast } = useToast();

  const [premove, setPremove] = useState<{ from: Square; to: Square } | null>(
    null
  );

  useEffect(() => {
    if (
      lobby.side === "s" ||
      lobby.endReason ||
      lobby.winner ||
      !lobby.pgn ||
      !lobby.white ||
      !lobby.black ||
      (lobby.white.id !== session?.user?.id &&
        lobby.black.id !== session?.user?.id)
    )
      return;

    let interval: number;
    if (!lobby.white?.connected || !lobby.black?.connected) {
      setAbandonSeconds(30);
      interval = Number(
        setInterval(() => {
          if (
            abandonSeconds === 0 ||
            (lobby.white?.connected && lobby.black?.connected)
          ) {
            clearInterval(interval);
            return;
          }
          setAbandonSeconds((s) => s - 1);
        }, 1000)
      );
    }
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    lobby.black,
    lobby.white,
    lobby.black?.disconnectedOn,
    lobby.white?.disconnectedOn,
  ]);

  useEffect(() => {
    if (!session?.user || !session.user?.id) return;
    socket.connect();
    setBoardWidth(window.innerWidth);

    if (lobby.pgn && lobby.actualGame.pgn() !== lobby.pgn) {
      syncPgn(lobby.pgn, lobby, {
        updateCustomSquares,
        setNavFen,
        setNavIndex,
      });
    }

    syncSide(session.user, undefined, lobby, { updateLobby });

    initSocket(session.user, socket, lobby, {
      updateLobby,
      addMessage,
      updateCustomSquares,
      makeMove,
      setNavFen,
      setNavIndex,
      updateClock,
      playSound,
    });

    // socket.on("disconnect", () => {
    //   toast(
    //     <>
    //       Connecting <span className="loading loading-bars"></span>
    //     </>,
    //     "info"
    //   );

    //   const isOnline = setInterval(() => {
    //     if (navigator.onLine) {
    //       clearInterval(isOnline);
    //     }
    //   }, 1000);
    // });

    socket.on("offerdraw", () => {
      setDraw(true);
      setTimeout(() => {
        setDraw(false);
      }, 7000);
    });

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    updateTurnTitle();

    if (lobby.endReason && lobby.endReason !== "aborted") {
      (
        document.getElementById("gameOverModal") as HTMLDialogElement
      )?.showModal();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lobby]);

  function updateTurnTitle() {
    if (lobby.side === "s" || !lobby.white?.id || !lobby.black?.id) return;

    if (!lobby.endReason && lobby.side === lobby.actualGame.turn()) {
      document.title = "(your turn) chesser";
    } else {
      document.title = "chesser";
    }
  }

  function updateClock(clock: GameTimer) {
    setClock(clock);

    console.log(clock);
  }
  // Chat
  function addMessage(message: Message) {
    setChatMessages((prev) => [...prev, message]);

    !chatDot && setchatDot(true);
  }

  function makeMove(
    m: { from: string; to: string; promotion?: string },
    opponent?: boolean
  ) {
    try {
      const result = lobby.actualGame.move(m);

      if (result) {
        if (result.captured) {
          playSound("capture");
        } else if (opponent) {
          playSound("move", true);
        } else {
          playSound("move");
        }

        setNavFen(null);
        setNavIndex(null);
        updateLobby({
          type: "updateLobby",
          payload: {
            pgn: lobby.actualGame.pgn(),
            status:
              lobby.actualGame.history().length >= 2 ? "inPlay" : "started",
          },
        });
        updateTurnTitle();
        let kingSquare = undefined;
        if (lobby.actualGame.inCheck()) {
          const kingPos = lobby.actualGame.board().reduce((acc, row, index) => {
            const squareIndex = row.findIndex(
              (square) =>
                square &&
                square.type === "k" &&
                square.color === lobby.actualGame.turn()
            );
            return squareIndex >= 0
              ? `${String.fromCharCode(squareIndex + 97)}${8 - index}`
              : acc;
          }, "");
          kingSquare = {
            [kingPos]: {
              background:
                "radial-gradient(circle, rgba(255, 0, 0, 0.2) 40%, transparent 80%)",
              boxShadow: "0 0 8px 4px rgba(255, 0, 0, 0.3)",
              borderRadius: "50%",
            },
          };
        }
        updateCustomSquares({
          lastMove: {
            [result.from]: { background: "rgba(255, 255, 0, 0.4)" },
            [result.to]: { background: "rgba(255, 255, 0, 0.4)" },
          },
          options: {},
          check: kingSquare,
        });
        return true;
      } else {
        throw new Error("Invalid move");
      }
    } catch (err) {
      updateCustomSquares({
        options: {},
      });
      return false;
    }
  }

  function isDraggablePiece({ piece }: { piece: string }) {
    return piece.startsWith(lobby.side) && !lobby.endReason && !lobby.winner;
  }

  function onDrop(sourceSquare: Square, targetSquare: Square) {
    if (lobby.side === "s" || navFen || lobby.endReason || lobby.winner)
      return false;

    // If it's not your turn, set premove
    if (lobby.side !== lobby.actualGame.turn()) {
      setPremove({ from: sourceSquare, to: targetSquare });
      return true;
    }

    const moveDetails = {
      from: sourceSquare,
      to: targetSquare,
      promotion: "q",
    };

    const move = makeMove(moveDetails);
    if (!move) return false;

    socket.emit("sendMove", moveDetails);
    return true;
  }

  function getMoveOptions(square: Square) {
    const moves = lobby.actualGame.moves({
      square,
      verbose: true,
    }) as Move[];
    if (moves.length === 0) {
      return;
    }

    const newSquares: {
      [square: string]: { background: string; borderRadius?: string };
    } = {};
    moves.map((move) => {
      newSquares[move.to] = {
        background:
          lobby.actualGame.get(move.to as Square) &&
          lobby.actualGame.get(move.to as Square)?.color !==
            lobby.actualGame.get(square)?.color
            ? "radial-gradient(circle, rgba(0,0,0,.1) 85%, transparent 85%)"
            : "radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)",
        borderRadius: "50%",
      };
      return move;
    });
    newSquares[square] = {
      background: "rgba(255, 255, 0, 0.4)",
    };
    updateCustomSquares({ options: newSquares });
  }

  function onPieceDragBegin(_piece: string, sourceSquare: Square) {
    if (
      lobby.side !== lobby.actualGame.turn() ||
      navFen ||
      lobby.endReason ||
      lobby.winner
    )
      return;

    getMoveOptions(sourceSquare);
  }

  function onPieceDragEnd() {
    updateCustomSquares({ options: {} });
  }

  function onSquareClick(square: Square) {
    updateCustomSquares({ rightClicked: {} });
    if (
      lobby.side !== lobby.actualGame.turn() ||
      navFen ||
      lobby.endReason ||
      lobby.winner
    )
      return;

    function resetFirstMove(square: Square) {
      setMoveFrom(square);
      getMoveOptions(square);
    }

    // from square
    if (moveFrom === null) {
      resetFirstMove(square);
      return;
    }

    const moveDetails = {
      from: moveFrom,
      to: square,
      promotion: "q",
    };

    const move = makeMove(moveDetails);
    if (!move) {
      resetFirstMove(square);
    } else {
      setMoveFrom(null);
      socket.emit("sendMove", moveDetails);
    }
  }

  function onSquareRightClick(square: Square) {
    const colour = "rgba(0, 0, 255, 0.4)";
    updateCustomSquares({
      rightClicked: {
        ...customSquares.rightClicked,
        [square]:
          customSquares.rightClicked[square] &&
          customSquares.rightClicked[square]?.backgroundColor === colour
            ? undefined
            : { backgroundColor: colour },
      },
    });
  }

  async function clickPlay(e: FormEvent<HTMLButtonElement>) {
    setPlay(true);
    e.preventDefault();

    try {
      const data = await getWallet();

      if (Math.sign(data.wallet - initialLobby.stake) === -1) {
        toast("Insufficient funds", "error");
        setPlay(false);
        return;
      }

      socket.emit("joinAsPlayer");
    } catch (error) {
      toast("Insufficient funds", "error");
      setPlay(false);
    }
  }

  function getPlayerHtml(side: "top" | "bottom", perspective: boolean) {
    const blackHtml = (
      <PlayerHtml time={clock.black} color="black" lobby={lobby} />
    );

    const whiteHtml = (
      <PlayerHtml time={clock.white} color="white" lobby={lobby} />
    );

    if (lobby.black?.id === session?.user?.id) {
      return side === "top"
        ? perspective
          ? blackHtml
          : whiteHtml
        : perspective
        ? whiteHtml
        : blackHtml;
    } else {
      return side === "top"
        ? perspective
          ? whiteHtml
          : blackHtml
        : perspective
        ? blackHtml
        : whiteHtml;
    }
  }

  function navigateMove(index: number | null | "prev") {
    const history = lobby.actualGame.history({ verbose: true });

    if (
      index === null ||
      (index !== "prev" && index >= history.length - 1) ||
      !history.length
    ) {
      // last move
      setNavIndex(null);
      setNavFen(null);
      return;
    }

    if (index === "prev") {
      index = history.length - 2;
    } else if (index < 0) {
      index = 0;
    }

    chessboardRef.current?.clearPremoves(false);

    setNavIndex(index);
    setNavFen(history[index].after);
  }

  function getNavMoveSquares() {
    if (navIndex === null) return;
    const history = lobby.actualGame.history({ verbose: true });

    if (!history.length) return;

    return {
      [history[navIndex].from]: { background: "rgba(255, 255, 0, 0.4)" },
      [history[navIndex].to]: { background: "rgba(255, 255, 0, 0.4)" },
    };
  }

  function claimAbandoned(type: "win" | "draw") {
    if (
      lobby.side === "s" ||
      lobby.endReason ||
      lobby.winner ||
      !lobby.pgn ||
      abandonSeconds > 0 ||
      (lobby.black?.connected && lobby.white?.connected)
    ) {
      return;
    }
    socket.emit("claimAbandoned", type);
  }
  const currentSide = (lobby: Lobby) => {
    if (lobby.white?.id === session.user?.id) {
      return lobby.white;
    } else if (lobby.black?.id === session.user?.id) {
      return lobby.black;
    } else return null;
  };
  const resign = () => {
    socket.emit("resign");
  };

  return (
    <>
      {currentSide(lobby) && (
        <dialog id="gameOverModal" className="modal">
          {lobby.winner && (
            <GameOver
              stake={lobby.stake}
              countStart={currentSide(lobby)?.wallet as number}
              isWinner={
                lobby.winner === "draw"
                  ? "draw"
                  : lobby[lobby.winner]?.id === session.user?.id
                  ? true
                  : false
              }
            />
          )}
        </dialog>
      )}
      <dialog id="resignModal" className="modal">
        <div className="modal-box flex flex-col items-center gap-5">
          <h3 className="text-lg">Resign??</h3>

          <form method="dialog" className="flex gap-4">
            {/* if there is a button in form, it will close the modal */}
            <button className="btn w-16 rounded-2xl btn-soft btn-success">
              No
            </button>
            <button
              onClick={resign}
              className="btn w-16 rounded-2xl btn-error btn-soft "
            >
              Yes
            </button>
          </form>
        </div>
      </dialog>

      {lobby.endReason ? (
        <ArchivedGame game={lobby} chatDot={chatDot}>
          <Chat
            id="my-drawer-4"
            addMessage={addMessage}
            chatMessages={chatMessages}
            lobby={lobby}
            socket={socket}
            setChatDot={() => setchatDot(false)}
          />
        </ArchivedGame>
      ) : (
        <MenuDrawer
          actualGame={lobby.actualGame}
          navIndex={navIndex}
          lobby={lobby}
          navigateMove={(m: number | null | "prev") => navigateMove(m)}
        >
          <div className="drawer drawer-end">
            <input
              id="my-drawer-45"
              type="checkbox"
              className="drawer-toggle"
            />
            <div className="drawer-content">
              <div className="relative flex h-screen  w-full flex-col justify-center gap-3 py-4 lg:gap-10 2xl:gap-16">
                {getPlayerHtml("top", perspective)}
                <div className="relative">
                  {/* overlay */}
                  {(!lobby.white?.id || !lobby.black?.id) && (
                    <div className="absolute bottom-0 right-0 top-0 z-10 flex h-full w-full items-center justify-center bg-black/70">
                      <div className="bg-base-200 flex w-full flex-col items-center justify-center gap-2 px-2 py-4">
                        {!currentSide(lobby) ? (
                          <button
                            className={`btn grad1 ${
                              play ? "btn-disabled" : ""
                            }`}
                            onClick={clickPlay}
                          >
                            Play as {lobby.white?.id ? "black" : "white"}{" "}
                            {play && (
                              <span className="loading-spinner loading loading-xs"></span>
                            )}
                          </button>
                        ) : (
                          <>
                            <span className="opacity-50">
                              Waiting for opponent...
                            </span>
                            <div className="bg-base-300 fx text-base-content h-8 gap-2 rounded-2xl pl-3 pr-1 text-xs active:opacity-60 sm:h-5 sm:text-sm">
                              <CopyLinkButton
                                className="fx gap-2 "
                                link={`${CLIENT_URL}/${initialLobby.code}`}
                              />
                              <ShareButton />
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  <Chessboard
                    boardWidth={boardWidth}
                    customDarkSquareStyle={{ backgroundColor: "#4b7399" }}
                    customLightSquareStyle={{ backgroundColor: "#eae9d2" }}
                    position={navFen || lobby.actualGame.fen()}
                    boardOrientation={
                      lobby.side === "b"
                        ? perspective
                          ? "white"
                          : "black"
                        : perspective
                        ? "black"
                        : "white"
                    }
                    isDraggablePiece={isDraggablePiece}
                    onPieceDragBegin={onPieceDragBegin}
                    onPieceDragEnd={onPieceDragEnd}
                    onPieceDrop={onDrop}
                    onSquareClick={onSquareClick}
                    animationDuration={100}
                    onSquareRightClick={onSquareRightClick}
                    arePremovesAllowed={true}
                    customPremoveDarkSquareStyle={{ background: "#6ca568" }}
                    customPremoveLightSquareStyle={{ background: "#b0e57c" }}
                    customSquareStyles={{
                      ...(navIndex === null
                        ? customSquares.lastMove
                        : getNavMoveSquares()),
                      ...(navIndex === null ? customSquares.check : {}),
                      ...customSquares.rightClicked,
                      ...(navIndex === null ? customSquares.options : {}),
                    }}
                    ref={chessboardRef}
                  />
                </div>
                {getPlayerHtml("bottom", perspective)}

                <>
                  {(lobby.pgn &&
                    lobby.white &&
                    session?.user?.id === lobby.white?.id &&
                    lobby.black &&
                    !lobby.black?.connected) ||
                  (lobby.pgn &&
                    lobby.black &&
                    session?.user?.id === lobby.black?.id &&
                    lobby.white &&
                    !lobby.white?.connected) ? (
                    <>
                      <div className="fixed z-[99] rounded-xl inset-x-4 top-3">
                        <div role="alert" className="alert alert-vertical">
                          {abandonSeconds > 0 ? (
                            `Your opponent has disconnected. You can claim the win or draw in ${abandonSeconds} second${
                              abandonSeconds > 1 ? "s" : ""
                            }.`
                          ) : (
                            <>
                              <span className="pt-3">
                                Your opponent has disconnected.
                              </span>
                              <div className="flex gap-3">
                                <button
                                  onClick={() => claimAbandoned("win")}
                                  className="btn btn-sm btn-success btn-soft"
                                >
                                  Claim win
                                </button>
                                <button
                                  onClick={() => claimAbandoned("draw")}
                                  className="btn btn-sm"
                                >
                                  Draw
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </>
                  ) : (
                    <MenuAlert
                      draw={draw}
                      socket={socket}
                      setDraw={(v: boolean) => setDraw(v)}
                    />
                  )}
                </>

                <EndReason reason={lobby.endReason} winner={lobby.winner} />

                <Dock
                  actualGame={lobby.actualGame}
                  navIndex={navIndex}
                  perspective={perspective}
                  chatDot={chatDot}
                  htmlFor="my-drawer-45"
                  navigateMove={(m: number | null | "prev") => navigateMove(m)}
                  setPerspective={(m: boolean) => setPerspective(m)}
                  setchatDot={() => setchatDot(false)}
                >
                  <MenuOptions lobby={lobby} socket={socket} />
                </Dock>
              </div>
            </div>
            <Chat
              id="my-drawer-45"
              setChatDot={() => setchatDot(false)}
              addMessage={addMessage}
              chatMessages={chatMessages}
              lobby={lobby}
              socket={socket}
            />
          </div>
        </MenuDrawer>
      )}
    </>
  );
}
