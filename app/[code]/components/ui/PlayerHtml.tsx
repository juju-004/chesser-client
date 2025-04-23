import { Lobby } from "@/types";
import React from "react";
import { ActiveChessTimer, ChessTimer } from "./Timer";

interface PlayerProps {
  color: "black" | "white";
  lobby: Lobby;
  time: number;
}

function PlayerHtml({ time, color, lobby }: PlayerProps) {
  const isActive =
    (lobby.actualGame.turn() === "b" ? "black" : "white") === color;
  return (
    <div className="relative ml-3 flex items-center justify-between gap-4">
      <div className="flex w-full flex-col justify-center">
        <a
          className={
            (lobby[color]?.name ? "font-bold" : "") +
            (typeof lobby[color]?.id === "number"
              ? " text-primary link-hover"
              : " cursor-default")
          }
          href={
            typeof lobby[color]?.id === "number"
              ? `/user/${lobby[color]?.name}`
              : undefined
          }
          target="_blank"
          rel="noopener noreferrer"
        >
          {lobby[color]?.name || "(no one)"}
        </a>
        <span className="flex items-center gap-1 text-xs">
          <span className="opacity-65">{color}</span>
          {lobby?.winner && lobby.winner === color && (
            <span className="badge badge-xs badge-success text-white">
              winner
            </span>
          )}
          {lobby[color]?.connected === false && (
            <span className="badge badge-xs badge-error">disconnected</span>
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

export default PlayerHtml;
