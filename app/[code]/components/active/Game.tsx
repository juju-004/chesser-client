"use client";

import type { FormEvent } from "react";

import React, { useEffect, useReducer, useRef, useState } from "react";
import { clsx } from "clsx";

import type { GameTimer, Lobby, Message, Session } from "@/types";
import type { Game } from "@/types";

import { Chess } from "chess.js";
import { CLIENT_URL } from "@/config";

import { lobbyReducer, squareReducer } from "../reducers";
import { initSocket } from "../socketEvents";
import { lobbyStatus, userWalletCheck } from "../utils";
import { CopyLinkButton, ShareButton } from "../ui/CopyLink";
import Chat from "../ui/Chat";
import { useToast } from "@/context/ToastContext";
import MenuOptions, { EndReason, MenuAlert } from "../ui/MenuOptions";
import { useChessSounds } from "../ui/SoundManager";
import { useSession } from "@/context/SessionProvider";
import Dock from "../ui/Dock";
import { Disconnect } from "../ui/Connection";
import { useSocket } from "@/context/SocketProvider";
import MenuSlider from "@/app/components/MenuSlider";
import GameNav from "../ui/GameNav";
import { RoomProvider } from "../context/GameRoom";
import { BoardOrientation } from "react-chessboard/dist/chessboard/types";
import ActiveBoard from "../ui/boards/active";
import GameOver from "../ui/GameOver";

export function getSide(lobby: Lobby | Game, session: Session) {
  if (lobby.white?.id === session.user?.id) return "white";
  else if (lobby.black?.id === session.user?.id) return "black";
  else return null;
}

export default function ActiveGame({ initialLobby }: { initialLobby: Game }) {
  const session = useSession();
  const { socket } = useSocket();

  const [lobby, updateLobby] = useReducer(lobbyReducer, {
    ...initialLobby,
    actualGame: new Chess(),
    side: getSide(initialLobby, session),
  });

  const [customSquares, updateCustomSquares] = useReducer(squareReducer, {
    options: {},
    lastMove: {},
    check: {},
  });

  const [navFen, setNavFen] = useState<string | null>(null);
  const [navIndex, setNavIndex] = useState<number | null>(null);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);

  const [play, setPlay] = useState(false);
  const [clock, setClock] = useState<GameTimer>({
    white: initialLobby.timeControl * 60 * 1000,
    black: initialLobby.timeControl * 60 * 1000,
  });
  // const lastUpdate = useRef<number>(0);

  const [perspective, setPerspective] = useState<BoardOrientation>(
    lobby.side ? lobby.side : "white"
  );
  const [chatDot, setchatDot] = useState<boolean>(false);

  const { playSound } = useChessSounds();
  const { toast } = useToast();

  useEffect(() => {
    if (!socket || !session?.user?.id) return;

    const cleanupSocket = initSocket(session.user, socket, lobby, {
      updateLobby,
      addMessage,
      updateCustomSquares,
      makeMove,
      setNavFen,
      setNavIndex,
      updateClock,
      playSound,
      setPerspective,
    });

    socket.emit("game:join", lobby.code);
    return () => {
      cleanupSocket();
    };
  }, []);

  useEffect(() => {
    if (clock.lastUpdate && lobbyStatus(lobby.actualGame) !== "inPlay")
      socket.emit("game:refresh", lobby.code);
  }, [clock]);

  useEffect(() => {
    updateTurnTitle();

    if (lobby.endReason && lobby.endReason !== "aborted" && lobby.side) {
      (
        document.getElementById("gameOverModal") as HTMLDialogElement
      )?.showModal();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lobby]);

  function updateTurnTitle() {
    if (!lobby.side || !lobby.white?.id || !lobby.black?.id) return;

    if (!lobby.endReason && lobby.side[0] === lobby.actualGame.turn()) {
      document.title = "(your turn) chesser";
    } else {
      document.title = "chesser";
    }
  }

  function updateClock(cloc: GameTimer) {
    setClock(cloc);
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
        // Sound
        if (result.captured) playSound("capture");
        else if (opponent) playSound("move", true);
        else playSound("move");

        setNavFen(null);
        setNavIndex(null);
        updateLobby({
          type: "updateLobby",
          payload: {
            pgn: lobby.actualGame.pgn(),
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

  async function clickPlay(e: FormEvent<HTMLButtonElement>) {
    setPlay(true);
    e.preventDefault();

    const data = await userWalletCheck(initialLobby.stake);

    if (data.type === "e") {
      toast(data.message as string, "error");
      setPlay(false);
      return;
    }

    socket.emit("joinAsPlayer");
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

    setNavIndex(index);
    setNavFen(history[index].after);
  }

  return (
    <RoomProvider>
      <MenuSlider
        navClass="fixed z-10"
        nav={
          <GameNav
            actualGame={lobby.actualGame}
            navIndex={navIndex}
            lobby={lobby}
            navigateMove={(m: number | null | "prev") => navigateMove(m)}
          />
        }
      >
        {lobby.side && (
          <>
            <dialog id="resignModal" className="modal">
              <div className="modal-box flex flex-col items-center gap-5">
                <h3 className="text-lg">Resign??</h3>
                <form method="dialog" className="flex gap-4">
                  <button className="btn w-16 rounded-2xl btn-soft btn-success">
                    No
                  </button>
                  <button
                    onClick={() => socket.emit("resign")}
                    className="btn w-16 rounded-2xl btn-error btn-soft "
                  >
                    Yes
                  </button>
                </form>
              </div>
            </dialog>
            {lobby.winner && (
              <dialog id="gameOverModal" className="modal">
                <GameOver
                  lobby={lobby}
                  stake={lobby.stake}
                  countStart={lobby[lobby.side]?.wallet as number}
                  isWinner={
                    lobby.winner === "draw"
                      ? "draw"
                      : lobby.winner === lobby.side
                      ? true
                      : false
                  }
                />
              </dialog>
            )}
          </>
        )}
        <div className="drawer drawer-end">
          <input id="my-drawer-45" type="checkbox" className="drawer-toggle" />
          <div className="drawer-content">
            {lobbyStatus(lobby.actualGame) === "inPlay" && !lobby.endReason && (
              <>
                <Disconnect lobby={lobby} />
                {lobby.side && <MenuAlert />}
              </>
            )}

            <ActiveBoard
              lobby={lobby}
              socket={socket}
              clock={clock}
              customSquares={customSquares}
              navIndex={navIndex}
              navFen={navFen}
              makeMove={makeMove}
              perspective={perspective}
              updateCustomSquares={updateCustomSquares}
            >
              {(!lobby.white?.id || !lobby.black?.id) && !lobby.endReason && (
                <div className="absolute bottom-0 right-0 top-0 z-10 flex h-full w-full items-center justify-center bg-black/70">
                  <div className="bg-base-200 flex w-full flex-col items-center justify-center gap-2 px-2 py-4">
                    {!lobby.side ? (
                      <button
                        className={clsx("btn grad1", play && "btn-disabled")}
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
            </ActiveBoard>
            <Dock
              actualGame={lobby.actualGame}
              navIndex={navIndex}
              perspective={perspective}
              chatDot={chatDot}
              htmlFor="my-drawer-45"
              navigateMove={(m: number | null | "prev") => navigateMove(m)}
              setPerspective={(m: BoardOrientation) => setPerspective(m)}
              setchatDot={() => setchatDot(false)}
            >
              <MenuOptions.Active lobby={lobby} />
            </Dock>
          </div>
          <Chat.Active
            id="my-drawer-45"
            side={lobby.side}
            setChatDot={() => setchatDot(false)}
            addMessage={addMessage}
            chatMessages={chatMessages}
          />
        </div>
      </MenuSlider>
    </RoomProvider>
  );
}
