"use client";

import React, { ReactNode } from "react";
import { IconChevronRight, IconMessage2 } from "@tabler/icons-react";
import { IconChevronLeft } from "@tabler/icons-react";
import { IconRotateRectangle } from "@tabler/icons-react";
import { Chess } from "chess.js";
import clsx from "clsx";
import { BoardOrientation } from "react-chessboard/dist/chessboard/types";

interface DockType {
  actualGame: Chess;
  perspective: BoardOrientation;
  chatDot: boolean;
  setchatDot: Function;
  navIndex: number | null;
  navigateMove: Function;
  children: ReactNode;
  htmlFor: string;
  setPerspective: (p: BoardOrientation) => void;
}

function Dock({
  actualGame,
  perspective,
  setPerspective,
  setchatDot,
  navIndex,
  chatDot,
  navigateMove,
  children,
  htmlFor,
}: DockType) {
  return (
    <div className="dock z-10 dock-sm">
      {children}

      <button>
        <div className="indicator">
          {chatDot && (
            <span className="indicator-item badge-xs badge badge-info text-white"></span>
          )}
          <label
            onClick={() => setchatDot()}
            htmlFor={htmlFor}
            className="drawer-button"
          >
            <IconMessage2 />
          </label>
        </div>
      </button>
      <button
        className={clsx(
          perspective === "white" ? "rotate-180" : "rotate-0",
          "duration-200 "
        )}
        onClick={() =>
          setPerspective(perspective === "white" ? "black" : "white")
        }
      >
        <IconRotateRectangle />
      </button>

      <button
        className={clsx(
          (navIndex === 0 || actualGame.history().length <= 1) &&
            "btn-disabled disabled:opacity-50",
          " active:bg-white/10 bg-white/0 duration-200"
        )}
        onClick={() => navigateMove(navIndex === null ? "prev" : navIndex - 1)}
      >
        <IconChevronLeft size={18} />
      </button>
      <button
        className={clsx(
          navIndex === null && "btn-disabled disabled:opacity-50",
          " active:bg-white/10 bg-white/0 duration-200"
        )}
        onClick={() => navigateMove(navIndex === null ? null : navIndex + 1)}
      >
        <IconChevronRight size={18} />
      </button>
    </div>
  );
}

export default Dock;
