import api, { handler } from "./api";

export const createGame = async (
  side: string,
  timeControl: number,
  amount: number
) => handler(() => api.post("games", { side, timeControl, amount }));

export const fetchGame = async (code: string) =>
  handler(() => api.get(`games/${code}`));
