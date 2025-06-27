"use client";

import { useRouter } from "next/navigation";
import { createGame } from "@/lib/game";
import CreateForm from "./createForm";
import { useState } from "react";
import { toast } from "sonner";

export default function CreateGame() {
  const [disabled, setdisabled] = useState(false);

  const router = useRouter();

  return (
    <CreateForm
      disabled={disabled}
      exec={async (s, t, a) => {
        setdisabled(true);
        setTimeout(async () => {
          const game = await createGame(s, t, a);

          if (typeof game === "string") {
            toast.error(game);
            setdisabled(false);
          } else if (game) {
            router.push(`/${game.code}`);
          }
        }, 500);
      }}
    />
  );
}
