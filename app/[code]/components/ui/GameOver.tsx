"use client";

import {
  IconMoodSad,
  IconCrown,
  IconReload,
  IconHome2,
  IconX,
  IconCircleHalf2,
} from "@tabler/icons-react";
import Counter from "./Counter";
import Link from "next/link";

type GameOverModalProps = {
  isWinner: boolean | "draw";
  countStart: number;
  stake: number;
};

export default function GameOver({
  isWinner,
  countStart,
  stake,
}: GameOverModalProps) {
  function modalControl() {
    (document.getElementById("my_modal_1") as HTMLDialogElement)?.close();
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
          <IconCircleHalf2 size={80} className="text-gray-500" />
        ) : isWinner ? (
          <IconCrown size={80} className="text-yellow-500" />
        ) : (
          <IconMoodSad size={80} className="text-gray-500" />
        )}
      </div>
      {/* Title */}
      <h3
        className={`text-2xl text-center font-bold mb-2 ${
          isWinner === "draw"
            ? "text-gray-500"
            : isWinner
            ? "text-yellow-500"
            : "text-gray-500"
        }`}
      >
        {isWinner === "draw" ? "Draw" : isWinner ? "You Won!" : "You Lost"}
      </h3>
      {/* Message */}
      <span className="text-center relative text-3xl text-white/60 font-bold">
        <span className="scale-50">₦</span>
        <Counter
          from={countStart}
          to={
            isWinner === "draw"
              ? countStart
              : isWinner
              ? countStart + stake
              : countStart - stake
          }
          duration={2000}
        />
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
      <form method="dialog" className="flex gap-3 mt-14 justify-center">
        <Link href={"/"}>
          <button className="btn">
            <IconHome2 className="mr-1 opacity-60" />
            Home
          </button>
        </Link>
        <button className="btn btn-soft btn-success ">
          <IconReload className="mr-1" />
          Rematch
        </button>
      </form>
    </div>
  );
}
