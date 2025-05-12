"use client";

import { IconMenuDeep, IconUsers } from "@tabler/icons-react";
import clsx from "clsx";
import React, { ReactElement } from "react";

function Nav({
  clicked,
  navClass,
  nav,
}: {
  clicked: () => void;
  navClass?: string;
  nav?: ReactElement;
}) {
  return (
    <div
      className={clsx(
        "w-screen flex navbar",
        navClass || " bg-base-100 shadow-sm"
      )}
    >
      <div className=" w-auto navbar-start">
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
      <div className="overflow-hidden navbar-center w-auto !flex-1">
        {nav ? (
          nav
        ) : (
          <span className="w-full text-center fx">
            <a className="btn btn-ghost text-xl ">Chesser</a>
          </span>
        )}
      </div>
      <div className="navbar-end w-auto pl-2">
        <button className="btn btn-ghost btn-circle">
          <IconUsers size={20} />
        </button>
      </div>
    </div>
  );
}

export default Nav;
