"use client";

import { Lobby } from "@/types";
import React from "react";
import { ActiveChessTimer, ChessTimer } from "./Timer";
import { useRoom } from "../context/GameRoom";
import { BoardOrientation } from "react-chessboard/dist/chessboard/types";
import { FC } from "react";
import {
  IconChessQueen,
  IconChessRook,
  IconChessBishop,
  IconChessKnight,
  IconChess,
  IconCircleFilled,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { useSocket } from "@/context/SocketProvider";

interface Panel {
  color: BoardOrientation;
  lobby: Lobby;
  navFen: string | null;
}
interface PlayerProps extends Panel {
  time: number;
}

type Props = {
  fen: string;
  color: "white" | "black"; // Which player's point of view
};

const pieceIcons: Record<string, JSX.Element> = {
  q: <IconChessQueen size={17} stroke={1} />,
  r: <IconChessRook size={17} stroke={1} />,
  b: <IconChessBishop size={17} stroke={1} />,
  n: <IconChessKnight size={17} stroke={1} />,
  p: <IconChess size={17} stroke={1} />,
};

const piecePoints: Record<string, number> = {
  q: 9,
  r: 5,
  b: 3,
  n: 3,
  p: 1,
};

const CapturedPiecesDisplay: FC<Props> = ({ fen, color }) => {
  const parseCapturedDifference = (fen: string) => {
    const board = fen.split(" ")[0];
    const counts: Record<"w" | "b", Record<string, number>> = { w: {}, b: {} };

    // Count pieces on the board
    for (const char of board) {
      if (char === "/" || /\d/.test(char)) continue;
      const isWhite = char === char.toUpperCase();
      const piece = char.toLowerCase();
      const side = isWhite ? "w" : "b";
      counts[side][piece] = (counts[side][piece] || 0) + 1;
    }

    // Starting position piece counts
    const starting: Record<string, number> = {
      p: 8,
      r: 2,
      n: 2,
      b: 2,
      q: 1,
    };

    const whiteCaptured: Record<string, number> = {};
    const blackCaptured: Record<string, number> = {};

    for (const piece of Object.keys(starting)) {
      whiteCaptured[piece] = starting[piece] - (counts["b"][piece] || 0);
      blackCaptured[piece] = starting[piece] - (counts["w"][piece] || 0);
    }

    return { whiteCaptured, blackCaptured };
  };

  const getDisplayData = () => {
    const { whiteCaptured, blackCaptured } = parseCapturedDifference(fen);
    const self = color === "white" ? whiteCaptured : blackCaptured;
    const opponent = color === "white" ? blackCaptured : whiteCaptured;

    const diff: { piece: string; count: number }[] = [];
    let pointDiff = 0;

    for (const piece of Object.keys(piecePoints)) {
      const netCount = (self[piece] || 0) - (opponent[piece] || 0);
      if (netCount > 0) {
        diff.push({ piece, count: netCount });
        pointDiff += netCount * piecePoints[piece];
      } else if (netCount < 0) {
        pointDiff += netCount * piecePoints[piece]; // still subtract
      }
    }

    return { diff, pointDiff };
  };

  const { diff, pointDiff } = getDisplayData();

  if (diff.length === 0 && pointDiff <= 0) return null;

  return (
    <div className="flex items-center flex-1">
      <div className="flex flex-wrap">
        {diff.map(({ piece, count }) =>
          Array.from({ length: count }).map((_, i) => (
            <span key={`${piece}-${i}`} className="">
              {pieceIcons[piece]}
            </span>
          ))
        )}
      </div>
      {pointDiff > 0 && (
        <span className="text-sm text-secondary">+{pointDiff}</span>
      )}
    </div>
  );
};

function UserPanel({
  lobby,
  color,
  navFen,
  onLine,
}: Panel & { onLine: boolean | null }) {
  const router = useRouter();

  const onClick = () => {
    if (lobby[color]) {
      router.push(`/u/${lobby[color]?.name}`);
    }
  };
  return (
    <>
      <button
        onClick={onClick}
        className={clsx(
          "flex click px-3 gap-1 py-0.5 items-center rounded-xl justify-start",
          lobby[color]?.name && "bg-white/5 opacity-80",
          typeof onLine === "boolean" ? "pl-2 pr-3" : "px-3"
        )}
      >
        {onLine !== null && (
          <IconCircleFilled
            size={14}
            className={clsx(onLine ? " text-green-500 " : "text-gray-500")}
          />
        )}
        <span className="flex flex-col items-start">
          {lobby[color] ? lobby[color]?.name : "(no one)"}
          <span className="flex items-center gap-1 text-xs">
            <span className="opacity-50">{color}</span>
            {lobby?.winner && lobby.winner === color && (
              <span className="badge badge-xs badge-success text-white">
                winner
              </span>
            )}
          </span>
        </span>
      </button>
      <CapturedPiecesDisplay
        color={color}
        fen={navFen || lobby.actualGame.fen()}
      />
    </>
  );
}

function Active({ time, color, navFen, lobby }: PlayerProps) {
  const { connectedUsers } = useRoom();
  const { isConnected } = useSocket();
  const isActive =
    (lobby.actualGame.turn() === "b" ? "black" : "white") === color;

  return (
    <div className="relative group ml-3 flex items-center justify-between gap-4">
      <UserPanel
        onLine={
          connectedUsers.some((c) => c.name === lobby[color]?.name) &&
          isConnected
        }
        navFen={navFen}
        color={color}
        lobby={lobby}
      />

      <ActiveChessTimer
        isActive={isActive}
        timerStarted={(lobby.actualGame.history().length || 0) >= 2}
        color={color}
        time={time}
      />
    </div>
  );
}

function Archive({ time, color, navFen, lobby }: PlayerProps) {
  const isActive =
    (lobby.actualGame.turn() === "b" ? "black" : "white") === color;

  return (
    <div className="relative group ml-3 flex justify-between items-center gap-4">
      <UserPanel onLine={null} navFen={navFen} color={color} lobby={lobby} />
      <ChessTimer color={color} time={time} isActive={isActive} />
    </div>
  );
}

const PlayerBoard = { Active, Archive };

export default PlayerBoard;
