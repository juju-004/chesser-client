"use client";

import { useSession } from "@/context/SessionProvider";
import { useToast } from "@/context/ToastContext";
import { fetchUserFriends, unFriend } from "@/lib/user";
import { FriendRequest, ProfileData } from "@/types";
import React, { useEffect, useRef, useState } from "react";
import Subnav from "@/app/components/Subnav";
import { IconReload, IconUserMinus, IconUserPlus } from "@tabler/icons-react";
import clsx from "clsx";
import Link from "next/link";
import { useSocket } from "@/context/SocketProvider";

function Page({ setIsOpen }: { setIsOpen: () => void }) {
  const [friends, setFriends] = useState<
    null | ProfileData[] | undefined | "error"
  >(null);
  const { toast } = useToast();
  const session = useSession();
  const [isLoading, setisLoading] = useState(false);

  const getUserFriends = async () => {
    const g = await fetchUserFriends(session.user?.name as string);
    setFriends(null);

    if (!g || typeof g === "string") {
      toast(g || "Something went wrong", "error");
      setFriends("error");
      return;
    }

    setFriends(g);
  };

  const unfriend = async (id: string) => {
    setisLoading(true);
    const g = await unFriend(id);

    setisLoading(false);
    console.log(g);

    if (!g || typeof g === "string") {
      toast(g || "Something went wrong", "error");
      return;
    }

    setFriends((friends as ProfileData[]).filter((f) => f.id !== id));
  };

  useEffect(() => {
    !friends && getUserFriends();
  }, []);

  return (
    <div className="bg-base-100 w-full h-full flex flex-col">
      <Subnav
        onClick={setIsOpen}
        text={`${session.user?.name + "'s"} friends`}
      />
      <div className="flex overflow-y-scroll flex-1 w-full justify-center">
        {!friends ? (
          <span className="loading loading-dots text-info"></span>
        ) : friends === "error" ? (
          <button
            onClick={getUserFriends}
            className="btn mt-[50%] btn-soft btn-info"
          >
            <IconReload size={14} /> retry
          </button>
        ) : friends.length === 0 ? (
          <p className="text-gray-500">No friends.</p>
        ) : (
          <ul className="space-y-2 h-full overflow-y-scroll py-3 overflow-x-hidden w-full">
            {friends.map((friend, index) => (
              <div
                key={index}
                className="flex justify-between bg-black/15 px-6 py-2.5"
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
                    onClick={() => unfriend(friend.id as string)}
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
              </div>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function AddButton({
  updateProfile,
  isFriend,
  id,
}: {
  updateProfile: (p: ProfileData) => void;
  isFriend?: boolean;
  id: string;
}) {
  const { toast } = useToast();
  const [disabled, setDisabled] = useState(false);
  const session = useSession();
  const { socket } = useSocket();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [unFriendLoading, setUnFriendLoading] = useState(false);

  useEffect(() => {
    if (disabled) {
      timeoutRef.current = setTimeout(() => {
        setDisabled(false);
      }, 20000);
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current); // cleanup on unmount or dependency change
    };
  }, [disabled]);

  const cancelTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const addFriend = () => {
    try {
      setDisabled(true);
      if (session.user?.id === id) return;

      socket.emit("send_friend_request", {
        from: session.user?.id,
        to: id,
      });
    } catch (error) {
      cancelTimeout();
      toast("Could'nt send request", "error");
    }
  };

  socket.on("friend_request_responded", (request: FriendRequest) => {
    if (request.status === "accepted") {
      updateProfile({ isFriend: true });
    }
    toast(
      `${request.to.name} ${request.status} your friend request`,
      request.status === "accepted" ? "success" : "error"
    );
    cancelTimeout();
  });

  const updateFriend = async () => {
    setUnFriendLoading(true);
    try {
      const g = await unFriend(id);

      toast(g.message, "info");
      updateProfile({ isFriend: false });
    } catch (error) {
      toast("Something went wrong", "error");
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
