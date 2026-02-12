import { IconMenuDeep } from "@tabler/icons-react";
import clsx from "clsx";
import Image from "next/image";
import React, { ReactNode } from "react";
import Notifications from "./Notifications";
import FriendStatus from "./FriendStatus";
import Challenge from "./Challenge";
import { createContext, useContext, useState } from "react";
import dynamic from "next/dynamic";

const FButton = dynamic(
  () => import("./FriendStatus").then((mod) => mod.default.Button),
  { ssr: false },
);
const NButton = dynamic(
  () => import("./Notifications").then((mod) => mod.default.Button),
  { ssr: false },
);
const CButton = dynamic(
  () => import("./Challenge").then((mod) => mod.default.Button),
  { ssr: false },
);

type NavContextType = {
  customTitle: ReactNode | null;
  setCustomTitle: (title: ReactNode | null) => void;
};

const NavContext = createContext<NavContextType>({
  customTitle: null,
  setCustomTitle: () => {},
});

export const NavProvider = ({ children }: { children: ReactNode }) => {
  const [customTitle, setCustomTitle] = useState<ReactNode | null>(null);

  return (
    <NavContext.Provider value={{ customTitle, setCustomTitle }}>
      {children}
    </NavContext.Provider>
  );
};

export const useNav = () => useContext(NavContext);

function Nav({ onClick }: { onClick: () => void }) {
  const { customTitle } = useNav();
  return (
    <div className={"w-screen flex navbar"}>
      <div className={clsx("navbar-start", customTitle && "w-auto")}>
        <button onClick={onClick} className="btn btn-ghost btn-circle">
          <IconMenuDeep />
        </button>
      </div>
      <div
        className={clsx(
          "overflow-hidden navbar-center ",
          customTitle ? "!flex-1 w-auto" : "",
        )}
      >
        {customTitle ? (
          customTitle
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
      <div className={clsx("navbar-end", customTitle && "w-auto")}>
        <FButton />
        <CButton />
        <NButton />
      </div>
    </div>
  );
}

export default Nav;
