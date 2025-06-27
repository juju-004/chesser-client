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
import { IconWifi } from "@tabler/icons-react";
import { toast } from "sonner";

type SocketContextType = {
  socket: Socket;
  isConnected: boolean;
};

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const session = useSession();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!session?.user?.id) {
      socket.disconnect();
      return;
    }

    if (!socket.connected) {
      socket.connect();
    }

    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);
    const handleError = (err: string) => toast.error(err);

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("error", handleError);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("error", handleError);
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
