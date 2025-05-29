"use client";

import {
  IconMoodSad,
  IconCrown,
  IconReload,
  IconHome2,
  IconX,
  IconMath1Divide2,
} from "@tabler/icons-react";
import Counter from "./Counter";
import Link from "next/link";
import clsx from "clsx";
import { useState } from "react";
import { Socket } from "socket.io-client";
import { Game } from "@/types";
import { useToast } from "@/context/ToastContext";

type GameOverModalProps = {
  isWinner: boolean | "draw";
  countStart: number;
  stake: number;
  reason?: string;
  socket: Socket;
  rematchOffer: boolean;
  game: Game;
};

export default function GameOver({
  isWinner,
  countStart,
  stake,
  socket,
  reason,
  rematchOffer,
  game,
}: GameOverModalProps) {
  const [rematch, setRematch] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const { toast } = useToast();
  const wallet =
    isWinner === "draw"
      ? countStart
      : isWinner
      ? countStart + stake
      : countStart - stake;

  const sendRematchOffer = () => {
    if (Math.sign(wallet - stake) === -1) {
      toast("Insufficient funds", "error");
      return;
    }

    setRematch(true);
    socket.emit("rematch");
  };

  const sendJoinGame = async () => {
    if (Math.sign(wallet - stake) === -1) {
      toast("Insufficient funds", "error");
      return;
    }

    setDisabled(true);
    socket.emit("rematch", {
      stake: game.stake,
      timeControl: game.timeControl,
      white: game.white,
      black: game.black,
      code: game.code,
    } as Game);
  };

  function modalControl() {
    (document.getElementById("gameOverModal") as HTMLDialogElement)?.close();
  }

  return (
    <div className="modal-box rounded-2xl relative flex flex-col items-center pt-14 pb-4">
      <button
        onClick={modalControl}
        className="absolute top-2 right-2 btn btn-circle font-bold opacity-50"
      >
        <IconX />
      </button>
      <div className="absolute bg-black/20 bottom-0 inset-x-0 h-1/2"></div>
      {/* Winner/Loser Icon */}
      <div className="flex justify-center mb-3">
        {isWinner === "draw" ? (
          <IconMath1Divide2 size={80} className="text-gray-400" />
        ) : isWinner ? (
          <IconCrown size={80} className="text-yellow-500" />
        ) : (
          <IconMoodSad size={80} className="text-gray-500" />
        )}
      </div>
      {/* Title */}
      <h3
        className={clsx(
          "text-2xl text-center font-bold mb-2",
          isWinner === "draw"
            ? "text-gray-400"
            : isWinner
            ? "text-yellow-500"
            : "text-gray-500"
        )}
      >
        {isWinner === "draw" ? "Draw" : isWinner ? "You Won!" : "You Lost"}
      </h3>
      <span className="mb-5 opacity-30 px-2 text-center w-full">{reason}</span>
      <span className="text-center relative text-3xl text-white/60 font-bold">
        <span className="scale-50">₦</span>
        <Counter from={countStart} to={wallet} duration={2000} />
        <span
          className={`absolute text-sm top-full right-0 ${
            isWinner === "draw"
              ? "text-white/40"
              : isWinner
              ? "text-success"
              : "text-error"
          }`}
        >
          {isWinner === "draw" ? "+0" : isWinner ? `+${stake}` : `-${stake}`}
        </span>
      </span>
      {/* Buttons */}
      <div className="flex gap-3 mt-14 justify-center">
        <Link
          href={"/"}
          className="btn active:scale-90  duration-300 scale-100 btn-soft fx rounded-lg"
        >
          <IconHome2 className="size-5 opacity-55 mb-0.5" />
          Home
        </Link>
        {rematchOffer ? (
          <button
            onClick={sendJoinGame}
            disabled={disabled}
            className="btn fx active:scale-90  duration-300 scale-100 rounded-lg btn-success animate-pulse text-white "
          >
            Join Game{" "}
            {disabled && (
              <span className="loading loading-spinner size-5"></span>
            )}
          </button>
        ) : (
          <button
            onClick={sendRematchOffer}
            className="btn fx active:scale-90 duration-300 scale-100 btn-soft rounded-lg btn-info "
          >
            {rematch ? (
              <span className="loading loading-spinner size-5"></span>
            ) : (
              <>
                Rematch
                <IconReload className="size-5  mb-0.5" />
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
