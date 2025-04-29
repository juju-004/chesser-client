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
      {/* SIDEBAR */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "tween", duration: 0.25 }}
            className="fixed left-0 top-0 z-30 h-full w-[80vw] bg-base-300"
          >
            <div className="flex h-full flex-col">
              <Menu />
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* MAIN CONTENT */}
      <motion.main
        animate={{ x: isOpen ? "80vw" : 0 }}
        transition={{ type: "", duration: 0.25 }}
        className="relative z-10 h-full w-full overflow-hidden"
      >
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 z-20 bg-black"
          />
        )}
        <Nav clicked={() => setIsOpen(!isOpen)} />
        <div className="flex h-screen w-[100vw] flex-col gap-4 overflow-x-hidden overflow-y-auto">
          <Header text="Wallet" />
          <Wallet />
          <Header text="Play" />
          <Play />
        </div>
      </motion.main>
    </div>
  );
}
