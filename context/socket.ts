import { API_URL } from "@/config";
import { io, Socket } from "socket.io-client";

export const socket: Socket = io(API_URL, {
  withCredentials: true,
  autoConnect: false,
});
