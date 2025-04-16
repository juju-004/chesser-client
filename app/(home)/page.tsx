"use client";

import { useEffect, useState } from "react";
import Nav from "./components/Nav";
import Wallet from "./components/Wallet";
import Header from "./components/Header";
import Menu from "./components/Menu";
import Play from "./components/Play";

export default function Home() {
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    setIsOpen(false);
  }, []);

  return (
    <div className="relative h-screen w-full overflow-hidden ">
      {/* ===== SIDEBAR MENU ===== */}
      <aside
        className={`fixed left-0 top-0 z-30 h-full w-[80vw] bg-base-300 shadow-2xl transition-all duration-200 ease-out ${
          isOpen ? "translate-x-0 shadow-black/60" : "-translate-x-full"
        }`}
      >
        <div className=" flex h-screen flex-col">
          <Menu />
        </div>
      </aside>

      {/* ===== MAIN CONTENT (Pushes on menu open) ===== */}
      <main
        className={`h-full w-full transition-transform duration-250 ease-out ${
          isOpen ? "translate-x-[80vw]" : "translate-x-0"
        }`}
        onClick={() => setIsOpen(false)}
      >
        <Nav clicked={() => setIsOpen(!isOpen)} />
        <div className="flex h-screen w-[100vw] flex-col gap-4 overflow-x-hidden overflow-y-scroll">
          <Header text="Wallet" />
          <Wallet />
          <Header text="Play" />
          <Play />
        </div>
      </main>
    </div>
  );
}
