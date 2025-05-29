"use client";

import { useRouter } from "next/navigation";
import { createGame } from "@/lib/game";
import { useToast } from "@/context/ToastContext";
import CreateForm from "./createForm";
import { useState } from "react";

export default function CreateGame() {
  const { toast } = useToast();
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
            toast(game, "error");
            setdisabled(false);
          } else if (game) {
            router.push(`/${game.code}`);
          }
        }, 500);
      }}
    />
  );
}
