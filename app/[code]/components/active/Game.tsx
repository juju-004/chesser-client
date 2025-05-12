"use client";
// TODO: restructure, i could use some help with this :>

import type { FormEvent } from "react";

import React, { useEffect, useReducer, useState } from "react";
import { clsx } from "clsx";

import type { GameTimer, Lobby, Message, User } from "@/types";
import type { Game } from "@/types";

import { Chess } from "chess.js";
import { CLIENT_URL } from "@/config";

import { lobbyReducer, squareReducer } from "../reducers";
import { initSocket } from "../socketEvents";
import { lobbyStatus, syncPgn, syncSide, userWalletCheck } from "../utils";
import { CopyLinkButton, ShareButton } from "../CopyLink";
import Chat from "../ui/Chat";
import { useToast } from "@/context/ToastContext";
import MenuOptions, { EndReason, MenuAlert } from "../ui/MenuOptions";
import MenuDrawer from "../ui/GameNav";
import { useChessSounds } from "../ui/SoundManager";
import { useSession } from "@/context/SessionProvider";
import ArchivedGame from "../archive/Game";
import GameOver from "../ui/GameOver";
import Dock from "../ui/Dock";
import PlayerHtml from "../ui/PlayerHtml";
import Disconnect from "../ui/Disconnect";
import Board from "./Board";
import { useRouter } from "next/navigation";
import { useSocket } from "@/context/SocketProvider";
import MenuSlider from "@/app/components/MenuSlider";
import GameNav from "../ui/GameNav";

export default function ActiveGame({ initialLobby }: { initialLobby: Game }) {
  const session = useSession();
  const router = useRouter();
  const { socket, isConnected } = useSocket();

  const side = currentSide(initialLobby, true);
  const [lobby, updateLobby] = useReducer(lobbyReducer, {
    ...initialLobby,
    actualGame: new Chess(),
    side: typeof side === "string" ? side : "s",
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

  const [perspective, setPerspective] = useState<boolean>(false);
  const [chatDot, setchatDot] = useState<boolean>(false);
  const [draw, setDraw] = useState<boolean>(false);
  const [disabled, setDisabled] = useState<boolean>(false);
  const [rematchOffer, setRematchOffer] = useState<boolean>(false);

  const { playSound } = useChessSounds();
  const { toast } = useToast();

  useEffect(() => {
    console.log(isConnected);

    if (!socket || !isConnected || !session?.user?.id) return;

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
      mainActions,
    });

    socket.emit("joinLobby", lobby.code);

    return () => {
      socket.emit("leaveLobby", { game: lobby.code });
      socket.removeAllListeners();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected]);

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

  function mainActions(type: "r" | "d" | "n", code?: string) {
    if (type === "d") {
      setDraw(true);
      setTimeout(() => {
        setDraw(false);
      }, 7000);
    } else if (type === "n") {
      router.replace(code as string);
    } else setRematchOffer(true);
  }

  function updateClock(clock: GameTimer) {
    setClock(clock);
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

    setNavIndex(index);
    setNavFen(history[index].after);
  }

  function currentSide(lobby: Lobby | Game, color?: boolean) {
    if (lobby.white?.id === session.user?.id) {
      return color ? "w" : lobby.white;
    } else if (lobby.black?.id === session.user?.id) {
      return color ? "b" : lobby.black;
    } else return null;
  }

  async function rematchAccept() {
    setDisabled(true);
    const wallet = (currentSide(lobby) as User).wallet || 0;

    if (Math.sign(wallet - lobby.stake) === -1) {
      toast("Insufficient funds", "error");
      setDisabled(false);
      setRematchOffer(false);
      return;
    }

    socket.emit("rematch", {
      stake: lobby.stake,
      host: lobby.host,
      timeControl: lobby.timeControl,
      white: lobby.white,
      black: lobby.black,
    } as Game);
  }

  return (
    <>
      {rematchOffer && (
        <div className="fixed inset-x-4 z-[93] top-3">
          <div role="alert" className="alert alert-vertical">
            <span className="pt-3">Your opponent wants a rematch</span>
            <div className="flex gap-3">
              <button
                onClick={() => setRematchOffer(false)}
                className="btn btn-sm btn-soft btn-error"
              >
                Decline
              </button>
              <button
                onClick={rematchAccept}
                disabled={disabled}
                className="btn btn-sm btn-success btn-soft"
              >
                Accept{" "}
                {disabled && (
                  <span className="loading loading-spinner size-3"></span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      {currentSide(lobby) && (
        <dialog id="gameOverModal" className="modal">
          {lobby.winner && (
            <GameOver
              game={lobby as Game}
              stake={lobby.stake}
              socket={socket}
              countStart={(currentSide(lobby) as User)?.wallet as number}
              rematchOffer={rematchOffer}
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

      {lobby.endReason ? (
        <ArchivedGame game={lobby} socket={socket} chatDot={chatDot}>
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
          <div className="drawer drawer-end">
            <input
              id="my-drawer-45"
              type="checkbox"
              className="drawer-toggle"
            />
            <div className="drawer-content">
              <div className="relative flex h-screen  w-full flex-col justify-center gap-3 py-4 lg:gap-10 2xl:gap-16">
                <>
                  {lobbyStatus(lobby.actualGame) === "inPlay" && (
                    <>
                      {!lobby.black?.connected || !lobby.white?.connected ? (
                        <Disconnect socket={socket} lobby={lobby} />
                      ) : (
                        <MenuAlert
                          draw={draw}
                          socket={socket}
                          setDraw={(v: boolean) => setDraw(v)}
                        />
                      )}
                    </>
                  )}
                </>

                {getPlayerHtml("top", perspective)}
                <div className="relative">
                  {/* overlay */}
                  {(!lobby.white?.id || !lobby.black?.id) && (
                    <div className="absolute bottom-0 right-0 top-0 z-10 flex h-full w-full items-center justify-center bg-black/70">
                      <div className="bg-base-200 flex w-full flex-col items-center justify-center gap-2 px-2 py-4">
                        {!currentSide(lobby) ? (
                          <button
                            className={clsx(
                              "btn grad1",
                              play && "btn-disabled"
                            )}
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

                  <Board
                    lobby={lobby}
                    socket={socket}
                    customSquares={customSquares}
                    navIndex={navIndex}
                    navFen={navFen}
                    makeMove={makeMove}
                    perspective={perspective}
                    updateCustomSquares={updateCustomSquares}
                  />
                </div>
                {getPlayerHtml("bottom", perspective)}

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
        </MenuSlider>
      )}
    </>
  );
}
