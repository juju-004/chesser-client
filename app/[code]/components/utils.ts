import { getWallet } from "@/lib/user";
import type { Action, CustomSquares, Lobby } from "@/types";
import type { Game, User } from "@/types";
import { Chess } from "chess.js";
import type { Dispatch, SetStateAction } from "react";
import { BoardOrientation } from "react-chessboard/dist/chessboard/types";

export const syncPgn = (
  latestPgn: string,
  lobby: Lobby,
  actions: {
    updateCustomSquares: Dispatch<Partial<CustomSquares>>;
    setNavFen: Dispatch<SetStateAction<string | null>>;
    setNavIndex: Dispatch<SetStateAction<number | null>>;
  }
) => {
  actions.setNavFen(null);
  actions.setNavIndex(null);
  lobby.actualGame.loadPgn(latestPgn as string);

  const lastMove = lobby.actualGame.history({ verbose: true }).pop();

  let lastMoveSquares = undefined;
  let kingSquare = undefined;
  if (lastMove) {
    lastMoveSquares = {
      [lastMove.from]: { background: "rgba(255, 255, 0, 0.4)" },
      [lastMove.to]: { background: "rgba(255, 255, 0, 0.4)" },
    };
  }
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
  actions.updateCustomSquares({
    lastMove: lastMoveSquares,
    check: kingSquare,
  });
};

export const syncSide = (
  user: User,
  game: Game | undefined,
  lobby: Lobby,
  actions: {
    updateLobby: Dispatch<Action>;
    setPerspective: React.Dispatch<React.SetStateAction<BoardOrientation>>;
  }
) => {
  if (!game) game = lobby;
  if (game.black?.id === user?.id) {
    if (lobby.side !== "black") {
      actions.updateLobby({ type: "setSide", payload: "black" });
      actions.setPerspective("black");
    }
  } else if (game.white?.id === user?.id) {
    if (lobby.side !== "white") {
      actions.updateLobby({ type: "setSide", payload: "white" });
      actions.setPerspective("white");
    }
  } else {
    actions.updateLobby({ type: "setSide", payload: null });
  }
};

export const condition = (v: any, items: []) => {
  items.forEach((i) => {
    if (i[0] === v) {
      return i[1] || i[0];
    }
  });
};

export const userWalletCheck = async (stake: number) => {
  try {
    const data = await getWallet();

    if (Math.sign(data.wallet - stake) === -1) {
      return { type: "e", message: "Insufficient funds" };
    }

    return { type: "s" };
  } catch (error) {
    return { type: "e", message: "Something went wrong" };
  }
};

export const lobbyStatus = (game: Chess) => {
  if (game.history().length >= 2) return "inPlay";
  else return "started";
};
