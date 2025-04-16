import {
  IconMoodHappy,
  IconMoodSad,
  IconCrown,
  IconReload,
  IconHome,
  IconHome2,
  IconX,
} from "@tabler/icons-react";
import Counter from "./Counter";
import Link from "next/link";

type GameOverModalProps = {
  isWinner: boolean;
  //   onRematch: () => void;
  //   onGoHome: () => void;
  winnerName?: string;
};

export default function GameOver({
  isWinner,
  winnerName = "Opponent",
}: GameOverModalProps) {
  function modalControl() {
    (document.getElementById("my_modal_1") as HTMLDialogElement)?.close();
  }

  return (
    <div className="modal-box rounded-2xl relative flex flex-col items-center pt-14 pb-4">
      {/* <Counter from={0} to={100} duration={4000} /> */}
      <button
        onClick={modalControl}
        className="absolute top-2 right-2 btn btn-circle font-bold opacity-50"
      >
        <IconX />
      </button>
      <div className="absolute bg-black/20 bottom-0 inset-x-0 h-1/2"></div>
      {/* Winner/Loser Icon */}
      <div className="flex justify-center mb-3">
        {isWinner ? (
          <div className="relative">
            <IconCrown size={80} className="text-yellow-500" />
          </div>
        ) : (
          <IconMoodSad size={80} className="text-gray-500" />
        )}
      </div>
      {/* Title */}
      <h3 className="text-2xl text-center font-bold text-yellow-500 mb-2">
        {isWinner ? "You Won!" : "Game Over"}
      </h3>
      {/* Message */}
      <span className="text-center relative text-3xl text-white/60 font-bold">
        <span className="scale-50">₦</span>3,870
        <span className="absolute text-success text-sm top-full right-0">
          +540
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
