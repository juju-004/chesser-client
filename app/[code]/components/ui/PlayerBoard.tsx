"use client";

import { Lobby } from "@/types";
import React from "react";
import { ActiveChessTimer, ChessTimer } from "./Timer";
import { useSocket } from "@/context/SocketProvider";
import Link from "next/link";
import { useRoom } from "../context/GameRoom";

interface PlayerProps {
  color: "black" | "white";
  lobby: Lobby;
  time: number;
}

function Active({ time, color, lobby }: PlayerProps) {
  const { isConnected } = useSocket();
  const { isUserConnected } = useRoom();
  const isActive =
    (lobby.actualGame.turn() === "b" ? "black" : "white") === color;

  return (
    <div className="relative ml-3 flex items-center justify-between gap-4">
      <div className="flex w-full flex-col justify-center">
        <Link
          className={lobby[color]?.id ? "click link-hover" : " cursor-default"}
          href={lobby[color]?.id ? `/user/${lobby[color]?.name}` : "#"}
          target="_blank"
          rel="noopener noreferrer"
        >
          {lobby[color]?.name || "(no one)"}
        </Link>
        <span className="flex items-center gap-1 text-xs">
          <span className="opacity-65">{color}</span>
          {lobby?.winner && lobby.winner === color && (
            <span className="badge badge-xs badge-success text-white">
              winner
            </span>
          )}
          {lobby[color]?.name && (
            <>
              {!isConnected ||
                (!isUserConnected(lobby[color]?.id as string) && (
                  <span className="badge text-white badge-xs badge-error">
                    disconnected
                  </span>
                ))}
            </>
          )}
        </span>
      </div>
      {lobby.endReason ? (
        <ChessTimer color={color} time={time} isActive={isActive} />
      ) : (
        <ActiveChessTimer
          isActive={isActive}
          timerStarted={(lobby.actualGame.history().length || 0) >= 2}
          color={color}
          time={time}
        />
      )}
    </div>
  );
}

function Archive({ time, color, lobby }: PlayerProps) {
  const isActive =
    (lobby.actualGame.turn() === "b" ? "black" : "white") === color;

  return (
    <div className="relative ml-3 flex items-center justify-between gap-4">
      <div className="flex w-full flex-col justify-center">
        <Link
          className={lobby[color]?.id ? "click link-hover" : " cursor-default"}
          href={lobby[color]?.id ? `/user/${lobby[color]?.name}` : "#"}
          target="_blank"
          rel="noopener noreferrer"
        >
          {lobby[color]?.name || "(no one)"}
        </Link>
        <span className="flex items-center gap-1 text-xs">
          <span className="opacity-65">{color}</span>
          {lobby?.winner && lobby.winner === color && (
            <span className="badge badge-xs badge-success text-white">
              winner
            </span>
          )}
        </span>
      </div>
      <ChessTimer color={color} time={time} isActive={isActive} />
    </div>
  );
}

const PlayerBoard = { Active, Archive };

export default PlayerBoard;
