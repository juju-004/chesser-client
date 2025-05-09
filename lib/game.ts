import { API_URL } from "@/config";
import type { Game } from "@/types";

export const createGame = async (
  side: string,
  timeControl: number,
  amount: number
) => {
  try {
    const res = await fetch(`${API_URL}/v1/games`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ side, timeControl, amount }),

      cache: "no-store",
    });

    if (res && res.status === 201) {
      const game: Game = await res.json();
      return game;
    } else if (res.status === 400 || res.status === 500) {
      const { message } = await res.json();
      return message as string;
    }
  } catch (err) {
    console.error(err);
  }
};

export const fetchActiveGame = async (code: string) => {
  try {
    const res = await fetch(`${API_URL}/v1/games/${code}`, {
      cache: "no-store",
    });

    if (res && res.status === 200) {
      const game: Game = await res.json();
      return game;
    }
  } catch (err) {
    console.error(err);
  }
};
export const fetchGame = async (code: string) => {
  try {
    const res = await fetch(`${API_URL}/v1/games/${code}`, {
      cache: "no-store",
    });

    if (res && res.status === 200) {
      const game: Game = await res.json();
      return game;
    }
  } catch (err) {
    console.error(err);
  }
};
