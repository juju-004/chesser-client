"use client";

import { Lobby } from "@/types";
import React, { useEffect, useRef } from "react";
import type { Chess } from "chess.js";

interface Menu {
  lobby?: Lobby;
  navIndex: number | null;
  navigateMove: Function;
  actualGame: Chess;
}

function GameNav({ lobby, actualGame, navIndex, navigateMove }: Menu) {
  const moveListRef = useRef<HTMLDivElement>(null);

  if (lobby) {
    useEffect(() => {
      const moveList = moveListRef.current;

      if (!moveList) return;
      const len = lobby.pgn?.split(".");
      if (!len) return;
      moveList.scrollLeft = window.innerWidth * len?.length;
    }, [lobby.pgn]);
  }

  function getMoveListHtml() {
    const history = actualGame.history({ verbose: true });

    const button = (move: any) => {
      return (
        <button
          className={
            "btn btn-ghost mr-2 h-full font-normal normal-case" +
            ((history.indexOf(move) === history.length - 1 &&
              navIndex === null) ||
            navIndex === history.indexOf(move)
              ? " pointer-events-none bg-white/5 rounded-sm"
              : " opacity-70")
          }
          id={
            (history.indexOf(move) === history.length - 1 &&
              navIndex === null) ||
            navIndex === history.indexOf(move)
              ? "activeNavMove"
              : ""
          }
          onClick={() => navigateMove(history.indexOf(move))}
        >
          {move?.san}
        </button>
      );
    };

    const movePairs = history
      .slice(history.length / 2)
      .map((_, i) => history.slice((i *= 2), i + 2));

    return movePairs.map((moves, i) => {
      return (
        <React.Fragment key={i + 1}>
          <span className="opacity-25 mr-1">{i + 1}.</span>
          {button(moves[0])}
          {moves[1] && button(moves[1])}
        </React.Fragment>
      );
    });
  }

  return (
    <>
      {lobby?.pgn?.length ? (
        <div
          ref={moveListRef}
          id="movelist"
          className=" flex-1 scroll-smooth overflow-x-scroll no-bar h-full"
        >
          <div className="flex items-center pl-4" id="scrollable">
            {getMoveListHtml()}
          </div>
        </div>
      ) : (
        <div className="opacity-75 w-full text-center">
          {lobby?.timeControl}mins <span className="opacity-55">∘</span> ₦
          {lobby?.stake}
        </div>
      )}
    </>
  );
}

export default GameNav;
