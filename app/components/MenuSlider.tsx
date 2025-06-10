"use client";

import { ReactElement, ReactNode, useEffect, useState } from "react";
import Nav from "./Nav";
import Menu from "./Menu";
import Notifications from "./Notifications";
import FriendStatus from "./FriendStatus";
import Challenge from "./Challenge";
import { motion } from "motion/react";
import Loading from "./Loading";

export default function MenuSlider({
  children,
  navClass,
  nav,
}: {
  children: ReactNode;
  navClass?: string;
  nav?: ReactElement;
}) {
  const [isOpen, setIsOpen] = useState(true);
  const [width, setWidth] = useState<null | number>(null);

  useEffect(() => {
    if (!width) setWidth((85 * window.innerWidth) / 100);

    if (width) isOpen && setIsOpen(false);
  }, [width]);

  return width ? (
    <div className="relative h-screen w-full overflow-hidden ">
      {/* Sliding Panel */}
      <motion.div
        initial={{ x: -width }}
        animate={{ x: isOpen ? 0 : -width }}
        transition={{ duration: 0.2, ease: "anticipate" }}
        className="fixed top-0 left-0 bottom-0 z-40"
        style={{ width }}
      >
        <Menu />
      </motion.div>

      {/* ===== MAIN CONTENT (Pushes on menu open) ===== */}
      <motion.div
        initial={{ x: 0 }}
        animate={{ x: isOpen ? width : 0 }}
        transition={{ duration: 0.2, ease: "anticipate" }}
        className="relative z-10 h-full"
      >
        {isOpen && (
          <div
            onClick={() => setIsOpen(false)}
            className="inset-0 z-50 absolute bg-black/10"
          ></div>
        )}
        <Nav nav={nav} clicked={() => setIsOpen(!isOpen)} navClass={navClass} />
        <div className="flex h-screen w-[100vw] flex-col gap-4 overflow-x-hidden overflow-y-scroll">
          {children}
        </div>
      </motion.div>
      <Notifications.Modal />
      <FriendStatus.Modal />
      <Challenge.Modal />
      <Challenge.ModalMain />
    </div>
  ) : (
    <Loading />
  );
}
