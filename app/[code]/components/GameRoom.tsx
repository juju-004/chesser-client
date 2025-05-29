"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { Lobby, User } from "@/types";
import { useSocket } from "@/context/SocketProvider";

type RoomContextType = {
  connectedUsers: Partial<User>[];
  isUserConnected: (id: string) => boolean;
  setConnectedUsers: React.Dispatch<React.SetStateAction<Partial<User>[]>>;
  isUserAPlayer: (id: string) =>
    | false
    | {
        side: string;
        user: User;
      };
};

const RoomContext = createContext<RoomContextType | undefined>(undefined);

export const RoomProvider = ({
  children,
  lobby,
}: {
  children: ReactNode;
  lobby: Lobby;
}) => {
  const [connectedUsers, setConnectedUsers] = useState<Partial<User>[]>([]);
  const { socket } = useSocket();

  const isUserAPlayer = (id: string) => {
    if (id === lobby.white?.id) {
      return { side: "white", user: lobby.white };
    }
    if (id === lobby.black?.id) {
      return { side: "black", user: lobby.black };
    }
    return false;
  };

  const isUserConnected = (id: string) => {
    return connectedUsers.some((user) => user.id === id);
  };

  useEffect(() => {
    console.log("yes chei");

    if (!socket) return;

    socket.emit("game:join", lobby.code);

    socket.on("update_connected_users", (users: Partial<User>[]) => {
      console.log(users);

      setConnectedUsers(users);
    });

    return () => {
      socket.emit("game:leave");
      socket.off("update_connected_users");
    };
  }, [socket, lobby.code]);

  return (
    <RoomContext.Provider
      value={{
        connectedUsers,
        setConnectedUsers,
        isUserAPlayer,
        isUserConnected,
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
