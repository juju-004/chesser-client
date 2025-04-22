import type { Chess } from "chess.js";

export interface GameTimer {
  whiteTime: number; // in milliseconds
  blackTime: number; // in milliseconds
  lastUpdate: number; // timestamp
  activeColor: "white" | "black";
  started: boolean;
}

export interface Game {
  id?: number | string;
  pgn?: string;
  white?: User;
  black?: User;
  status?: "started" | "inPlay" | "ended";
  winner?: "white" | "black" | "draw";
  endReason?:
    | "draw"
    | "checkmate"
    | "stalemate"
    | "repetition"
    | "insufficient"
    | "abandoned"
    | "timeout"
    | "resigned"
    | "aborted";
  host?: User;
  code?: string;
  unlisted?: boolean;
  timeout?: number;
  observers?: User[];
  startedAt?: number;
  endedAt?: number;
  timer?: GameTimer;
  timeControl: number; // in minutes
  stake: number;
  chat?: Message[];
}

export interface User {
  id?: number | string; // string for guest IDs
  name?: string | null;
  email?: string;
  wins?: number;
  losses?: number;
  draws?: number;
  verified?: boolean;

  // mainly for players, not spectators
  wallet?: number;
  connected?: boolean;
  disconnectedOn?: number;
  offersDraw?: number;
}

export interface Lobby extends Game {
  actualGame: Chess;
  side: "b" | "w" | "s";
}

export interface CustomSquares {
  options: { [square: string]: { background: string; borderRadius?: string } };
  lastMove: { [square: string]: { background: string } };
  rightClicked: { [square: string]: { backgroundColor: string } | undefined };
  check: {
    [square: string]: {
      background: string;
      borderRadius?: string;
      boxShadow?: string;
    };
  };
}

export type Action =
  | {
      type: "updateLobby";
      payload: Partial<Lobby>;
    }
  | {
      type: "setSide";
      payload: Lobby["side"];
    }
  | {
      type: "setGame";
      payload: Chess;
    };

export interface Message {
  author: User;
  message: string;
}

export interface Session {
  user: User | null;
}
