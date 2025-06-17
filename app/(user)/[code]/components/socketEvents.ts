import type { Action, CustomSquares, GameTimer, Lobby, Message } from "@/types";
import type { Game, User } from "@/types";
import type { Dispatch, SetStateAction } from "react";
import type { Socket } from "socket.io-client";

import { syncPgn, syncSide } from "./utils";
import { SoundType } from "./ui/SoundManager";
import { BoardOrientation } from "react-chessboard/dist/chessboard/types";
import { Square } from "chess.js";

export function initSocket(
  user: User,
  socket: Socket,
  lobby: Lobby,
  actions: {
    updateLobby: Dispatch<Action>;
    addMessage: (m: Message) => void;
    updateClock: (c: GameTimer) => void;
    updateCustomSquares: Dispatch<Partial<CustomSquares>>;
    makeMove: (
      m: { from: Square; to: Square; promotion?: string },
      opponent?: boolean
    ) => boolean;
    setNavFen: Dispatch<SetStateAction<string | null>>;
    setNavIndex: Dispatch<SetStateAction<number | null>>;
    playSound: (type: SoundType, isOpponent?: boolean) => void;
    setPerspective: React.Dispatch<React.SetStateAction<BoardOrientation>>;
  }
) {
  const listeners: { event: string; handler: (...args: any[]) => void }[] = [];

  const on = (event: string, handler: (...args: any[]) => void) => {
    socket.on(event, handler);
    listeners.push({ event, handler });
  };

  on("chat", (message: Message) => {
    actions.addMessage(message);
  });

  on("game:update", (latestGame: Game) => {
    syncSide(user, latestGame, lobby, actions);
    if (latestGame.pgn && latestGame.pgn !== lobby.actualGame.pgn()) {
      syncPgn(latestGame.pgn, lobby, actions);
    }
    actions.updateLobby({ type: "updateLobby", payload: latestGame });

    const timer = {
      white: latestGame.timer?.white || 0,
      black: latestGame.timer?.black || 0,
    };
    actions.updateClock(timer);
  });

  on("lobby:update", (latestGame: Game) => {
    actions.updateLobby({ type: "updateLobby", payload: latestGame });
  });

  on("time:update", (timer: GameTimer) => {
    actions.updateClock(timer);
  });

  on(
    "move:update",
    (
      m: { from: Square; to: Square; promotion?: string },
      timer?: GameTimer
    ) => {
      const success = actions.makeMove(m, true);
      if (timer) actions.updateClock(timer);
    }
  );

  on(
    "game:joined_as_player",
    ({ name, side }: { name: string; side: "white" | "black" }) => {
      actions.addMessage({
        author: { name: "server" },
        message: `${name} is now playing as ${side}.`,
      });
      actions.playSound("notify");
    }
  );

  on(
    "game:over",
    ({
      winnerSide,
      result,
    }: {
      winnerSide?: "white" | "black" | "draw";
      result: Game;
    }) => {
      actions.playSound("notify");

      actions.updateLobby({
        type: "updateLobby",
        payload: {
          id: result.id,
          endReason: result.endReason,
          winner: winnerSide || "draw",
          timer: {
            white: result.timer?.white || 0,
            black: result.timer?.black || 0,
          },
          white: {
            id: result.white?.id,
            wallet: result.white?.wallet,
            name: result.white?.name,
          },
          black: {
            id: result.black?.id,
            wallet: result.black?.wallet,
            name: result.black?.name,
          },
        },
      });
    }
  );

  // Return a cleanup function
  return () => {
    for (const { event, handler } of listeners) {
      socket.off(event, handler);
    }
  };
}
