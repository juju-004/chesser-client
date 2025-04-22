"use client";

import type { CustomSquares, Lobby } from "@/types";
import { Game } from "@/types";
import type { Square } from "chess.js";
import { Chess } from "chess.js";
import { ReactNode, useEffect, useReducer, useState } from "react";
import { Chessboard } from "react-chessboard";
import MenuDrawer from "../ui/MenuDrawer";
import { ChessTimer } from "../ui/Timer";
import { useSession } from "@/context/SessionProvider";
import { IconHome, IconMenu } from "@tabler/icons-react";
import Link from "next/link";
import { CopyLinkButton } from "../CopyLink";
import Chat from "../ui/Chat";
import { EndReason } from "../ui/MenuOptions";
import Dock from "../ui/Dock";

export default function ArchivedGame({
  game,
  chatDot,
  children,
}: {
  game: Game;
  chatDot: boolean;
  children?: ReactNode;
}) {
  const session = useSession();
  const [boardWidth, setBoardWidth] = useState(480);
  const [navFen, setNavFen] = useState<string | null>(null);
  const [navIndex, setNavIndex] = useState<number | null>(null);
  const actualGame = new Chess();
  actualGame.loadPgn(game.pgn as string);
  const [perspective, setPerspective] = useState<"black" | "white">(
    session.user?.name === game.black?.name ? "black" : "white"
  );
  const [chatDotArchive, setchatDotArchive] = useState<boolean>(chatDot);

  useEffect(() => {
    setBoardWidth(window.innerWidth);
  }, []);

  const [customSquares, updateCustomSquares] = useReducer(
    (squares: CustomSquares, action: Partial<CustomSquares>) => {
      return { ...squares, ...action };
    },
    {
      options: {},
      lastMove: {},
      rightClicked: {},
      check: {},
    }
  );

  function onSquareRightClick(square: Square) {
    const colour = "rgba(0, 0, 255, 0.4)";
    updateCustomSquares({
      rightClicked: {
        ...customSquares.rightClicked,
        [square]:
          customSquares.rightClicked[square] &&
          customSquares.rightClicked[square]?.backgroundColor === colour
            ? undefined
            : { backgroundColor: colour },
      },
    });
  }

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

  function getNavMoveSquares() {
    const history = actualGame.history({ verbose: true });

    if (!history.length) return;

    let index = navIndex ?? history.length - 1;

    return {
      [history[index].from]: { background: "rgba(255, 255, 0, 0.4)" },
      [history[index].to]: { background: "rgba(255, 255, 0, 0.4)" },
    };
  }

  function getPlayerHtml(color: "black" | "white") {
    const blackHtml = (
      <div className="relative ml-3 flex items-center justify-between gap-4">
        <div className="flex w-full flex-col justify-center">
          <a
            className={
              (game.black?.name ? "font-bold" : "") +
              (typeof game.black?.id === "number"
                ? " text-primary link-hover"
                : " cursor-default")
            }
            href={
              typeof game.black?.id === "number"
                ? `/user/${game.black?.name}`
                : undefined
            }
            target="_blank"
            rel="noopener noreferrer"
          >
            {game.black?.name || "(no one)"}
          </a>
          <span className="flex items-center gap-1 text-xs">
            <span className="opacity-65">black</span>
            {game?.winner && game.winner === "black" && (
              <span className="badge badge-xs badge-success text-white">
                winner
              </span>
            )}
          </span>
        </div>
        <ChessTimer
          color="black"
          initialTime={game.timer?.blackTime}
          active={game.timer?.activeColor === "black"}
        />
      </div>
    );

    const whiteHtml = (
      <div className="relative flex items-center justify-between gap-4">
        <div className="ml-3 flex w-full flex-col justify-center">
          <a
            className={
              (game.white?.name ? "font-bold" : "") +
              (typeof game.white?.id === "number"
                ? " text-primary link-hover"
                : " cursor-default")
            }
            href={
              typeof game.white?.id === "number"
                ? `/user/${game.white?.name}`
                : undefined
            }
            target="_blank"
            rel="noopener noreferrer"
          >
            {game.white?.name || "(no one)"}
          </a>
          <span className="flex items-center gap-1 text-xs">
            <span className="opacity-65">white</span>
            {game?.winner && game.winner === "white" && (
              <span className="badge badge-xs badge-success text-white">
                winner
              </span>
            )}
          </span>
        </div>
        <ChessTimer
          color="white"
          initialTime={game.timer?.whiteTime}
          active={game.timer?.activeColor === "white"}
        />
      </div>
    );

    return color === "black" ? blackHtml : whiteHtml;
  }

  return (
    <MenuDrawer
      actualGame={actualGame}
      lobby={game as Lobby}
      navIndex={navIndex}
      navigateMove={(m: number | null | "prev") => navigateMove(m)}
    >
      <div className="drawer drawer-end">
        <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content">
          <div className="relative flex h-screen  w-full flex-col justify-center gap-3 py-4 lg:gap-10 2xl:gap-16">
            {getPlayerHtml(perspective === "white" ? "black" : "white")}

            <div className="h-min">
              <Chessboard
                boardWidth={boardWidth}
                customDarkSquareStyle={{ backgroundColor: "#4b7399" }}
                customLightSquareStyle={{ backgroundColor: "#eae9d2" }}
                position={navFen || actualGame.fen()}
                boardOrientation={perspective}
                isDraggablePiece={() => false}
                onSquareClick={() => updateCustomSquares({ rightClicked: {} })}
                onSquareRightClick={onSquareRightClick}
                customSquareStyles={{
                  ...getNavMoveSquares(),
                  ...customSquares.rightClicked,
                }}
              />
            </div>
            {getPlayerHtml(perspective)}

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
              <div className="fx h-auto">
                <div className="dropdown dropdown-top">
                  <div tabIndex={0} role="button" className="m-2">
                    <IconMenu />
                  </div>
                  <ul
                    tabIndex={0}
                    className="dropdown-content menu bg-base-200 rounded-box z-1 w-52 gap-3 p-2 shadow-sm"
                  >
                    <li>
                      <Link href={"/"}>
                        <IconHome className="size-4" />
                        Home
                      </Link>
                    </li>
                    <li>
                      <Link href={"/"}>
                        <IconHome className="size-4" />
                        Share Game URL
                      </Link>
                    </li>
                    <li>
                      <CopyLinkButton link="Copy Game PGN"></CopyLinkButton>
                    </li>
                  </ul>
                </div>
              </div>
            </Dock>
          </div>
        </div>
        {children ? (
          <>{children}</>
        ) : (
          <Chat
            setChatDot={() => setchatDotArchive(false)}
            id="my-drawer-4"
            chatMessages={game.chat ? game.chat : []}
          />
        )}
      </div>
    </MenuDrawer>
  );
}
