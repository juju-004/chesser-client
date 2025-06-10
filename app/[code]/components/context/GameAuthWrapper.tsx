"use client";

import type { Game } from "@/types";

import { useSession } from "@/context/SessionProvider";
import { usePathname, useRouter } from "next/navigation";
import ActiveGame from "../active/Game";

export default function GameAuthWrapper({
  initialLobby,
}: {
  initialLobby: Game;
}) {
  const session = useSession();
  const { push } = useRouter();
  const pathName = usePathname();
  if (!session?.user?.id) {
    push(`/auth?callback=${pathName}`);
    return;
  } else {
    return <ActiveGame initialLobby={initialLobby} />;
  }
}
