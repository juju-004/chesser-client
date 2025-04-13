"use client";

import { useSession } from "@/context/SessionProvider";
import { useRouter } from "next/navigation";
import React from "react";
import type { ReactNode } from "react";

function Layout({ children }: { children: ReactNode }) {
  const session = useSession();
  const { replace } = useRouter();

  if (!session?.user) {
    replace(`/auth`);
    return;
  }

  document.title = `${session.user?.name} | chesser`;

  return <>{children}</>;
}

export default Layout;
