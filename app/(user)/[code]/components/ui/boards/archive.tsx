"use client";

import { usePreference } from "@/context/PreferenceProvider";
import Board, { createLocalPieceSet } from "./Board";
import { Chessboard } from "react-chessboard";
import { GameTimer, Lobby } from "@/types";
import { BoardOrientation } from "react-chessboard/dist/chessboard/types";
import { themes } from "@/app/(user)/preferences/components/Theme";

interface ArchiveBoardProps {
  lobby: Lobby;
  navFen: string | null;
  perspective: BoardOrientation;
  navIndex: number | null;
  clock: Partial<GameTimer>;
}

export default function ArchiveBoard({
  lobby,
  navIndex,
  navFen,
  perspective,
  clock,
}: ArchiveBoardProps) {
  const { userPreference } = usePreference();
  const pieces = userPreference && createLocalPieceSet(userPreference.pieceset);

  function getNavMoveSquares() {
    const history = lobby.actualGame.history({ verbose: true });

    if (!history.length) return;

    let index = navIndex ?? history.length - 1;

    const activeNavMove = document.getElementById("activeNavMove");
    document
      .getElementById("movelist")
      ?.scrollTo(
        (activeNavMove?.offsetLeft as number) - window.innerWidth / 2 + 22,
        0
      );

    return {
      [history[index].from]: { background: "rgba(255, 255, 0, 0.4)" },
      [history[index].to]: { background: "rgba(255, 255, 0, 0.4)" },
    };
  }

  return (
    <Board
      navFen={navFen}
      clock={clock}
      lobby={lobby}
      perspective={perspective}
    >
      {userPreference && (
        <Chessboard
          boardOrientation={perspective}
          isDraggablePiece={() => false}
          customDarkSquareStyle={{
            backgroundColor: themes[userPreference?.theme][1],
          }}
          customLightSquareStyle={{
            backgroundColor: themes[userPreference?.theme][0],
          }}
          position={navFen || lobby.actualGame.fen()}
          customSquareStyles={{
            ...getNavMoveSquares(),
          }}
          customPieces={pieces}
        />
      )}
    </Board>
  );
}
