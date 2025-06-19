"use client";

import { ReactElement, ReactNode } from "react";
import Nav from "./Nav";
import Menu from "./Menu";
import Notifications from "./Notifications";
import FriendStatus from "./FriendStatus";
import Challenge from "./Challenge";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import clsx from "clsx";

export default function MenuSlider({
  children,
  navClass,
  nav,
  className,
}: {
  children: ReactNode;
  navClass?: string;
  className?: string;
  nav?: ReactElement;
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
    <>
      <div className="relative min-h-screen overflow-x-hidden">
        {/* Sliding Menu */}
        <motion.div
          initial={false}
          animate={{ x: menuOpen ? 0 : menuWidth ? -menuWidth : -500 }}
          transition={{ type: "tween", ease: "easeInOut", duration: 0.1 }}
          className="fixed top-0 left-0 bg-base-300 h-full z-40"
          style={{
            width: `${menuWidth}px`,
            willChange: "transform",
          }}
        >
          <Menu />
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={false}
          animate={{ x: menuOpen ? menuWidth : 0 }}
          transition={{ type: "tween", ease: "easeInOut", duration: 0.1 }}
          className="relative z-10 min-h-screen"
          style={{
            willChange: "transform",
          }}
        >
          {menuOpen && (
            <button
              onClick={() => setMenuOpen(false)}
              className=" inset-0 z-[99] absolute"
            ></button>
          )}
          <Nav
            nav={nav}
            onClick={() => setMenuOpen(!menuOpen)}
            navClass={navClass}
          />

          <div className={clsx("w-full flex pt-16 flex-col", className)}>
            {children}
          </div>
        </motion.div>
      </div>
    </>
  );
}
