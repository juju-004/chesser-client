"use client";

import { useSession } from "@/context/SessionProvider";
import { useRouter } from "next/navigation";
import React from "react";
import type { ReactNode } from "react";

function Layout({ children }: { children: ReactNode }) {
  const session = useSession();
  const { replace } = useRouter();

  if (session?.user) {
    replace("/");
    return;
  }

  return <div>{children}</div>;
}

export default Layout;
