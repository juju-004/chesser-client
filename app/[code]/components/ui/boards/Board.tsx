import { PieceSet } from "@/app/preferences/components/Piece";
import { GameTimer, Lobby } from "@/types";
import React, { ReactNode } from "react";
import { Chessboard } from "react-chessboard";
import { BoardOrientation } from "react-chessboard/dist/chessboard/types";
import PlayerHtml from "../PlayerHtml";

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
  perspective: BoardOrientation;
  clock: Partial<GameTimer>;
  children: ReactNode;
}

export const animationDuration = (tc: number) => {
  if (tc < 3) return 100;
  else if (tc < 4) return 200;
  else if (tc < 7) return 400;
};

export const BoardLoader = () => {
  return (
    <div className="w-full absolute">
      <div className=""></div>
      <Chessboard />
    </div>
  );
};

export default function Board({
  lobby,
  children,
  perspective,
  clock,
}: BoardProps) {
  function getPlayerHtml(color: "black" | "white") {
    const blackHtml = (
      <PlayerHtml time={Number(clock.black)} color="black" lobby={lobby} />
    );

    const whiteHtml = (
      <PlayerHtml time={Number(clock.white)} color="white" lobby={lobby} />
    );
    return color === "black" ? blackHtml : whiteHtml;
  }

  return (
    <>
      {getPlayerHtml(perspective === "white" ? "black" : "white")}

      <div className="relative w-full mx-auto max-w-xl rounded-xl overflow-hidden">
        {children}
      </div>

      {getPlayerHtml(perspective)}
    </>
  );
}
