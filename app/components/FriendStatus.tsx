import { useFriends } from "@/context/FriendsContext";
import { useSocket } from "@/context/SocketProvider";
import { IconCircleFilled } from "@tabler/icons-react";
import { IconSwords, IconUsers } from "@tabler/icons-react";
import clsx from "clsx";
import Link from "next/link";
import React, { useEffect } from "react";

function Button() {
  const { getOnlineFriends } = useFriends();

  const openModal = () => {
    (document.getElementById("friendsModal") as HTMLDialogElement)?.showModal();
  };

  return getOnlineFriends().length !== 0 ? (
    <button onClick={openModal} className="btn btn-ghost btn-circle">
      <span className="indicator">
        <span className="indicator-item badge badge-xs badge-soft badge-secondary">
          {getOnlineFriends()?.length}
        </span>

        <IconUsers size={20} />
      </span>
    </button>
  ) : (
    <></>
  );
}

function Modal() {
  const { updateFriendStatus, getOnlineFriends } = useFriends();
  const { socket } = useSocket();

  const close = (id: string) => {
    localStorage.setItem("c:to", id);

    (
      document.getElementById("challengeModalMain") as HTMLDialogElement
    )?.showModal();
  };

  useEffect(() => {
    socket.on("friend_status_changed", ({ userId, isOnline }) => {
      updateFriendStatus(userId, isOnline);
    });

    return () => {
      socket.off("friend_status_changed");
    };
  }, []);

  return (
    <dialog id="friendsModal" className="modal">
      <div className="modal-box flex max-h-[80vh] flex-col p-0 items-center">
        <header className="py-4 fx w-full relative shadow-md">
          <h2 className="font-bold">My Friends</h2>
        </header>
        <ul className="flex flex-1 overflow-y-scroll flex-col  w-full px-3 gap-4 mt-3">
          {getOnlineFriends().length === 0 ? (
            <li className="w-full opacity-65 py-4 fx">No friends online</li>
          ) : (
            getOnlineFriends().map((friend, index) => (
              <li
                key={index}
                className="flex justify-between click odd:bg-black/10 last:mb-3 px-6 py-2.5"
              >
                <Link
                  href={`/u/${friend.name}`}
                  className="flex gap-4 flex-1 items-center"
                >
                  <IconCircleFilled
                    size={15}
                    className={clsx(
                      friend.online ? "text-green-500" : "text-gray-600"
                    )}
                  />
                  {friend.name}
                </Link>
                <div>
                  <button
                    onClick={() => close(friend.id as string)}
                    className="btn-circle btn btn-ghost"
                  >
                    <IconSwords size={18} />
                  </button>
                </div>
              </li>
            ))
          )}
        </ul>
        <form method="dialog" className="flex gap-4 mt-2 pb-2">
          <button className="btn w-16 rounded-2xl btn-soft btn-secondary">
            Close
          </button>
        </form>
      </div>
    </dialog>
  );
}

const FriendStatus = {
  Button,
  Modal,
};

export default FriendStatus;
