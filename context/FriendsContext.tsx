"use client";

import type { ReactNode } from "react";
import React, { createContext, useState, useContext, useEffect } from "react";
import { useSession } from "./SessionProvider";
import { ProfileData } from "@/types";
import { fetchUserFriends } from "@/lib/user";
import { toast } from "sonner";

// Define the shape of the context value
type FriendsContextValue = {
  friends: ProfileData[];
  addFriend: (friend: ProfileData) => void;
  removeFriend: (id: string) => void;
  getUserFriends: () => Promise<void>;
  getOnlineFriends: () => ProfileData[];
  updateFriendStatus: (id: string, isOnline: boolean) => void;
  isFriend: (id: string) => boolean;
  isFriendOnline: (id: string) => boolean;
};

// Create the context with the correct type
export const FriendsContext = createContext<FriendsContextValue | undefined>(
  undefined
);

export default function FriendsProvider({ children }: { children: ReactNode }) {
  const [friends, setFriends] = useState<ProfileData[]>([]);
  const session = useSession();

  const getUserFriends = async () => {
    const g = await fetchUserFriends(session.user?.id as string);

    if (typeof g === "string") {
      toast.error("Couldn't get friends");
      return;
    }

    setFriends((g as ProfileData[]) || []);
  };

  const removeFriend = (id: string) => {
    setFriends((prev) => prev.filter((f) => f.id !== id));
  };

  const addFriend = (friend: ProfileData) => {
    setFriends((prev) => {
      const exists = prev.some((f) => f.id === friend.id);
      if (exists) return prev;
      return [...prev, friend];
    });
  };

  const getOnlineFriends = () => friends.filter((f) => f.online);

  const updateFriendStatus = (id: string, online: boolean) => {
    setFriends((prev) =>
      prev.map((friend) => (friend.id === id ? { ...friend, online } : friend))
    );
  };

  const isFriend = (id: string): boolean => {
    return friends.some((friend) => friend.id === id);
  };

  const isFriendOnline = (id: string): boolean => {
    return friends.some((friend) => friend.id === id && friend.online);
  };

  useEffect(() => {
    getUserFriends();
  }, []);

  return (
    <FriendsContext.Provider
      value={{
        friends,
        addFriend,
        getUserFriends,
        removeFriend,
        getOnlineFriends,
        updateFriendStatus,
        isFriend,
        isFriendOnline,
      }}
    >
      {children}
    </FriendsContext.Provider>
  );
}

// Custom hook to use the toast context
export const useFriends = () => {
  const context = useContext(FriendsContext);
  if (!context) {
    throw new Error("useFriends must be used within a FriendsProvider");
  }
  return context;
};
