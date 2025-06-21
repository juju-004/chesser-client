"use client";

import { ReactElement, ReactNode } from "react";
import clsx from "clsx";

export default function Slider({
  children,
  content,
  isOpen,
}: {
  children: ReactNode;
  content: ReactElement;
  isOpen: boolean;
}) {
  return (
    <div className="relative h-full w-full overflow-hidden ">
      {/* ===== SIDEBAR MENU ===== */}
      <aside
        className={clsx(
          "absolute right-0 top-0 h-full w-screen bg-base-300 transition-transform duration-100",
          isOpen ? "translate-x-0 " : "translate-x-full"
        )}
      >
        <div className=" flex h-full flex-col">{content}</div>
      </aside>

      {/* ===== MAIN CONTENT (Pushes on menu open) ===== */}
      <main
        className={clsx(
          "h-full w-screen transition-transform relative duration-100 flex-col gap-4 overflow-x-hidden overflow-y-scroll",
          isOpen ? "-translate-x-full" : "translate-x-0"
        )}
      >
        {children}
      </main>
    </div>
  );
}
