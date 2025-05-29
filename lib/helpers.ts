import { Game } from "@/types";

export const isHost = (game: Partial<Game>) => {
  if (game?.white?.isHost) {
    return game.white;
  } else {
    return game.black;
  }
};
