"use client";

import { useState, useTransition } from "react";
import { ProfileData } from "@/types";
import { useSession } from "@/context/SessionProvider";
import {
  IconChevronRight,
  IconCircleFilled,
  IconEdit,
  IconPower,
  IconSwords,
  IconUsers,
} from "@tabler/icons-react";
import { logout } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useFriends } from "@/context/FriendsContext";
import Slider from "../../../components/Slider";
import dynamic from "next/dynamic";
import { useSocket } from "@/context/SocketProvider";
import { toast } from "sonner";

const Games = dynamic(() => import("./components/Games"), {
  ssr: false,
});
const FriendsPage = dynamic(
  () => import("./components/Friends").then((mod) => mod.default.Page),
  {
    ssr: false,
  }
);
const FriendsButton = dynamic(
  () => import("./components/Friends").then((mod) => mod.default.AddButton),
  {
    ssr: false,
  }
);

export default function Profile({ data }: { data: ProfileData }) {
  const session = useSession();
  const [isOpen, setisOpen] = useState<boolean | "game" | "friends">(false);
  const [isPending, startTransition] = useTransition();
  const { socket } = useSocket();
  const { replace } = useRouter();
  const { isFriend, isFriendOnline } = useFriends();

  const isUser = session.user?.id === data.id;
  const isUserFriend = isFriend(data.id as string);

  const signOut = () => {
    startTransition(async () => {
      const user = await logout();
      if (typeof user === "string") {
        toast.error(user);
        return;
      }

      session?.setUser(null);
      socket.disconnect();
      replace("/auth");
    });
  };

  const challenge = () => {
    localStorage.setItem("c:to", data.id as string);

    (
      document.getElementById("challengeModalMain") as HTMLDialogElement
    )?.showModal();
  };

  return (
    <Slider
      isOpen={isOpen ? true : false}
      content={
        <>
          {isOpen === "game" && (
            <Games
              name={data.name as string}
              setIsOpen={() => setisOpen(false)}
            />
          )}

          {isOpen === "friends" && (
            <FriendsPage setIsOpen={() => setisOpen(false)} />
          )}
        </>
      }
    >
      <div className=" max-w-4xl mx-auto bg-base-100 min-h-screen w-full shadow-lg rounded-2xl">
        <span className="flex flex-col items-start relative px-9 py-2 bg-base-300">
          <h2 className="text-xl relative items-center text-gray-300 flex gap-2">
            {isFriendOnline(data.id as string) && (
              <IconCircleFilled size={15} className={"text-green-500"} />
            )}
            {data.name}
            {isUser && <IconEdit className="absolute left-[105%]" size={15} />}
          </h2>
          {isUser && (
            <span className="text-xs -mt-0.5 opacity-40">{data.email}</span>
          )}
        </span>
        <div className=" bg-base-300 text-sm text-gray-400 w-full flex px-6 pb-6 pt-2 justify-between">
          <span className="flex gap-3 ">
            Wins
            <span className="badge badge-success text-white">{data.wins}</span>
          </span>
          <span className="flex gap-3 ">
            Draws
            <span className="badge badge-neutral text-white">{data.draws}</span>
          </span>
          <span className="flex gap-3 ">
            Losses
            <span className="badge badge-error text-white">{data.losses}</span>
          </span>
        </div>

        <div className="flex gap-2 p-6 flex-col">
          <button
            onClick={() => setisOpen("game")}
            className=" bg-base-200 px-6 flex justify-between py-4 gap-2"
          >
            <span>Games</span>

            <span className="flex gap-2 items-center">
              <IconChevronRight size={18} />
            </span>
          </button>
          {isUser ? (
            <>
              <button
                onClick={() => setisOpen("friends")}
                className=" bg-base-200 mt-5 click text-info px-6 flex justify-between py-4 gap-2"
              >
                My Friends
                <IconUsers size={18} />
              </button>
              <button
                onClick={signOut}
                className=" bg-base-200 click text-error px-6 flex justify-between py-4 gap-2"
              >
                Logout
                {isPending ? (
                  <span className="loading loading-spinner loading-xs"></span>
                ) : (
                  <IconPower size={18} />
                )}
              </button>
            </>
          ) : (
            <>
              {isUserFriend && (
                <button
                  onClick={challenge}
                  className=" bg-base-200 mt-5 click px-6 flex text-cyan-500 justify-between py-4 gap-2"
                >
                  Challenge
                  <IconSwords size={20} />
                </button>
              )}
              <FriendsButton id={data.id as string} isFriend={isUserFriend} />
            </>
          )}
        </div>
      </div>
    </Slider>
  );
}
