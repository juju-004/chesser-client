"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Nav, { NavProvider } from "./Nav";

const Menu = dynamic(() => import("./Menu"), {
  ssr: false,
});

export default function MenuSlider({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuWidth, setMenuWidth] = useState(0);

  // Update width on load and resize
  useEffect(() => {
    const updateWidth = () => {
      const width = Math.round(window.innerWidth * 0.8);
      setMenuWidth(width);
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* Sliding Menu */}
      <motion.div
        initial={false}
        animate={{ x: menuOpen ? 0 : menuWidth ? -menuWidth : -500 }}
        transition={{ type: "tween", ease: "easeInOut", duration: 0.08 }}
        className="fixed top-0 left-0 bg-base-300 h-full z-40"
        style={{
          width: `${menuWidth}px`,
          willChange: "transform",
        }}
      >
        <Menu onClick={() => setMenuOpen(false)} />
      </motion.div>

      {/* Main Content */}
      <motion.div
        initial={false}
        animate={{ x: menuOpen ? menuWidth : 0 }}
        transition={{ type: "tween", ease: "easeInOut", duration: 0.08 }}
        className="z-10 fx flex-col h-screen"
        style={{
          willChange: "transform",
        }}
      >
        {menuOpen && (
          <button
            onClick={() => setMenuOpen(false)}
            className=" inset-0 z-[99] fixed"
          ></button>
        )}
        <NavProvider>
          <Nav onClick={() => setMenuOpen(!menuOpen)} />
          <div className="flex-1 overflow-y-scroll overflow-x-hidden w-full">
            {children}
          </div>
        </NavProvider>
      </motion.div>
    </div>
  );
}
