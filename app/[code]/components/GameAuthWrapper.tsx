"use client";

import type { Game } from "@/types";

import GamePage from "./GamePage";
import { useSession } from "@/context/SessionProvider";
import { usePathname, useRouter } from "next/navigation";

export default function GameAuthWrapper({
  initialLobby,
}: {
  initialLobby: Game;
}) {
  const session = useSession();
  const { push } = useRouter();
  const pathName = usePathname();
  if (!session?.user || !session.user?.id) {
    push(`/auth?callback=${pathName}`);
    return;
  } else {
    return <GamePage initialLobby={initialLobby} />;
  }
}
