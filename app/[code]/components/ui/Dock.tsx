import { Lobby } from "@/types";
import React, { ReactNode } from "react";
import { IconChevronRight, IconMessage2 } from "@tabler/icons-react";
import { IconChevronLeft } from "@tabler/icons-react";
import { IconRotateRectangle } from "@tabler/icons-react";
import { Chess } from "chess.js";

interface DockType {
  actualGame: Chess;
  perspective: boolean | "white" | "black";
  setPerspective: Function;
  chatMessagesCount?: number | null;
  setchatMessagesCount?: Function;
  navIndex: number | null;
  navigateMove: Function;
  chat?: boolean;
  children: ReactNode;
}

function Dock({
  actualGame,
  chatMessagesCount,
  perspective,
  setPerspective,
  setchatMessagesCount,
  navIndex,
  navigateMove,
  chat,
  children,
}: DockType) {
  return (
    <div className="dock dock-sm z-30">
      {children}
      {chat && (
        <button>
          <div className="indicator">
            {chatMessagesCount && (
              <span className="indicator-item badge-xs badge badge-info text-white">
                {chatMessagesCount}
              </span>
            )}
            <label
              onClick={() => setchatMessagesCount && setchatMessagesCount(null)}
              htmlFor="my-drawer-4"
              className="drawer-button"
            >
              <IconMessage2 />
            </label>
          </div>
        </button>
      )}
      <button
        className={`${
          perspective ? "rotate-180" : "rotate-0"
        } transition-all duration-300 
        `}
        onClick={() => setPerspective(!perspective)}
      >
        <IconRotateRectangle />
      </button>

      <button
        className={
          navIndex === 0 || actualGame.history().length <= 1
            ? "btn-disabled disabled:opacity-50"
            : ""
        }
        onClick={() => navigateMove(navIndex === null ? "prev" : navIndex - 1)}
      >
        <IconChevronLeft size={18} />
      </button>
      <button
        className={navIndex === null ? "btn-disabled disabled:opacity-50" : ""}
        onClick={() => navigateMove(navIndex === null ? null : navIndex + 1)}
      >
        <IconChevronRight size={18} />
      </button>
    </div>
  );
}

export default Dock;
