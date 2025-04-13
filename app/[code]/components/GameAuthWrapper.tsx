"use client";

import type { Game } from "@/types";

import GamePage from "./GamePage";
import { useSession } from "@/context/SessionProvider";

export default function GameAuthWrapper({
  initialLobby,
}: {
  initialLobby: Game;
}) {
  const session = useSession();

  if (!session?.user || !session.user?.id) {
    return (
      <div className="flex flex-col items-center justify-center gap-4">
        <div className="text-2xl font-bold">Loading</div>
        <div className="text-xl">Waiting for authentication...</div>
      </div>
    );
  }

  return <GamePage initialLobby={initialLobby} />;
}
