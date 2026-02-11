"use client";

import { useSession } from "@/context/SessionProvider";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import type { ReactNode } from "react";

function Layout({ children }: { children: ReactNode }) {
  const session = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session?.user) {
      router.replace("/");
    }
  }, [session, router]);

  return <div>{children}</div>;
}

export default Layout;
