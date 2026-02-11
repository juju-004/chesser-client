"use client";

import FriendsProvider from "@/context/FriendsContext";
import NotificationsProvider from "@/context/NotificationsContext";
import PreferenceProvider from "@/context/PreferenceProvider";
import { useSession } from "@/context/SessionProvider";
import { SocketProvider } from "@/context/SocketProvider";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect } from "react";
import type { ReactNode } from "react";
import Loading from "../Loading";
import dynamic from "next/dynamic";
import MenuSlider from "../components/MenuSlider";

const ChallengeModalMain = dynamic(
  () => import("../components/Challenge").then((mod) => mod.default.ModalMain),
  { ssr: false },
);
const ChallengeModal = dynamic(
  () => import("../components/Challenge").then((mod) => mod.default.Modal),
  { ssr: false },
);
const NotificationsModal = dynamic(
  () => import("../components/Notifications").then((mod) => mod.default.Modal),
  { ssr: false },
);
const FriendStatusModal = dynamic(
  () => import("../components/FriendStatus").then((mod) => mod.default.Modal),
  { ssr: false },
);

function Layout({ children }: { children: ReactNode }) {
  const session = useSession();
  const router = useRouter();
  const pathName = usePathname();

  useEffect(() => {
    if (session.user === null) {
      router.push(`/auth?callback=${pathName}`);
    }
  }, [session.user, router]);

  if (!session.user) {
    return <Loading />; // Or any spinner
  }

  return (
    <SocketProvider>
      <PreferenceProvider>
        <FriendsProvider>
          <NotificationsProvider>
            <MenuSlider>{children}</MenuSlider>
            <ChallengeModalMain />
            <ChallengeModal />
            <FriendStatusModal />
            <NotificationsModal />
          </NotificationsProvider>
        </FriendsProvider>
      </PreferenceProvider>
    </SocketProvider>
  );
}

export default Layout;
