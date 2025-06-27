"use client";

import { useSession } from "@/context/SessionProvider";
import { unFriend } from "@/lib/user";
import { FriendRequest, ProfileData } from "@/types";
import React, { useEffect, useRef, useState } from "react";
import { IconUserMinus, IconUserPlus } from "@tabler/icons-react";
import clsx from "clsx";
import Link from "next/link";
import { useSocket } from "@/context/SocketProvider";
import { useFriends } from "@/context/FriendsContext";
import Subnav from "@/app/components/Subnav";
import { toast } from "sonner";

function Page({ setIsOpen }: { setIsOpen: () => void }) {
  const session = useSession();
  const [isLoading, setisLoading] = useState(false);
  const { friends, removeFriend } = useFriends();

  const rFriend = async (id: string) => {
    setisLoading(true);
    const g = await unFriend(id);

    if (typeof g === "string") {
      toast.error(g);
    } else {
      toast.info(g.message);
      removeFriend(id);
    }
    setisLoading(false);
  };

  return (
    <div className="bg-base-100 w-full h-full flex flex-col">
      <Subnav onClick={setIsOpen} text={`My Friends`} />
      <ul className="flex overflow-y-scroll flex-col flex-1 w-full">
        {friends.length === 0 ? (
          <li>No user friends</li>
        ) : (
          friends.map((friend, index) => (
            <li
              key={index}
              className="flex justify-between mt-2 bg-black/15 px-6 py-2.5"
            >
              <Link
                href={`/u/${friend.name}`}
                className="flex gap-4 items-center"
              >
                <span
                  className={clsx(
                    "w-3 h-3 rounded-full fx",
                    friend.online ? "bg-green-500" : "bg-gray-600"
                  )}
                ></span>
                {friend.name}
              </Link>
              <div>
                <button
                  onClick={() => rFriend(friend.id as string)}
                  className="btn-circle btn btn-ghost"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="loading loading-spinner text-error loading-sm"></span>
                  ) : (
                    <IconUserMinus
                      size={18}
                      className="text-error"
                    ></IconUserMinus>
                  )}
                </button>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

function AddButton({ isFriend, id }: { isFriend?: boolean; id: string }) {
  const [disabled, setDisabled] = useState(false);
  const session = useSession();
  const { socket } = useSocket();
  const [unFriendLoading, setUnFriendLoading] = useState(false);
  const { removeFriend, getUserFriends } = useFriends();

  const addFriend = () => {
    try {
      setDisabled(true);
      if (session.user?.id === id) return;

      socket.emit("send_friend_request", {
        from: session.user?.id,
        to: id,
      });
    } catch (error) {
      setDisabled(false);
      toast.error("Could'nt send request");
    }
  };

  socket.on("friend_request_responded", async (request: FriendRequest) => {
    if (request.status === "accepted") {
      await getUserFriends();
    }
    toast[request.status === "accepted" ? "success" : "error"](
      `${request.to.name} ${request.status} your friend request`
    );
  });

  const updateFriend = async () => {
    setUnFriendLoading(true);
    const g = await unFriend(id);

    if (typeof g === "string") {
      toast.error("Something went wrong");
    } else {
      toast.info(g.message);
      removeFriend(id);
    }
    setUnFriendLoading(false);
  };

  useEffect(() => {
    setTimeout(() => {
      setDisabled(false);
    }, 20000);
  }, [disabled]);

  return (
    <button
      onClick={isFriend ? updateFriend : addFriend}
      className={clsx(
        "bg-base-200 px-6 flex click justify-between py-4 gap-2",
        isFriend || disabled ? "text-gray-400" : "text-secondary"
      )}
      disabled={disabled || unFriendLoading}
    >
      {isFriend ? (
        <>
          <span>Unfriend</span>
          {unFriendLoading ? (
            <span className="loading loading-spinner loading-sm"></span>
          ) : (
            <IconUserMinus size={18} />
          )}
        </>
      ) : disabled ? (
        <>Waiting for reply...</>
      ) : (
        <>
          <span>Add friend</span>
          <IconUserPlus size={18} />
        </>
      )}
    </button>
  );
}

const Friends = {
  Page,
  AddButton,
};
export default Friends;
