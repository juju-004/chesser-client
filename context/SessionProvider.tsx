"use client";

import type { Dispatch, ReactNode, SetStateAction } from "react";
import { createContext, useContext, useEffect, useState } from "react";

import { fetchSession } from "@/lib/auth";
import { User } from "@/types";
import Loading from "@/app/components/Loading";

type SessionContextType = {
  user: User | null;
  setUser: Dispatch<SetStateAction<User | null>>;
};

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export default function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(undefined);

  async function getSession() {
    const user = await fetchSession();

    setUser(user || null);
  }

  useEffect(() => {
    getSession();
  }, []);

  return (
    <SessionContext.Provider value={{ user, setUser }}>
      {user === undefined ? <Loading /> : <>{children}</>}
    </SessionContext.Provider>
  );
}

export const useSession = () => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
};
