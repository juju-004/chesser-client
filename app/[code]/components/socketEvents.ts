import type { Action, CustomSquares, Lobby, Message } from "@/types";
import type { Game, User } from "@/types";
import type { Dispatch, SetStateAction } from "react";
import type { Socket } from "socket.io-client";

import { syncPgn, syncSide } from "./utils";
import { GameTimerStarted } from "./active/Game";

export function initSocket(
  user: User,
  socket: Socket,
  lobby: Lobby,
  actions: {
    updateLobby: Dispatch<Action>;
    addMessage: Function;
    setTimer: Function;
    onReconnect?: Function;
    updateCustomSquares: Dispatch<Partial<CustomSquares>>;
    makeMove: Function;
    setNavFen: Dispatch<SetStateAction<string | null>>;
    setNavIndex: Dispatch<SetStateAction<number | null>>;
    playSound: Function;
  }
) {
  socket.on("connect", () => {
    socket.emit("joinLobby", lobby.code);
  });

  socket.on("chat", (message: Message) => {
    actions.addMessage(message);
  });

  socket.on("updateLobby", (game: Game) => {
    actions.updateLobby({ type: "updateLobby", payload: game });
  });

  socket.on("receivedLatestGame", (latestGame: Game) => {
    if (latestGame.pgn && latestGame.pgn !== lobby.actualGame.pgn()) {
      syncPgn(latestGame.pgn, lobby, actions);
    }
    actions.updateLobby({ type: "updateLobby", payload: latestGame });

    const timer = {
      whiteTime: latestGame.timer?.whiteTime,
      blackTime: latestGame.timer?.blackTime,
      timerStarted: latestGame.timer?.started,
      activeColor: latestGame.timer?.activeColor,
    };
    actions.setTimer(timer);

    syncSide(user, latestGame, lobby, actions);
  });

  socket.on("timeUpdate", (timer: GameTimerStarted, inPlay?: boolean) => {
    actions.setTimer(timer);

    if (inPlay) {
      actions.updateLobby({
        type: "updateLobby",
        payload: {
          status: "inPlay",
        },
      });
    }
  });

  socket.on(
    "receivedMove",
    (m: { from: string; to: string; promotion?: string }) => {
      const success = actions.makeMove(m, true);
      if (!success) {
        socket.emit("getLatestGame");
      }
    }
  );

  socket.on(
    "userJoinedAsPlayer",
    ({ name, side }: { name: string; side: "white" | "black" }) => {
      actions.addMessage({
        author: { name: "server" },
        message: `${name} is now playing as ${side}.`,
      });
      actions.playSound("notify");
    }
  );

  socket.on(
    "gameOver",
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
}
