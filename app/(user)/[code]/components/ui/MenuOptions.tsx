"use client";

import { useSession } from "@/context/SessionProvider";
import { useToast } from "@/context/ToastContext";
import { Lobby } from "@/types";
import { IconHome, IconReload, IconShare } from "@tabler/icons-react";
import { IconProgressX } from "@tabler/icons-react";
import { IconFlag2 } from "@tabler/icons-react";
import { IconMath1Divide2 } from "@tabler/icons-react";
import { IconMenu } from "@tabler/icons-react";
import Link from "next/link";
import React, { ReactNode, useState } from "react";
import { lobbyStatus } from "../utils";
import { CopyLinkButton, ShareButton } from "./CopyLink";
import { useSocket } from "@/context/SocketProvider";
import clsx from "clsx";
import { useRoom } from "../GameRoom";

export function MenuAlert() {
  const { drawOfferFrom, setdrawOfferFrom } = useRoom();
  const { socket } = useSocket();
  const session = useSession();

  function declineDrawOffer() {
    socket.emit("draw", "decline", session.user?.id);
    setdrawOfferFrom(false);
  }

  function acceptDrawOffer() {
    socket.emit("draw", "accept", session.user?.id);
    setdrawOfferFrom(false);
  }

  return drawOfferFrom ? (
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
  ) : (
    <></>
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

function Template({ lobby, children }: { lobby: Lobby; children?: ReactNode }) {
  return (
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
          {lobby.side ? (
            <>
              {children}
              {lobby.endReason && lobby.pgn && (
                <>
                  <li>
                    <ShareButton className="active:opacity-25 opacity-100 duration-300">
                      <IconShare className="size-4" />
                      Share Game
                    </ShareButton>
                  </li>
                  <li>
                    <CopyLinkButton link={lobby.pgn || ""}>
                      Copy Game PGN
                    </CopyLinkButton>
                  </li>
                </>
              )}
            </>
          ) : (
            <li>
              <ShareButton className="active:opacity-25 opacity-100 duration-300">
                <IconShare className="size-4" />
                Share Game
              </ShareButton>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}

function Active({ lobby }: { lobby: Lobby }) {
  const { toast } = useToast();
  const { socket } = useSocket();
  const {
    rematchOffer,
    rematchLoader,
    drawOfferFrom,
    sendRematchOffer,
    acceptRematchOffer,
    getOpponent,
  } = useRoom();
  const [drawsent, setDrawSent] = useState(false);

  function sendDrawOffer() {
    const opponent = getOpponent(lobby);

    if (!opponent) return;
    socket.emit("draw", "offer", opponent.id);
    toast("Draw offer sent", "info");
    setDrawSent(true);
  }

  return (
    <Template lobby={lobby}>
      {lobbyStatus(lobby.actualGame) === "started" && !lobby.endReason && (
        <li>
          <a onClick={() => socket.emit("abort")} className="text-white/50">
            <IconProgressX className="size-4" /> Abort
          </a>
        </li>
      )}
      {lobbyStatus(lobby.actualGame) === "inPlay" && !lobby.endReason && (
        <>
          {!drawOfferFrom && (
            <li>
              <button
                disabled={drawsent}
                onClick={sendDrawOffer}
                className="text-gray-300"
              >
                {drawsent ? (
                  "Draw Offer sent"
                ) : (
                  <>
                    <IconMath1Divide2 className="size-4" /> Offer Draw
                  </>
                )}
              </button>
            </li>
          )}

          <li>
            <a
              onClick={() =>
                (
                  document.getElementById("resignModal") as HTMLDialogElement
                ).showModal()
              }
              className="text-error"
            >
              <IconFlag2 className="size-4" /> Resign
            </a>
          </li>
        </>
      )}
      {lobby.endReason && lobby.pgn && (
        <li>
          <button
            onClick={() =>
              rematchOffer ? acceptRematchOffer(lobby) : sendRematchOffer(lobby)
            }
            disabled={rematchLoader}
            className={clsx(
              "active:opacity-25 opacity-100 duration-300",
              rematchOffer ? "animate-pulse text-success" : "text-info"
            )}
          >
            {rematchOffer ? (
              <>
                {rematchLoader && (
                  <span className="loading loading-spinner size-5"></span>
                )}
                Join Game
              </>
            ) : (
              <>
                {rematchLoader ? (
                  <span className="loading loading-spinner size-5"></span>
                ) : (
                  <IconReload className="size-4" />
                )}
                Rematch
              </>
            )}
          </button>
        </li>
      )}
    </Template>
  );
}

const MenuOptions = {
  Template,
  Active,
};

export default MenuOptions;
