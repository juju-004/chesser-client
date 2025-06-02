"use client";

import type { Dispatch, ReactNode, SetStateAction } from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { ThemeType } from "@/app/preferences/components/Theme";
import { PieceSet } from "@/app/preferences/components/Piece";
import { fetchPref, updatePref } from "@/lib/user";

type PreferenceContextType = {
  userPreference: Preference | undefined;
  setUserPreference: Dispatch<SetStateAction<Preference | undefined>>;
};

export type Preference = {
  theme: ThemeType;
  pieceset: PieceSet;
  sound: boolean;
  autoQueen: boolean;
  premove: boolean;
};

const PreferenceContext = createContext<PreferenceContextType | undefined>(
  undefined
);

export default function PreferenceProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [userPreference, setUserPreference] = useState<
    Preference | undefined
  >();

  async function getPreference() {
    const pref = await fetchPref();
    pref && typeof pref !== "string" && setUserPreference(pref);
  }

  useEffect(() => {
    getPreference();
  }, []);

  return (
    <PreferenceContext.Provider value={{ userPreference, setUserPreference }}>
      {children}
    </PreferenceContext.Provider>
  );
}

export const usePreference = () => {
  const context = useContext(PreferenceContext);
  if (context === undefined) {
    throw new Error("usePreference must be used within a PreferenceProvider");
  }
  return context;
};
