"use client";

import Subnav from "@/app/components/Subnav";
import { createLocalPieceSet } from "@/app/(user)/preferences/components/Piece";
import { themes } from "@/app/(user)/preferences/components/Theme";
import { CLIENT_URL } from "@/config";
import { usePreference } from "@/context/PreferenceProvider";
import { useSession } from "@/context/SessionProvider";
import { fetchUserGames } from "@/lib/user";
import { Game } from "@/types";
import { IconCircle, IconClock } from "@tabler/icons-react";
import { Chess } from "chess.js";
import clsx from "clsx";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import { Chessboard } from "react-chessboard";
import { toast } from "sonner";

const gameEndText = (winner: Game["winner"], reason?: string) => {
  switch (reason) {
    case "checkmate":
      reason = `checkmate`;
      break;

    case "resigned":
      reason = `${winner === "white" ? "black" : "white"} ${reason}`;
      break;

    case "timeout":
      reason = `${winner === "white" ? "black" : "white"} ${reason}`;
      break;

    case "abandoned":
      reason = `${winner === "white" ? "black" : "white"} left the game`;
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
  const { userPreference } = usePreference();
  const pieces = userPreference && createLocalPieceSet(userPreference.pieceset);
  const session = useSession();
  const [gameCount, setGameCount] = useState<number | null>(null);
  const scrollRef = useRef<HTMLUListElement>(null);
  const [loading, setLoading] = useState(false);

  const getGames = async () => {
    if (games && gameCount === games?.length) return;
    setLoading(true);
    const g: { count: number; games: Game[] } | string = await fetchUserGames(
      name,
      gameCount ? gameCount / 10 - 1 : 0
    );

    if (typeof g === "string") {
      toast.error(g);
      return;
    }

    !gameCount && setGameCount(g.count);
    games ? setGames([...games, ...g.games]) : setGames(g.games);
    setLoading(false);
  };

  useEffect(() => {
    !games && getGames();
  }, []);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;

    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 100) {
      !loading && getGames();
    }
  };

  return (
    <div className="bg-base-100 w-full h-full flex flex-col">
      <Subnav
        onClick={() => setIsOpen()}
        text={`${session.user?.name === name ? "My" : `${name}'s`} Games ${
          games ? "(" + gameCount + ")" : ""
        }`}
      />
      <div className="flex h overflow-y-scroll flex-1 w-full justify-center">
        {!games ? (
          <span className="loading loading-dots text-info"></span>
        ) : games.length === 0 ? (
          <p className="text-gray-500 mt-2 text-base">No recent games.</p>
        ) : (
          <ul
            ref={scrollRef}
            onScroll={handleScroll}
            className="space-y-2 h-full pb-20 overflow-y-scroll overflow-x-hidden w-full"
          >
            {games.map((game, index) => {
              const g = new Chess();
              g.loadPgn(game.pgn as string);

              return (
                <Link
                  href={`${CLIENT_URL}/${game.code as string}`}
                  key={index}
                  className="px-3 relative py-5 even:bg-base-200 gap-3 fx click items-center"
                >
                  <span className="absolute top-4 text-2xl right-3 opacity-10 font-bold">
                    {index + 1}
                  </span>
                  <div className="w-24 h-24 overflow-hidden relative rounded">
                    <div className="absolute bg-black/30 inset-0 animate-pulse"></div>

                    {userPreference && (
                      <Chessboard
                        position={g.fen()}
                        customDarkSquareStyle={{
                          backgroundColor: themes[userPreference?.theme][0],
                        }}
                        customLightSquareStyle={{
                          backgroundColor: themes[userPreference?.theme][1],
                        }}
                        customBoardStyle={{ zIndex: 10 }}
                        customPieces={pieces}
                      />
                    )}
                  </div>
                  <div className="flex flex-col overflow-hidden flex-1 items-start">
                    <div className="flex font-bold w-full justify-start gap-2 items-center">
                      <span>{game.white?.name}</span>
                      <span className="opacity-60">vs</span>
                      <span>{game.black?.name}</span>
                    </div>
                    <div className="fx gap-2 opacity-60 text-sm mb-1">
                      <span className="fx">
                        <IconClock size={14} /> {game.timeControl}mins
                      </span>
                      <IconCircle size={8} />
                      <span className="fx mt-0.5">
                        ₦{game.stake.toLocaleString()}
                      </span>
                    </div>
                    <span
                      className={clsx(
                        game.winner === "draw"
                          ? "text-gray-400"
                          : (game.white?.name === name &&
                              game.winner === "white") ||
                            (game.black?.name === name &&
                              game.winner === "black")
                          ? "text-success"
                          : "text-error",
                        "text-xs mt-2 font-bold"
                      )}
                    >
                      {gameEndText(game.winner, game.endReason)}
                    </span>
                    <span className="text-xs opacity-50">
                      {formatDateToFriendly(game.startedAt)}
                    </span>
                  </div>
                </Link>
              );
            })}
            {loading && (
              <span className="w-full fx text-accent">
                <span className="loading loading-ball"></span>
              </span>
            )}
          </ul>
        )}
      </div>
    </div>
  );
}

export default Games;
