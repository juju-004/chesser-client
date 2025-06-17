import { IconMenuDeep } from "@tabler/icons-react";
import clsx from "clsx";
import Image from "next/image";
import React, { ReactElement } from "react";
import Notifications from "./Notifications";
import FriendStatus from "./FriendStatus";
import Challenge from "./Challenge";

function Nav({ navClass, nav }: { navClass?: string; nav?: ReactElement }) {
  return (
    <div
      className={clsx(
        "w-screen flex fixed top-0 navbar",
        navClass || " bg-base-100 shadow-sm"
      )}
    >
      <div className={clsx("navbar-start", nav && "w-auto")}>
        <label htmlFor="menuslider" className="btn btn-ghost btn-circle">
          <IconMenuDeep />
        </label>
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
        <Challenge.Button />
        <FriendStatus.Button />
        <Notifications.Button />
      </div>
    </div>
  );
}

export default Nav;
