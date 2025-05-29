"use client";

import { useSession } from "@/context/SessionProvider";
import { useSocket } from "@/context/SocketProvider";
import { Lobby } from "@/types";
import React, { useEffect, useRef, useState } from "react";
import { useRoom } from "../GameRoom";

interface DisconnectProps {
  lobby: Lobby;
}

export function Disconnect({ lobby }: DisconnectProps) {
  const session = useSession();
  const { connectedUsers, isUserAPlayer, isUserConnected } = useRoom();
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
    const isAPlayer = isUserAPlayer(session.user?.id as string);

    if (
      !isAPlayer ||
      lobby.endReason ||
      lobby.winner ||
      !lobby.pgn ||
      lobby.pgn === "" ||
      !lobby.white ||
      !lobby.black ||
      (lobby.white.id !== session?.user?.id &&
        lobby.black.id !== session?.user?.id)
    )
      return;

    const side = isAPlayer.side === "white" ? "black" : "white";

    if (lobby[side]?.id && !isUserConnected(lobby[side].id as string)) {
      setAbandonSeconds(25);
      startCountdown();
    }

    return () => {
      cancelCountdown();
    };
  }, [connectedUsers]);

  function claimAbandoned(type: "win" | "draw") {
    if (!abandonSeconds) return;
    if (
      lobby.side === "s" ||
      lobby.endReason ||
      !lobby.pgn ||
      abandonSeconds > 0
    ) {
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

export function Reconnect({ lobby }: DisconnectProps) {
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    socket.io.on("reconnect", () => {
      socket.emit("game:join", lobby.code);
    });

    return () => {
      socket.off("reconnect");
    };
  }, []);

  return !isConnected && !lobby.endReason ? <div></div> : <></>;
}
