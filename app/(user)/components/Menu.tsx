"use client";

import { useSession } from "@/context/SessionProvider";
import { useSocket } from "@/context/SocketProvider";
import { useToast } from "@/context/ToastContext";
import { logout } from "@/lib/auth";
import {
  IconCoin,
  IconPower,
  IconSettings,
  IconUser,
} from "@tabler/icons-react";
import {
  IconArrowCapsule,
  IconAt,
  IconCashBanknote,
  IconHome2,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

function Menu() {
  const session = useSession();
  const { push, replace } = useRouter();
  const { toast } = useToast();
  const { socket } = useSocket();
  const [logoutLoader, setlogoutLoader] = useState(false);

  const signOut = () => {
    setlogoutLoader(true);

    setTimeout(async () => {
      const user = await logout();
      if (typeof user === "string") {
        toast(user, "error");
        setlogoutLoader(false);
        return;
      }

      socket.disconnect();
      session.setUser(null);
      setTimeout(() => {
        replace("/auth");
      }, 200);
    }, 300);
  };

  const items = [
    {
      text: "Home",
      icon: <IconHome2 className="size-4" />,
      color: "bg-fuchsia-600",
      action: () => push("/"),
    },
    {
      text: "Players",
      icon: <IconAt className="size-4" />,
      color: "bg-red-600",
      action: () => push("/players"),
    },
    {
      text: "Preferences",
      icon: <IconSettings className="size-4" />,
      color: "bg-accent",
      action: () => push("/preferences"),
    },
  ];
  const userItems = [
    {
      text: "Profile",
      icon: <IconUser className="size-4" />,
      action: () => push(`/u/${session.user?.name}`),
    },
    {
      text: "Logout",
      icon: <IconPower className="size-4 text-red-600" />,
      action: signOut,
    },
  ];

  const paymentItems = [
    {
      text: "Deposit",
      icon: <IconCashBanknote className="size-4" />,
      action: () => push("/pay"),
    },
    {
      text: "Withdraw",
      icon: <IconCoin className="size-4" />,
      action: () => push("/pay/withdraw"),
    },
    {
      text: "Transaction History",
      icon: <IconArrowCapsule className="size-4" />,
      action: () => push("/pay/transactions"),
    },
  ];

  const customerItems = [
    {
      text: "Make Complaint",
    },
    {
      text: "Terms & conditions",
    },
  ];

  return (
    <>
      <details className="collapse-arrow w-full pt-5 collapse">
        <summary className="collapse-title rounded-3xl border-0 !p-0 after:opacity-60">
          <div className="px-5 pb-1 pt-4">
            <h3 className="ml-3 text-lg">{session?.user?.name}</h3>
            <div className="bg-base-100 mb-4 flex w-full shadow-2xl items-center gap-2 rounded-3xl px-2 py-1">
              <span className="fx bg-base-300 size-5 rounded-full">
                {session?.user?.email && session?.user?.email[0]}
              </span>
              <span className="w-[70%] flex-1 overflow-hidden text-ellipsis text-sm text-white/80">
                {session?.user?.email}
              </span>
            </div>
          </div>
        </summary>
        <div className="collapse-content py-0 text-sm">
          <ul className="menu w-full gap-1 px-1">
            {userItems.map((item, key) => (
              <li key={key}>
                <a onClick={item.action}>
                  {key && logoutLoader ? (
                    <span className="fill-error size-4 loading loading-spinner"></span>
                  ) : (
                    <span
                      className={`bg-base-100 size-6 rotate-6 rounded-lg px-1.5 text-white/70`}
                    >
                      {item.icon}
                    </span>
                  )}
                  <span className="opacity-60">{item.text}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </details>
      <div className="flex-1 w-full overflow-x-hidden overflow-y-scroll">
        <ul className="menu w-full gap-4 px-5">
          {items.map((item, key) => (
            <li className="" key={key}>
              <a onClick={item.action} className="">
                <span
                  className={`size-6 rotate-6 rounded-lg px-1.5 ${item.color}`}
                >
                  {item.icon}
                </span>
                {item.text}{" "}
              </a>
            </li>
          ))}
          <li>
            <details open>
              <summary className="opacity-40">Payment</summary>
              <ul>
                {paymentItems.map((item, key) => (
                  <li className="" key={key}>
                    <a onClick={item.action} className="">
                      <span
                        className={`bg-base-100 size-6 rotate-6 rounded-lg px-1.5 text-white/70`}
                      >
                        {item.icon}
                      </span>
                      {item.text}
                    </a>
                  </li>
                ))}
              </ul>
            </details>
          </li>
          <li>
            <details open>
              <summary className="opacity-40">Customer</summary>
              <ul>
                {customerItems.map((item, key) => (
                  <li className="" key={key}>
                    <a className="">{item.text}</a>
                  </li>
                ))}
              </ul>
            </details>
          </li>
        </ul>
      </div>
      <div className="py-1.5 text-center text-sm opacity-25">
        &copy;2025 Chesser
      </div>
    </>
  );
}

export default Menu;
