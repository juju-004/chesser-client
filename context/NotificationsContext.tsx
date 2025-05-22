"use client";

import type { ReactNode } from "react";
import React, { createContext, useState, useContext, useEffect } from "react";
import { useSession } from "./SessionProvider";
import { fetchNotifications } from "@/lib/user";
import { FriendRequest } from "@/types";

// Define the shape of the context value
type NotificationsContextValue = {
  notifications: FriendRequest[];
  setNotifications: React.Dispatch<React.SetStateAction<FriendRequest[]>>;
};

// Create the context with the correct type
export const NotificationsContext = createContext<
  NotificationsContextValue | undefined
>(undefined);

export default function NotificationsProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [notifications, setNotifications] = useState<FriendRequest[]>([]);
  const session = useSession();

  const getNotifications = async () => {
    if (!session?.user?.id) return;
    const notifications = await fetchNotifications();

    Array.isArray(notifications) && setNotifications(notifications);
  };

  useEffect(() => {
    getNotifications();
  }, []);

  return (
    <NotificationsContext.Provider value={{ notifications, setNotifications }}>
      {children}
    </NotificationsContext.Provider>
  );
}

// Custom hook to use the toast context
export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationsProvider"
    );
  }
  return context;
};
