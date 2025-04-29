"use client";

import React, { ReactNode } from "react";
import { IconChevronRight, IconMessage2 } from "@tabler/icons-react";
import { IconChevronLeft } from "@tabler/icons-react";
import { IconRotateRectangle } from "@tabler/icons-react";
import { Chess } from "chess.js";
import clsx from "clsx";

interface DockType {
  actualGame: Chess;
  perspective: boolean | "white" | "black";
  setPerspective: Function;
  chatDot: boolean;
  setchatDot: Function;
  navIndex: number | null;
  navigateMove: Function;
  children: ReactNode;
  htmlFor: string;
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
    <div className="dock dock-sm z-30">
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
          perspective ? "rotate-180" : "rotate-0",
          "transition-all duration-300 "
        )}
        onClick={() =>
          setPerspective(
            typeof perspective === "boolean"
              ? !perspective
              : perspective === "white"
              ? "black"
              : "white"
          )
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
