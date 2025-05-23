import "@/styles/globals.css";

import type { ReactNode } from "react";
import ToastProvider from "@/context/ToastContext";
import SessionProvider from "@/context/SessionProvider";
import { SocketProvider } from "@/context/SocketProvider";
import NotificationsProvider from "@/context/NotificationsContext";
import FriendsProvider from "@/context/FriendsContext";

export const metadata = {
  description: "Play Chess online.",
  title: "chesser",
  openGraph: {
    title: "chesser",
    description: "Play Chess online.",
    url: "https://chesser",
    siteName: "chesser",
    locale: "en_US",
    type: "website",
  },
  robots: {
    index: true,
    follow: false,
    nocache: true,
    noarchive: true,
  },
  icons: {
    icon: [
      { type: "image/png", sizes: "32x32", url: "/logo32x32.svg" },
      { type: "image/png", sizes: "16x16", url: "/logo32x32.svg" },
    ],
    apple: { url: "/logo32x32.svg", sizes: "180x180" },
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  // document.documentElement.setAttribute("data-theme", "dark");
  return (
    <html lang="en" data-theme="dark" className="overflow-x-hidden">
      <body className="overflow-x-hidden">
        <SessionProvider>
          <SocketProvider>
            <ToastProvider>
              <FriendsProvider>
                <NotificationsProvider>{children}</NotificationsProvider>
              </FriendsProvider>
            </ToastProvider>
          </SocketProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
