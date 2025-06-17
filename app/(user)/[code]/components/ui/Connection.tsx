"use client";

import { useSocket } from "@/context/SocketProvider";
import { Lobby } from "@/types";
import React, { useEffect, useRef, useState } from "react";
import { useRoom } from "../context/GameRoom";
import { lobbyStatus } from "../utils";

interface DisconnectProps {
  lobby: Lobby;
}

export function Disconnect({ lobby }: DisconnectProps) {
  const { connectedUsers, getOpponent } = useRoom();
  const [abandonSeconds, setAbandonSeconds] = useState<number | null>(null);
  const { socket } = useSocket();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startCountdown = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setAbandonSeconds((s) => (s as number) - 1);
    }, 1000);
  };

  const cancelCountdown = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      setAbandonSeconds(null);
    }
  };

  useEffect(() => {
    if (
      !lobby.side ||
      lobby.endReason ||
      lobby.winner ||
      lobbyStatus(lobby.actualGame) !== "inPlay" ||
      !lobby.white ||
      !lobby.black
    )
      return;
    const opponent = getOpponent(lobby);
    if (!opponent) return;

    if (!connectedUsers.some((c) => c.id === opponent.id)) {
      setAbandonSeconds(25);
      startCountdown();
    } else if (connectedUsers.some((c) => c.id === opponent.id)) {
      if (abandonSeconds) {
        cancelCountdown();
      }
    }
  }, [connectedUsers]);

  function claimAbandoned(type: "win" | "draw") {
    if (!abandonSeconds) return;
    if (!lobby.side || lobby.endReason || !lobby.pgn || abandonSeconds > 0) {
      return;
    }
    socket.emit("claimAbandoned", type);
  }

  return (
    typeof abandonSeconds === "number" && (
      <div className="fixed z-[99] rounded-xl inset-x-4 top-3">
        <div role="alert" className="alert alert-vertical">
          {abandonSeconds > 0 ? (
            `Your opponent has disconnected. You can claim the win or draw in ${abandonSeconds} second${
              abandonSeconds > 1 ? "s" : ""
            }.`
          ) : (
            <>
              <span className="pt-3">Your opponent has disconnected.</span>
              <div className="flex gap-3">
                <button
                  onClick={() => claimAbandoned("win")}
                  className="btn btn-sm btn-success btn-soft"
                >
                  Claim win
                </button>
                <button
                  onClick={() => claimAbandoned("draw")}
                  className="btn btn-sm"
                >
                  Draw
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    )
  );
}
