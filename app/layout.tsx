import "@/styles/globals.css";

import type { ReactNode } from "react";
import { Josefin_Sans } from "next/font/google";
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
      { type: "image/svg", sizes: "16x16", url: "/logo32x32.svg" },
    ],
    apple: { url: "/logo32x32.svg", sizes: "180x180" },
  },
};

const josefin = Josefin_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

export default function RootLayout({ children }: { children: ReactNode }) {
  // document.documentElement.setAttribute("data-theme", "dark");
  return (
    <html lang="en" data-theme="dark">
      <body className={`overflow-x-hidden ${josefin.className}`}>
        <SessionProvider>
          <Toaster />
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
