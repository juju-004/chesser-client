"use client";

import {
  IconSun,
  IconMoon,
  IconMenuDeep,
  IconUsers,
} from "@tabler/icons-react";
import clsx from "clsx";
import Image from "next/image";
import React from "react";

function Nav({
  clicked,
  navClass,
}: {
  clicked: () => void;
  navClass?: string;
}) {
  return (
    <div className={clsx("navbar ", navClass || " bg-base-100 shadow-sm")}>
      <div className="navbar-start">
        <button
          onClick={(e) => {
            e.stopPropagation();
            clicked();
          }}
          className="btn btn-ghost btn-circle"
        >
          <IconMenuDeep />
        </button>
      </div>
      <div className="navbar-center">
        <a className="btn btn-ghost text-xl">Chesser</a>
      </div>
      <div className="navbar-end">
        <button className="btn btn-ghost btn-circle">
          <IconUsers size={20} />
        </button>
      </div>
    </div>
  );
}

export default Nav;
