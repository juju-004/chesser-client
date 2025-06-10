import { PieceSet } from "@/app/preferences/components/Piece";
import { GameTimer, Lobby } from "@/types";
import React, { ReactNode } from "react";
import { BoardOrientation } from "react-chessboard/dist/chessboard/types";
import PlayerBoard from "../PlayerBoard";

const pieceTypes = ["K", "Q", "R", "B", "N", "P"];
const colors = ["w", "b"];

export const createLocalPieceSet = (style: PieceSet) => {
  const pieces: { [key: string]: () => JSX.Element } = {};

  for (const color of colors) {
    for (const type of pieceTypes) {
      const id = `${color}${type}`;
      pieces[id] = () => (
        <img
          src={`/piece/${style}/${id}.svg`} // Assumes public folder
          alt={id}
          style={{ width: "100%", height: "100%" }}
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
}: BoardProps) {
  function getPlayerBoards(color: "black" | "white") {
    return isActive ? (
      <PlayerBoard.Active
        time={Number(clock[color])}
        color={color}
        lobby={lobby}
      />
    ) : (
      <PlayerBoard.Archive
        time={Number(clock[color])}
        color={color}
        lobby={lobby}
      />
    );
  }

  return (
    <>
      {getPlayerBoards(perspective === "white" ? "black" : "white")}

      <div className="relative w-[100vw] h-[100vw] mx-auto max-w-xl rounded-xl overflow-hidden">
        {children}
        <div className="absolute -z-10 bg-black/30 inset-0 animate-pulse"></div>
      </div>

      {getPlayerBoards(perspective)}
    </>
  );
}
