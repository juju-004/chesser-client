"use client";

import FriendsProvider from "@/context/FriendsContext";
import NotificationsProvider from "@/context/NotificationsContext";
import PreferenceProvider from "@/context/PreferenceProvider";
import { useSession } from "@/context/SessionProvider";
import { SocketProvider } from "@/context/SocketProvider";
import ToastProvider from "@/context/ToastContext";
import { useRouter } from "next/navigation";
import React from "react";
import type { ReactNode } from "react";

function Layout({ children }: { children: ReactNode }) {
  const session = useSession();
  const { replace } = useRouter();

  if (!session?.user?.id && !session?.user?.verified) {
    replace(`/auth`);
    return;
  }

  document.title = `${session.user?.name} | chesser`;

  return (
    <PreferenceProvider>
      <ToastProvider>
        <SocketProvider>
          <FriendsProvider>
            <NotificationsProvider>{children}</NotificationsProvider>
          </FriendsProvider>
        </SocketProvider>
      </ToastProvider>
    </PreferenceProvider>
  );
}

export default Layout;
