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
import { BoardOrientation } from "react-chessboard/dist/chessboard/types";
import { useRouter } from "next/navigation";
import { useToast } from "@/context/ToastContext";

type RoomContextType = {
  connectedUsers: Partial<User>[];
  isUserConnected: (id: string) => boolean;
  setConnectedUsers: React.Dispatch<React.SetStateAction<Partial<User>[]>>;
  getOpponent: (lobby: Lobby) => User | null;
  sendRematchOffer: (lobby: Lobby) => void;
  acceptRematchOffer: (lobby: Lobby) => void;
  rematchOffer: boolean;
  rematchLoader: boolean;
  setRematchOffer: React.Dispatch<React.SetStateAction<boolean>>;
  drawOfferFrom: string | false;
  setdrawOfferFrom: React.Dispatch<React.SetStateAction<string | false>>;
};

const RoomContext = createContext<RoomContextType | undefined>(undefined);

export const RoomProvider = ({ children }: { children: ReactNode }) => {
  const [connectedUsers, setConnectedUsers] = useState<Partial<User>[]>([]);
  const { socket } = useSocket();
  const { replace } = useRouter();
  const [rematchOffer, setRematchOffer] = useState<boolean>(false);
  const [rematchLoader, setRematchLoader] = useState<boolean>(false);
  const [drawOfferFrom, setdrawOfferFrom] = useState<string | false>(false);
  const { toast } = useToast();

  const sendRematchOffer = (lobby: Lobby) => {
    if (!lobby.side) return;
    setRematchLoader(true);
    const wallet = lobby[lobby.side]?.wallet || 0;

    if (Math.sign(wallet - lobby.stake) === -1) {
      toast("Insufficient funds", "error");
      setRematchLoader(false);
    }

    socket.emit("rematch");
  };

  const acceptRematchOffer = (lobby: Lobby) => {
    if (!lobby.side) return;
    setRematchLoader(true);
    const wallet = lobby[lobby.side]?.wallet || 0;

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

  const getOpponent = (lobby: Lobby) => {
    if (lobby.side) {
      const opponentSide: BoardOrientation =
        lobby.side === "black" ? "white" : "black";

      if (lobby[opponentSide] && lobby[opponentSide].id) {
        return lobby[opponentSide];
      }
    }

    return null;
  };

  const isUserConnected = (id: string) => {
    return connectedUsers.some((user) => user.id === id);
  };

  useEffect(() => {
    if (!socket) return;

    socket.on("redirect", (code: string) => {
      replace(code);
    });
    socket.on("update_users", (users: Partial<User>[]) => {
      console.log(users);

      setConnectedUsers(users);
    });
    socket.on("rematch:received", () => {
      setRematchOffer(true);
    });
    socket.on("draw:received", (from: string) => {
      if (!drawOfferFrom) {
        setdrawOfferFrom(from);
        setTimeout(() => {
          setdrawOfferFrom(false);
        }, 10000);
      }
    });

    return () => {
      socket.off("update_users");
      socket.off("redirect");
      socket.off("rematch:received");
      socket.off("draw:received");
      socket.off("rematch:accept");
    };
  }, [socket]);

  return (
    <RoomContext.Provider
      value={{
        connectedUsers,
        getOpponent,
        setConnectedUsers,
        isUserConnected,
        drawOfferFrom,
        rematchLoader,
        rematchOffer,
        setdrawOfferFrom,
        setRematchOffer,
        sendRematchOffer,
        acceptRematchOffer,
      }}
    >
      {children}
    </RoomContext.Provider>
  );
};

export const useRoom = (): RoomContextType => {
  const context = useContext(RoomContext);
  if (!context) {
    throw new Error("useRoom must be used within a RoomProvider");
  }
  return context;
};
