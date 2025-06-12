"use client";

import type { GameTimer, Lobby } from "@/types";
import { Game } from "@/types";
import { Chess } from "chess.js";
import { useState } from "react";
import { useSession } from "@/context/SessionProvider";
import Chat from "../ui/Chat";
import MenuOptions, { EndReason } from "../ui/MenuOptions";
import Dock from "../ui/Dock";
import MenuSlider from "@/app/components/MenuSlider";
import GameNav from "../ui/GameNav";
import { BoardOrientation } from "react-chessboard/dist/chessboard/types";
import ArchiveBoard from "../ui/boards/archive";
import { getSide } from "../active/Game";

export default function ArchivedGame({ game }: { game: Game }) {
  const session = useSession();
  const [navFen, setNavFen] = useState<string | null>(null);
  const [navIndex, setNavIndex] = useState<number | null>(null);
  const actualGame = new Chess();
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

  return (
    <MenuSlider
      navClass="fixed z-10"
      nav={
        <GameNav
          actualGame={lobby.actualGame}
          navIndex={navIndex}
          lobby={lobby}
          navigateMove={(m: number | null | "prev") => navigateMove(m)}
        />
      }
    >
      <div className="drawer drawer-end">
        <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content">
          <div className="relative flex h-screen w-full flex-col justify-center lg:gap-10 2xl:gap-16">
            <ArchiveBoard
              lobby={lobby}
              clock={game.timer as GameTimer}
              navIndex={navIndex}
              perspective={perspective}
              navFen={navFen}
            />
            <EndReason reason={game.endReason} winner={game.winner} />
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
              <MenuOptions.Template lobby={lobby} />
            </Dock>
          </div>
        </div>

        <Chat.Archive
          setChatDot={() => setchatDotArchive(false)}
          id="my-drawer-4"
          chatMessages={game.chat ? game.chat : []}
        />
      </div>
    </MenuSlider>
  );
}
