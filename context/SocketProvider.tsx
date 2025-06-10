"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { Socket } from "socket.io-client";
import { useSession } from "./SessionProvider";
import { socket } from "./socket";
import { useToast } from "./ToastContext";
import { IconWifi } from "@tabler/icons-react";

type SocketContextType = {
  socket: Socket;
  isConnected: boolean;
};

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const session = useSession();
  const [isConnected, setIsConnected] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!session?.user?.id) return;

    if (!socket.connected) socket.connect();

    socket.on("connect", () => setIsConnected(true));
    socket.on("error", (err: string) => {
      toast(err, "error");
    });
    socket.on("disconnect", (reason) => {
      console.log(reason);

      if (reason === "io server disconnect") {
        // the disconnection was initiated by the server, you need to manually reconnect
        console.log(socket.active); // false
      }
      // else the socket will automatically try to reconnect
      console.log(socket.active); // true
      setIsConnected(false);
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("error");
    };
  }, [session?.user?.id]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {!isConnected && (
        <div
          role="alert"
          className="alert bg-base-300 fixed z-[9999] left-1/2 -translate-x-1/2 mx-auto top-3 gap-0 p-2"
        >
          <IconWifi
            strokeWidth={2.5}
            size={26}
            className="text-red-500 animate-pulse"
          />
        </div>
      )}
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};
