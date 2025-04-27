"use client";

import Menu from "@/app/(home)/components/Menu";
import { Lobby } from "@/types";
import { IconMenuDeep } from "@tabler/icons-react";
import React, { ReactNode, useEffect, useRef } from "react";
import type { Chess } from "chess.js";

interface Menu {
  children: ReactNode;
  lobby?: Lobby;
  navIndex: number | null;
  navigateMove: Function;
  actualGame: Chess;
}

function MenuDrawer({
  lobby,
  children,
  actualGame,
  navIndex,
  navigateMove,
}: Menu) {
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
            "btn btn-ghost  h-full font-normal normal-case" +
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
        <div className="flex items-center ml-1" key={i + 1}>
          <span className="opacity-25">{i + 1}.</span>
          {button(moves[0])}
          {moves[1] && button(moves[1])}
        </div>
      );
    });
  }

  return (
    <div className="drawer">
      <input id="my-drawer-3" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col">
        {/* Navbar */}
        <div className=" fixed bg-base-100 inset-x-0 top-0 z-50 flex w-full items-center px-4 py-4">
          <label
            htmlFor="my-drawer-3"
            aria-label="open sidebar"
            className="opacity-50 mr-3"
          >
            <IconMenuDeep className="size-6" />
          </label>
          {lobby?.pgn?.length ? (
            <div
              ref={moveListRef}
              className=" flex-1 overflow-x-scroll no-bar h-full"
            >
              <div className="flex pl-4" id="scrollable">
                {getMoveListHtml()}
              </div>
            </div>
          ) : (
            <div className="opacity-75">
              {lobby?.timeControl}mins <span className="opacity-55">∘</span> ₦
              {lobby?.stake}
            </div>
          )}
        </div>
        {/* Page content here */}
        {children}
      </div>
      <div className="drawer-side z-50">
        <label
          htmlFor="my-drawer-3"
          aria-label="close sidebar"
          className="drawer-overlay"
        ></label>
        <Menu className="bg-base-200 w-[80vw]" />
      </div>
    </div>
  );
}

export default MenuDrawer;
