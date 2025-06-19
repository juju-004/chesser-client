"use client";

import { motion } from "framer-motion";
import { useState } from "react";

export default function Page() {
  const [menuOpen, setMenuOpen] = useState(false);

  const menuWidth = 250;

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* Sliding Menu */}
      <motion.div
        initial={false}
        animate={{ x: menuOpen ? 0 : -menuWidth }}
        transition={{ type: "tween", ease: "easeInOut", duration: 0.1 }}
        className="fixed top-0 left-0 h-full z-40 bg-white shadow-lg"
        style={{ width: menuWidth }}
      >
        <div className="p-4 font-semibold">Menu</div>
        <ul className="space-y-2 p-4">
          <li>🏠 Home</li>
          <li>📄 About</li>
          <li>📞 Contact</li>
        </ul>
      </motion.div>

      {/* Main Content */}
      <motion.div
        initial={false}
        animate={{ x: menuOpen ? menuWidth : 0 }}
        transition={{ type: "tween", ease: "easeInOut", duration: 0.1 }}
        className="relative z-10 min-h-screen bg-gray-50"
      >
        <header className="p-4 bg-black text-white flex justify-between items-center">
          <button onClick={() => setMenuOpen(!menuOpen)}>☰</button>
          <h1 className="text-xl font-bold">My App</h1>
        </header>

        <main className="p-4">
          <p className="text-lg">
            This is the main content that will smoothly slide when the menu is
            opened or closed. Try it on mobile.
          </p>
        </main>
      </motion.div>
    </div>
  );
}
