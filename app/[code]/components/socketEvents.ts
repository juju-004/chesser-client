import type { Action, CustomSquares, GameTimer, Lobby, Message } from "@/types";
import type { Game, User } from "@/types";
import type { Dispatch, SetStateAction } from "react";
import type { Socket } from "socket.io-client";

import { syncPgn, syncSide } from "./utils";
import { SoundType } from "./ui/SoundManager";

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
      m: { from: string; to: string; promotion?: string },
      opponent?: boolean
    ) => boolean;
    setNavFen: Dispatch<SetStateAction<string | null>>;
    setNavIndex: Dispatch<SetStateAction<number | null>>;
    playSound: (type: SoundType, isOpponent?: boolean) => void;
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
    console.log(latestGame);

    actions.updateLobby({ type: "updateLobby", payload: latestGame });
  });

  on("time:update", (timer: GameTimer) => {
    actions.updateClock(timer);
  });

  on(
    "move:update",
    (
      m: { from: string; to: string; promotion?: string },
      timer?: GameTimer
    ) => {
      const success = actions.makeMove(m, true);
      if (timer) actions.updateClock(timer);
      if (!success) socket.emit("game:get_game");
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
      winnerName,
      winnerSide,
      result,
    }: {
      winnerName?: string;
      winnerSide?: "white" | "black" | "draw";
      result: Game;
    }) => {
      actions.playSound("notify");
      const m = {
        author: { name: "server" },
      } as Message;

      const reason: Game["endReason"] = result.endReason;

      if (reason === "abandoned") {
        if (!winnerSide) {
          m.message = `${winnerName} has claimed a draw due to abandonment.`;
        } else {
          m.message = `${winnerName} (${winnerSide}) has claimed the win due to abandonment.`;
        }
      } else if (reason === "checkmate") {
        m.message = `${winnerName} (${winnerSide}) has won by checkmate.`;
      } else if (reason === "timeout") {
        m.message = `${winnerName} (${winnerSide}) has won by timeout.`;
      } else if (reason === "resigned") {
        m.message = `${winnerSide === "white" ? "black" : "white"} resigned`;
      } else {
        let message = "The game has ended in a draw";
        if (reason === "repetition") {
          message = message.concat(" due to threefold repetition");
        } else if (reason === "insufficient") {
          message = message.concat(" due to insufficient material");
        } else if (reason === "stalemate") {
          message = "The game has been drawn due to stalemate";
        }
        m.message = message.concat(".");
      }
      actions.updateLobby({
        type: "updateLobby",
        payload: {
          id: result.id,
          endReason: reason,
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
      actions.addMessage(m);
    }
  );

  // Return a cleanup function
  return () => {
    for (const { event, handler } of listeners) {
      socket.off(event, handler);
    }
  };
}
