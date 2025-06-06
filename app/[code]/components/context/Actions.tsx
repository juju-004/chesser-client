"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { Game, Lobby, User } from "@/types";
import { useSocket } from "@/context/SocketProvider";
import { useRouter } from "next/navigation";
import { useSession } from "@/context/SessionProvider";
import { useToast } from "@/context/ToastContext";
import { currentSide } from "../active/Game";

type ActionsContextType = {
  sendRematchOffer: (lobby: Lobby) => void;
  acceptRematchOffer: (lobby: Lobby) => void;
  rematchOffer: boolean;
  rematchLoader: boolean;
  setRematchOffer: React.Dispatch<React.SetStateAction<boolean>>;
  drawOffer: boolean;
  setdrawOffer: React.Dispatch<React.SetStateAction<boolean>>;
};

const ActionsContext = createContext<ActionsContextType | undefined>(undefined);

export const ActionsProvider = ({ children }: { children: ReactNode }) => {
  const [rematchOffer, setRematchOffer] = useState<boolean>(false);
  const [rematchLoader, setRematchLoader] = useState<boolean>(false);
  const [drawOffer, setdrawOffer] = useState<boolean>(false);
  const { socket } = useSocket();
  const { toast } = useToast();
  const session = useSession();
  const router = useRouter();

  const sendRematchOffer = (lobby: Lobby) => {
    setRematchLoader(true);
    const wallet = (currentSide(lobby, session)?.user as User).wallet || 0;

    if (Math.sign(wallet - lobby.stake) === -1) {
      toast("Insufficient funds", "error");
      setRematchLoader(false);
    }

    socket.emit("rematch");
  };

  const acceptRematchOffer = (lobby: Lobby) => {
    setRematchLoader(true);
    const wallet = (currentSide(lobby, session)?.user as User).wallet || 0;

    if (Math.sign(wallet - lobby.stake) === -1) {
      toast("Insufficient funds", "error");
      setRematchLoader(false);
      return false;
    }

    socket.emit("rematch", {
      stake: lobby.stake,
      timeControl: lobby.timeControl,
      white: lobby.white,
      black: lobby.black,
    } as Game);
  };

  useEffect(() => {
    socket.on("rematch:received", () => {
      setRematchOffer(true);
    });
    socket.on("rematch:accept", (code: string) => {
      router.push(code);
    });
    socket.on("draw:received", () => {
      if (!drawOffer) {
        setdrawOffer(true);
        setTimeout(() => {
          setdrawOffer(false);
        }, 7000);
      }
    });

    return () => {
      socket.off("rematch:received");
      socket.off("draw:received");
      socket.off("rematch:accept");
    };
  }, [socket]);

  return (
    <ActionsContext.Provider
      value={{
        drawOffer,
        rematchLoader,
        rematchOffer,
        setdrawOffer,
        setRematchOffer,
        sendRematchOffer,
        acceptRematchOffer,
      }}
    >
      {children}
    </ActionsContext.Provider>
  );
};

export const useActions = (): ActionsContextType => {
  const context = useContext(ActionsContext);
  if (!context) {
    throw new Error("useActions must be used within a ActionsProvider");
  }
  return context;
};
