import type { Chess } from "chess.js";

export interface GameTimer {
  white: number; // in milliseconds
  black: number; // in milliseconds
  lastUpdate?: number; // timestamp
}

export interface Game {
  id?: number | string;
  pgn?: string;
  white?: User;
  black?: User;
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
  code?: string;
  timeout?: number;
  startedAt?: number;
  endedAt?: number;
  timer?: GameTimer;
  timeControl: number; // in minutes
  stake: number;
}

export interface User {
  _id?: number | string; // string for guest IDs
  id?: number | string; // string for guest IDs
  name?: string | null;
  email?: string;
  wins?: number;
  losses?: number;
  draws?: number;
  verified?: boolean;
  isHost?: boolean;

  // mainly for players, not spectators
  wallet?: number;
  offersDraw?: number;
}

export interface Lobby extends Game {
  actualGame: Chess;
  side: "b" | "w" | "s";
}

export interface CustomSquares {
  options: { [square: string]: { background: string; borderRadius?: string } };
  lastMove: { [square: string]: { background: string } };
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

export type ProfileData = User & {
  games?: number;
  online?: boolean;
};

export interface FriendRequest {
  from: Partial<User>; // sender ID
  to: Partial<User>; // receiver ID
  status: "pending" | "rejected" | "accepted";
  createdAt?: string;
  updatedAt?: string;
}
