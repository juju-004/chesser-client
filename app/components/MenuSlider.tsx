"use client";

import { ReactNode, useEffect, useState } from "react";
import Nav from "./Nav";
import Menu from "./Menu";
import clsx from "clsx";

export default function MenuSlider({
  children,
  navClass,
}: {
  children: ReactNode;
  navClass?: string;
}) {
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    setIsOpen(false);
  }, []);

  return (
    <div className="relative h-screen w-full overflow-hidden ">
      {/* ===== SIDEBAR MENU ===== */}
      <aside
        className={clsx(
          "fixed left-0 top-0 h-screen w-[80vw] bg-base-300 transition-transform duration-100",
          isOpen ? "translate-x-0 " : "-translate-x-full"
        )}
      >
        <div className=" flex h-screen flex-col">
          <Menu />
        </div>
      </aside>

      {/* ===== MAIN CONTENT (Pushes on menu open) ===== */}
      <main
        className={clsx(
          "h-screen w-screen transition-transform relative duration-100",
          isOpen ? "translate-x-[80vw]" : "translate-x-0"
        )}
      >
        {isOpen && (
          <div
            onClick={() => setIsOpen(false)}
            className="inset-0 z-50 absolute bg-black/20"
          ></div>
        )}
        <Nav clicked={() => setIsOpen(!isOpen)} navClass={navClass} />
        <div className="flex h-screen w-[100vw] flex-col gap-4 overflow-x-hidden overflow-y-scroll">
          {children}
        </div>
      </main>
    </div>
  );
}
