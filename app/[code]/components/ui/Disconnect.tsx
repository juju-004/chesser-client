import { useSession } from "@/context/SessionProvider";
import { Lobby } from "@/types";
import React, { useEffect, useState } from "react";
import { Socket } from "socket.io-client";

interface DisconnectProps {
  lobby: Lobby;
  socket: Socket;
}

function Disconnect({ lobby, socket }: DisconnectProps) {
  const session = useSession();
  const [abandonSeconds, setAbandonSeconds] = useState(25);

  useEffect(() => {
    if (
      lobby.side === "s" ||
      lobby.endReason ||
      lobby.winner ||
      !lobby.pgn ||
      !lobby.white ||
      !lobby.black ||
      (lobby.white.id !== session?.user?.id &&
        lobby.black.id !== session?.user?.id)
    )
      return;

    let interval: number;
    if (!lobby.white?.connected || !lobby.black?.connected) {
      setAbandonSeconds(30);
      interval = Number(
        setInterval(() => {
          if (
            abandonSeconds === 0 ||
            (lobby.white?.connected && lobby.black?.connected)
          ) {
            clearInterval(interval);
            return;
          }
          setAbandonSeconds((s) => s - 1);
        }, 1000)
      );
    }
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    lobby.black,
    lobby.white,
    lobby.black?.disconnectedOn,
    lobby.white?.disconnectedOn,
  ]);

  function claimAbandoned(type: "win" | "draw") {
    if (
      lobby.side === "s" ||
      lobby.endReason ||
      !lobby.pgn ||
      abandonSeconds > 0 ||
      (lobby.black?.connected && lobby.white?.connected)
    ) {
      return;
    }
    socket.emit("claimAbandoned", type);
  }

  return (
    <>
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
    </>
  );
}

export default Disconnect;
