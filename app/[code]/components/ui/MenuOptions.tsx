"use client";

import { useSession } from "@/context/SessionProvider";
import { useToast } from "@/context/ToastContext";
import { Lobby } from "@/types";
import { IconCirclePlus, IconHome } from "@tabler/icons-react";
import { IconProgressX } from "@tabler/icons-react";
import { IconFlag2 } from "@tabler/icons-react";
import { IconMath1Divide2 } from "@tabler/icons-react";
import { IconMenu } from "@tabler/icons-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { Socket } from "socket.io-client";

interface Menu {
  lobby: Lobby;
  socket: Socket;
}
interface MenuAlert {
  socket: Socket;
  draw?: boolean;
  setDraw?: Function;
}

export function MenuAlert({ socket, draw, setDraw }: MenuAlert) {
  if (!draw) return null;
  const session = useSession();
  function declineDrawOffer() {
    socket.emit("chat", `${session.user?.name} declines draw offer`, true);
    setDraw && setDraw(false);
  }

  function acceptDrawOffer() {
    socket.emit("acceptDraw");
    setDraw && setDraw(false);
  }

  return (
    <div className="fixed inset-x-4 z-[93] top-3">
      <div role="alert" className="alert alert-vertical">
        <span className="pt-3">Your opponent offers a draw</span>
        <div className="flex gap-3">
          <button
            onClick={acceptDrawOffer}
            className="btn btn-sm btn-success btn-soft"
          >
            Accept
          </button>
          <button className="btn btn-sm btn-soft" onClick={declineDrawOffer}>
            Decline
          </button>
        </div>
      </div>
    </div>
  );
}

export function EndReason({
  reason,
  winner,
}: {
  reason: Lobby["endReason"];
  winner: Lobby["winner"];
}) {
  return (
    <>
      {reason && (
        <div className="fixed inset-x-0 top-14 text-center text-4xl opacity-15">
          {reason === "resigned" || reason === "timeout"
            ? `${winner === "white" ? "black" : "white"} ${reason}`
            : reason === "abandoned"
            ? `${winner === "white" ? "black" : "white"} left`
            : reason}
        </div>
      )}
    </>
  );
}

function MenuOptions({ lobby, socket }: Menu) {
  const { toast } = useToast();

  function abort() {
    socket.emit("abort");
  }

  function sendDrawOffer() {
    socket.emit("offerDraw");

    toast("Draw offer sent", "info");
  }

  return (
    <>
      <div className="fx h-auto">
        <div className="dropdown dropdown-top">
          <div tabIndex={0} role="button" className="m-2">
            <IconMenu />
          </div>
          <ul
            tabIndex={0}
            className="dropdown-content menu bg-base-200 rounded-box z-1 w-52 gap-3 p-2 shadow-sm"
          >
            <li>
              <Link href={"/"}>
                <IconHome className="size-4" />
                Home
              </Link>
            </li>
            {lobby.status === "inPlay" && !lobby.endReason && (
              <>
                <li>
                  <a onClick={sendDrawOffer} className="text-white/50">
                    <IconMath1Divide2 className="size-4" /> Offer Draw
                  </a>
                </li>

                <li>
                  <a
                    onClick={() =>
                      (
                        document.getElementById(
                          "resignModal"
                        ) as HTMLDialogElement
                      ).showModal()
                    }
                    className="text-error"
                  >
                    <IconFlag2 className="size-4" /> Resign
                  </a>
                </li>
              </>
            )}
            {lobby.status === "started" && !lobby.endReason && (
              <li>
                <a onClick={abort} className="text-white/50">
                  <IconProgressX className="size-4" /> Abort
                </a>
              </li>
            )}
          </ul>
        </div>
      </div>
      {/* Open the modal using document.getElementById('ID').showModal() method */}
    </>
  );
}

export default MenuOptions;
