"use client";
// TODO: restructure, i could use some help with this :>

import {
  IconChevronLeft,
  IconChevronRight,
  IconRotateRectangle,
} from "@tabler/icons-react";

import type { FormEvent } from "react";

import React, { useEffect, useReducer, useRef, useState } from "react";

import type { Lobby, Message } from "@/types";
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
import { IconMessage2 } from "@tabler/icons-react";
import { CopyLinkButton, ShareButton } from "../CopyLink";
import { ActiveChessTimer, ChessTimer } from "../ui/Timer";
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

export interface GameTimerStarted {
  whiteTime: number; // in milliseconds
  blackTime: number; // in milliseconds
  lastUpdate: number; // timestamp
  activeColor: "white" | "black";
  timerStarted: boolean;
}

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

  const [playBtnLoading, setPlayBtnLoading] = useState(false);
  const moveListRef = useRef<HTMLDivElement>(null);
  // Add this near your other state declarations
  const [whiteTime, setWhiteTime] = useState<number>(
    initialLobby.timeControl * 60 * 1000
  ); // default init minutes
  const [perspective, setPerspective] = useState(false);
  const [blackTime, setBlackTime] = useState<number>(
    initialLobby.timeControl * 60 * 1000
  );
  const [activeColor, setActiveColor] = useState<"white" | "black">("white");
  const [timerStarted, setTimerStarted] = useState(false);
  const [chatDot, setchatDot] = useState<boolean>(false);
  const { playSound } = useChessSounds();

  const [draw, setDraw] = useState<boolean>(false);

  const [abandonSeconds, setAbandonSeconds] = useState(60);
  const { toast } = useToast();

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
      setAbandonSeconds(60);
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

    window.addEventListener("resize", handleResize);
    handleResize();
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
      setTimer,
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
      window.removeEventListener("resize", handleResize);
      socket.removeAllListeners();
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // auto scroll for moves
  useEffect(() => {
    const activeMoveEl = document.getElementById("activeNavMove");
    const moveList = moveListRef.current;
    if (!activeMoveEl || !moveList) return;
    moveList.scrollTop = activeMoveEl.offsetTop;
  });

  useEffect(() => {
    updateTurnTitle();

    if (lobby.endReason) {
      console.log(lobby);

      (document.getElementById("my_modal_1") as HTMLDialogElement)?.showModal();
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

  function handleResize() {
    setBoardWidth(window.innerWidth);
    // if (window.innerWidth >= 1920) {
    //   setBoardWidth(580);
    // } else if (window.innerWidth >= 1536) {
    //   setBoardWidth(540);
    // } else if (window.innerWidth >= 768) {
    //   setBoardWidth(480);
    // } else {
    // }
  }

  function setTimer(timer: GameTimerStarted) {
    if (
      Math.abs(whiteTime - timer.whiteTime) > 1000 ||
      Math.abs(blackTime - timer.blackTime) > 1000
    ) {
      setWhiteTime(timer.whiteTime);
      setBlackTime(timer.blackTime);
    }

    setWhiteTime(timer.whiteTime);
    setBlackTime(timer.blackTime);
    setActiveColor(timer.activeColor);
    setTimerStarted(timer.timerStarted);
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
        console.log(result);

        setActiveColor(result.color === "w" ? "black" : "white");

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
          payload: { pgn: lobby.actualGame.pgn() },
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
                "radial-gradient(red, rgba(255,0,0,.4), transparent 70%)",
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

    // premove
    if (lobby.side !== lobby.actualGame.turn()) return true;

    const moveDetails = {
      from: sourceSquare,
      to: targetSquare,
      promotion: "q",
    };

    const move = makeMove(moveDetails);
    if (!move) return false; // illegal move
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
    setPlayBtnLoading(true);
    e.preventDefault();

    try {
      const data = await getWallet();

      if (Math.sign(data.wallet - initialLobby.stake) === -1) {
        toast("Insufficient funds", "error");
        setPlayBtnLoading(false);
        return;
      }

      socket.emit("joinAsPlayer", data.wallet);
    } catch (error) {
      toast("Something went wrong", "error");
      setPlayBtnLoading(false);
    }
  }

  function getPlayerHtml(side: "top" | "bottom", perspective: boolean) {
    const blackHtml = (
      <div className="relative ml-3 flex items-center justify-between gap-4">
        <div className="flex w-full flex-col justify-center">
          <a
            className={
              (lobby.black?.name ? "font-bold" : "") +
              (typeof lobby.black?.id === "number"
                ? " text-primary link-hover"
                : " cursor-default")
            }
            href={
              typeof lobby.black?.id === "number"
                ? `/user/${lobby.black?.name}`
                : undefined
            }
            target="_blank"
            rel="noopener noreferrer"
          >
            {lobby.black?.name || "(no one)"}
          </a>
          <span className="flex items-center gap-1 text-xs">
            <span className="opacity-65">black</span>
            {lobby?.winner && lobby.winner === "black" && (
              <span className="badge badge-xs badge-success text-white">
                winner
              </span>
            )}
            {lobby.black?.connected === false && (
              <span className="badge badge-xs badge-error">disconnected</span>
            )}
          </span>
        </div>
        <ActiveChessTimer
          color="black"
          initialTime={blackTime}
          active={activeColor === "black"}
          timerStarted={timerStarted}
        />
      </div>
    );

    const whiteHtml = (
      <div className="relative flex items-center justify-between gap-4">
        <div className="ml-3 flex w-full flex-col justify-center">
          <a
            className={
              (lobby.white?.name ? "font-bold" : "") +
              (typeof lobby.white?.id === "number"
                ? " text-primary link-hover"
                : " cursor-default")
            }
            href={
              typeof lobby.white?.id === "number"
                ? `/user/${lobby.white?.name}`
                : undefined
            }
            target="_blank"
            rel="noopener noreferrer"
          >
            {lobby.white?.name || "(no one)"}
          </a>
          <span className="flex items-center gap-1 text-xs">
            <span className="opacity-65">white</span>
            {lobby?.winner && lobby.winner === "white" && (
              <span className="badge badge-xs badge-success text-white">
                winner
              </span>
            )}
            {lobby.white?.connected === false && (
              <span className="badge badge-xs badge-error">disconnected</span>
            )}
          </span>
        </div>
        <ActiveChessTimer
          color="white"
          initialTime={whiteTime}
          active={activeColor === "white"}
          timerStarted={timerStarted}
        />
      </div>
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

  return (
    <>
      {currentSide(lobby) && (
        <dialog id="my_modal_1" className="modal">
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

      {lobby.endReason ? (
        <ArchivedGame game={lobby} chatDot={chatDot}>
          <Chat
            id="my-drawer-4"
            addMessage={addMessage}
            chatMessages={chatMessages}
            lobby={lobby}
            session={session}
            socket={socket}
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
                        {session?.user?.id !== lobby.white?.id &&
                        session?.user?.id !== lobby.black?.id ? (
                          <>
                            <button
                              className={
                                "btn grad1" +
                                (playBtnLoading ? " btn-disabled" : "")
                              }
                              onClick={clickPlay}
                            >
                              Play as {lobby.white?.id ? "black" : "white"}{" "}
                              {playBtnLoading && (
                                <span className="loading-spinner loading loading-xs"></span>
                              )}
                            </button>
                          </>
                        ) : (
                          <>
                            <span className="opacity-80">
                              Waiting for opponent...
                            </span>
                            {!lobby.endReason && (
                              <div className="bg-base-300 fx text-base-content h-8 gap-2 rounded-2xl pl-3 pr-1 text-xs active:opacity-60 sm:h-5 sm:text-sm">
                                <CopyLinkButton
                                  className="fx gap-2 "
                                  link={`${CLIENT_URL}/${initialLobby.code}`}
                                />
                                <ShareButton />
                              </div>
                            )}
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
                    onSquareRightClick={onSquareRightClick}
                    arePremovesAllowed={true}
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
                      lobby={lobby}
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
              addMessage={addMessage}
              chatMessages={chatMessages}
              lobby={lobby}
              session={session}
              socket={socket}
            />
          </div>
        </MenuDrawer>
      )}
    </>
  );
}
