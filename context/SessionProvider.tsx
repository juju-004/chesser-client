"use client";

import type { Dispatch, ReactNode, SetStateAction } from "react";
import { createContext, useContext, useEffect, useState } from "react";

import { fetchSession } from "@/lib/auth";
import { User } from "@/types";

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
      {user === undefined ? (
        <div className="animate-fadein absolute inset-0 z-40">
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="loading text-c2 loading-spinner loading-xl"></span>
          </div>
        </div>
      ) : (
        <>{children}</>
      )}
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
