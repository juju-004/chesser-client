import "@/styles/globals.css";

import type { ReactNode } from "react";
import SessionProvider from "@/context/SessionProvider";
import { Toaster } from "sonner";

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
          <Toaster />
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
