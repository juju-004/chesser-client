"use client";

import type { GameTimer, Lobby } from "@/types";
import { Game } from "@/types";
import { Chess } from "chess.js";
import { useEffect, useState } from "react";
import { useSession } from "@/context/SessionProvider";
import { BoardOrientation } from "react-chessboard/dist/chessboard/types";
import { getSide } from "../active/Game";
import { useNav } from "@/app/components/Nav";
import GameNav from "../ui/GameNav";
import Dock from "../ui/Dock";
import dynamic from "next/dynamic";

const Chat = dynamic(
  () => import("../ui/Chat").then((mod) => mod.default.Archive),
  { ssr: false }
);
const MenuOptions = dynamic(
  () => import("../ui/MenuOptions").then((mod) => mod.default.Template),
  { ssr: false }
);
const Board = dynamic(() => import("../ui/boards/archive"), {
  ssr: false,
  loading: () => (
    <div className="w-[100vw] h-[100vw] bg-black/30 animate-pulse"></div>
  ),
});

export default function ArchivedGame({ game }: { game: Game }) {
  const session = useSession();
  const [navFen, setNavFen] = useState<string | null>(null);
  const [navIndex, setNavIndex] = useState<number | null>(null);
  const actualGame = new Chess();
  const { setCustomTitle } = useNav();
  actualGame.loadPgn(game.pgn as string);

  const lobby: Lobby = {
    side: getSide(game, session),
    actualGame,
    ...game,
  };
  const [perspective, setPerspective] = useState<BoardOrientation>(
    lobby.side ? lobby.side : "white"
  );
  const [chatDotArchive, setchatDotArchive] = useState<boolean>(
    game.chat ? (game.chat.length > 0 ? true : false) : false
  );

  function navigateMove(index: number | null | "prev") {
    const history = actualGame.history({ verbose: true });

    if (
      index === null ||
      (index !== "prev" && index >= history.length - 1) ||
      !history.length
    ) {
      // last move
      setNavIndex(null);
      setNavFen(null);
      return;
    }

    if (index === "prev") {
      index = history.length - 2;
    } else if (index < 0) {
      index = 0;
    }

    setNavIndex(index);
    setNavFen(history[index].after);
  }

  useEffect(() => {
    setCustomTitle(
      <GameNav
        actualGame={lobby.actualGame}
        navIndex={navIndex}
        lobby={lobby}
        navigateMove={(m: number | null | "prev") => navigateMove(m)}
      />
    );

    return () => {
      setCustomTitle(null);
    };
  }, []);

  return (
    <div className="drawer drawer-end">
      <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content relative">
        <Board
          lobby={lobby}
          clock={game.timer as GameTimer}
          navIndex={navIndex}
          perspective={perspective}
          navFen={navFen}
        />
        <Dock
          actualGame={actualGame}
          navIndex={navIndex}
          chatDot={chatDotArchive}
          setchatDot={() => setchatDotArchive(false)}
          perspective={perspective}
          htmlFor="my-drawer-4"
          navigateMove={(m: number | null | "prev") => navigateMove(m)}
          setPerspective={(m: "black" | "white") => setPerspective(m)}
        >
          <MenuOptions lobby={lobby} />
        </Dock>
      </div>

      <Chat
        setChatDot={() => setchatDotArchive(false)}
        id="my-drawer-4"
        chatMessages={game.chat ? game.chat : []}
      />
    </div>
  );
}
