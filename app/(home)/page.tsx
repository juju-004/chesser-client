"use client";

import { useEffect, useState } from "react";
import Nav from "./components/Nav";
import Wallet from "./components/Wallet";
import Header from "./components/Header";
import Menu from "../components/Menu";
import Play from "./components/Play";
import { AnimatePresence, motion } from "framer-motion";

export default function Home() {
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    setIsOpen(false);
  }, []);

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Sidebar - permanently rendered but hidden when closed */}
      <motion.aside
        animate={{ x: isOpen ? 0 : "-100%" }}
        transition={{ duration: 0.1 }}
        className="fixed left-0 top-0 z-30 h-full w-[80vw] bg-base-300 shadow-2xl"
      >
        <div className="flex h-full flex-col">
          <Menu />
        </div>
      </motion.aside>

      {/* Wrapper that shifts content — not the content itself */}
      <motion.div
        animate={{ x: isOpen ? "80vw" : 0 }}
        transition={{ duration: 0.1 }}
        className="relative z-10 h-full w-full"
      >
        <Nav clicked={() => setIsOpen(!isOpen)} />
        <div
          className="flex h-screen w-full flex-col gap-4 overflow-x-hidden overflow-y-auto"
          onClick={() => setIsOpen(false)}
        >
          <Header text="Wallet" />
          <Wallet />
          <Header text="Play" />
          <Play />
        </div>
      </motion.div>
    </div>
  );
}
