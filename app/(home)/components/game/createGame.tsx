"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { createGame } from "@/lib/game";
import Button from "./button";
import { useToast } from "@/context/ToastContext";
import { useSession } from "@/context/SessionProvider";

export default function CreateGame() {
  const session = useSession();
  const [disabled, setDisabled] = useState(false);
  const { toast } = useToast();

  const router = useRouter();

  async function submitCreateGame(formdata: any) {
    if (!session?.user?.id) return;

    const timeControl = parseInt(`${formdata.get("time").split(" ")[0]}`);
    const amount = formdata.get("amount");
    const side = formdata.get("side");

    setDisabled(true);

    setTimeout(async () => {
      const game = await createGame(side, timeControl, amount);

      if (typeof game === "string") {
        setDisabled(false);
        toast(game, "error");
      } else if (game) {
        router.push(`/${game.code}`);
        // TODO: Show error message
      }
    }, 700);
  }

  return (
    <form action={submitCreateGame} className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-5 pt-5">
        <div className="flex items-center justify-between">
          <label className="label" htmlFor="createStartingSide">
            <span className="">Time</span>
          </label>
          <div>
            <select
              name="time"
              disabled={disabled}
              defaultValue="3 mins"
              className="select"
            >
              <option>1 mins</option>
              <option>2 mins</option>
              <option>3 mins</option>
              <option>4 mins</option>
              <option>5 mins</option>
              <option>7 mins</option>
              <option>10 mins</option>
              <option>15 mins</option>
            </select>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <label className="label" htmlFor="createStartingSide">
            <span className="label-text">Select your side</span>
          </label>
          <div>
            <select
              name="side"
              disabled={disabled}
              defaultValue="Random"
              className="select"
            >
              <option>Random</option>
              <option>White</option>
              <option>Black</option>
            </select>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <label className="label" htmlFor="createStartingSide">
            <span className="label-text">Amount</span>
          </label>
          <div>
            <input
              type="text"
              className="input"
              placeholder="min 100."
              disabled={disabled}
              name="amount"
              defaultValue={"1000"}
            />
          </div>
        </div>
      </div>

      <Button disabled={disabled} text="Create" />
    </form>
  );
}
