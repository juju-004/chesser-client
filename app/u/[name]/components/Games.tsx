"use client";

import Subnav from "@/app/components/Subnav";
import { CLIENT_URL } from "@/config";
import { useSession } from "@/context/SessionProvider";
import { useToast } from "@/context/ToastContext";
import { fetchUserGames } from "@/lib/user";
import { Game } from "@/types";
import { IconChess, IconCircle, IconClock } from "@tabler/icons-react";
import clsx from "clsx";
import Link from "next/link";
import React, { useEffect, useState } from "react";

const gameEndText = (winner: Game["winner"], reason?: string) => {
  switch (reason) {
    case "checkmate":
      reason = `checkmate. ${winner} wins`;
      break;

    case "resigned":
      reason = `${
        winner === "white" ? "black" : "white"
      } ${reason}. ${winner} wins`;
      break;

    case "timeout":
      reason = `${
        winner === "white" ? "black" : "white"
      } ${reason}. ${winner} wins`;
      break;

    case "abandoned":
      reason = `${
        winner === "white" ? "black" : "white"
      } left the game. ${winner} wins`;
      break;

    case "repetition":
      reason = `draw by repitition`;
      break;

    default:
      break;
  }

  return reason;
};

function formatDateToFriendly(dateString?: number) {
  if (!dateString) return;
  const date = new Date(dateString);
  const now = new Date();

  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? "pm" : "am";
  const displayHours = hours % 12 || 12;
  const displayMinutes = minutes.toString().padStart(2, "0");

  const timeStr = `${displayHours}:${displayMinutes}${ampm}`;
  return isToday
    ? `Today at ${timeStr}`
    : `${date.toLocaleDateString()} at ${timeStr}`;
}

function Games({ setIsOpen, name }: { setIsOpen: () => void; name: string }) {
  const [games, setGames] = useState<null | Game[] | undefined>(null);
  const { toast } = useToast();
  const session = useSession();

  const getGames = async () => {
    const g = await fetchUserGames(name);

    if (typeof g === "string") {
      toast(g, "error");
      return;
    }

    setGames(g);
  };

  useEffect(() => {
    !games && getGames();
  }, []);

  return (
    <div className="bg-base-100 w-full h-full flex flex-col">
      <Subnav
        onClick={() => setIsOpen()}
        text={`${session.user?.name === name ? "My" : `${name}'s`} Games ${
          games ? "(" + games?.length + ")" : ""
        }`}
      />
      <div className="flex h overflow-y-scroll flex-1 w-full justify-center">
        {!games ? (
          <span className="loading loading-dots text-info"></span>
        ) : games.length === 0 ? (
          <p className="text-gray-500 mt-2 text-base">No recent games.</p>
        ) : (
          <ul className="space-y-2 h-full pb-20 overflow-y-scroll overflow-x-hidden w-full">
            {games.map((game, index) => (
              <Link
                href={`${CLIENT_URL}/${game.code as string}`}
                key={index}
                className="p-3 even:bg-base-200 odd:bg-base-200/40 fx flex-col click items-center"
              >
                <div className="fx gap-2 opacity-60 text-sm mb-1">
                  <span className="fx">
                    <IconClock size={14} /> {game.timeControl}mins
                  </span>
                  <IconCircle size={8} />
                  <span className="fx mt-0.5">₦{game.stake}</span>
                </div>
                <div className="flex items-center gap-6">
                  <div className="fx gap-2">
                    <IconChess size={12} className="text-white" />
                    <span className="font-bold">{game.white?.name}</span>
                  </div>
                  <span className="opacity-60">vs</span>
                  <div className=" fx gap-2">
                    <span className="font-bold">{game.black?.name}</span>
                    <IconChess size={12} className="text-black" />
                  </div>
                </div>
                <span
                  className={clsx(
                    game.winner === "draw"
                      ? "text-white"
                      : (game.white?.name === name &&
                          game.winner === "white") ||
                        (game.black?.name === name && game.winner === "black")
                      ? "text-success"
                      : "text-error",
                    "text-xs mt-2"
                  )}
                >
                  {gameEndText(game.winner, game.endReason)}
                </span>
                <span className="text-xs opacity-50">
                  {formatDateToFriendly(game.startedAt)}
                </span>
              </Link>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default Games;
