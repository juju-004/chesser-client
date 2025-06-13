import { PieceSet } from "@/app/preferences/components/Piece";
import { GameTimer, Lobby } from "@/types";
import React, { ReactNode } from "react";
import { BoardOrientation } from "react-chessboard/dist/chessboard/types";
import PlayerBoard from "../PlayerBoard";
import { EndReason } from "../MenuOptions";

const pieceTypes = ["K", "Q", "R", "B", "N", "P"];
const colors = ["w", "b"];

export const createLocalPieceSet = (style: PieceSet) => {
  const pieces: {
    [key: string]: ({
      squareWidth,
    }: {
      squareWidth: "string" | number | undefined;
    }) => JSX.Element;
  } = {};

  for (const color of colors) {
    for (const type of pieceTypes) {
      const id = `${color}${type}`;
      pieces[id] = ({
        squareWidth,
      }: {
        squareWidth: "string" | number | undefined;
      }) => (
        <img
          src={`/piece/${style}/${id}.svg`} // Assumes public folder
          alt={id}
          style={{ width: squareWidth, height: squareWidth }}
          draggable={false}
        />
      );
    }
  }

  return pieces;
};

interface BoardProps {
  lobby: Lobby;
  isActive?: boolean;
  perspective: BoardOrientation;
  clock: Partial<GameTimer>;
  children?: ReactNode;
  navFen: string | null;
}

export const animationDuration = (tc: number) => {
  if (tc < 3) return 100;
  else if (tc < 4) return 200;
  else if (tc < 7) return 400;
};

export const BoardLoader = () => {
  return <div className=" relative"></div>;
};

export default function Board({
  lobby,
  isActive,
  children,
  perspective,
  clock,
  navFen,
}: BoardProps) {
  function getPlayerBoards(color: "black" | "white") {
    return isActive ? (
      <PlayerBoard.Active
        navFen={navFen}
        time={Number(clock[color])}
        color={color}
        lobby={lobby}
      />
    ) : (
      <PlayerBoard.Archive
        navFen={navFen}
        time={Number(clock[color])}
        color={color}
        lobby={lobby}
      />
    );
  }

  return (
    <div className="flex-col flex w-full h-[calc(100vh-7rem)] justify-center overflow-hidden ">
      {getPlayerBoards(perspective === "white" ? "black" : "white")}

      <div className="py-2 bg-base-100 z-[3] rounded-xl">
        <div className="relative w-[100vw] h-[100vw] mx-auto max-w-xl rounded-xl overflow-hidden">
          {children}
          <div className="absolute -z-10 bg-black/30 inset-0 animate-pulse"></div>
        </div>
      </div>
      {getPlayerBoards(perspective)}
      <EndReason reason={lobby.endReason} winner={lobby.winner} />
    </div>
  );
}
