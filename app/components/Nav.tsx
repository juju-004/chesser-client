import { IconBell, IconMenuDeep, IconUsers } from "@tabler/icons-react";
import clsx from "clsx";
import Image from "next/image";
import React, { ReactElement } from "react";
import Notifications from "./Notifications";

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
      <div className={clsx("navbar-start", nav && "w-auto")}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            clicked();
          }}
          className="btn btn-ghost text-secondary btn-circle"
        >
          <IconMenuDeep />
        </button>
      </div>
      <div
        className={clsx(
          "overflow-hidden navbar-center ",
          nav ? "!flex-1 w-auto" : ""
        )}
      >
        {nav ? (
          nav
        ) : (
          <span className="w-full text-center fx">
            <a className="btn fx btn-ghost text-xl">
              <Image
                width={32}
                height={32}
                alt=""
                className="-mt-2"
                src={"/logo32x32.svg"}
              />
              <span className="-ml-2.5">hesser</span>
            </a>
          </span>
        )}
      </div>
      <div className={clsx("navbar-end", nav && "w-auto")}>
        <button className="btn btn-ghost btn-circle">
          <IconUsers size={20} />
        </button>
        <Notifications.Button />
      </div>
    </div>
  );
}

export default Nav;
