"use client";

import FriendsProvider from "@/context/FriendsContext";
import NotificationsProvider from "@/context/NotificationsContext";
import PreferenceProvider from "@/context/PreferenceProvider";
import { useSession } from "@/context/SessionProvider";
import { SocketProvider } from "@/context/SocketProvider";
import { useRouter } from "next/navigation";
import React from "react";
import type { ReactNode } from "react";

function Layout({ children }: { children: ReactNode }) {
  const session = useSession();
  const { replace } = useRouter();

  if (!session?.user?.id) {
    replace(`/auth`);
    return;
  }

  document.title = `${session.user?.name} | chesser`;

  return (
    <SocketProvider>
      <PreferenceProvider>
        <FriendsProvider>
          <NotificationsProvider>{children}</NotificationsProvider>
        </FriendsProvider>
      </PreferenceProvider>
    </SocketProvider>
  );
}

export default Layout;
