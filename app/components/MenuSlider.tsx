"use client";

import { ReactElement, ReactNode, useEffect, useState } from "react";
import Nav from "./Nav";
import Menu from "./Menu";
import Notifications from "./Notifications";
import FriendStatus from "./FriendStatus";
import Challenge from "./Challenge";
import { motion } from "motion/react";

export default function MenuSlider({
  children,
  navClass,
  nav,
}: {
  children: ReactNode;
  navClass?: string;
  nav?: ReactElement;
}) {
  return (
    <div className="drawer lg:drawer-open">
      <input id="menuslider" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content  flex pt-16 flex-col items-center justify-center">
        <Nav nav={nav} navClass={navClass} />

        <div className="w-full flex flex-col">{children}</div>
      </div>
      <div className="drawer-side z-10">
        <label
          htmlFor="menuslider"
          aria-label="close sidebar"
          className="drawer-overlay"
        ></label>
        <ul className="bg-base-200 min-h-full w-80">
          <Menu />
        </ul>
      </div>
      <Notifications.Modal />
      <FriendStatus.Modal />
      <Challenge.Modal />
      <Challenge.ModalMain />
    </div>
  );
}
