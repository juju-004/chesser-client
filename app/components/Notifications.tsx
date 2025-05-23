import { useNotifications } from "@/context/NotificationsContext";
import { useSocket } from "@/context/SocketProvider";
import { useToast } from "@/context/ToastContext";
import { clearNotifications } from "@/lib/user";
import { FriendRequest } from "@/types";
import { IconTrash } from "@tabler/icons-react";
import { IconBell } from "@tabler/icons-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";

function formatChatTime(dateString: string): string {
  const now = new Date();
  const past = new Date(dateString);
  const diffMs = now.getTime() - past.getTime();

  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (seconds < 10) return "just now";
  if (seconds < 60) return `${seconds} sec${seconds > 1 ? "s" : ""} ago`;
  if (minutes < 60) return `${minutes} min${minutes > 1 ? "s" : ""} ago`;
  if (hours < 24) return `${hours} hr${hours > 1 ? "s" : ""} ago`;
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;

  // Optional: fallback to date format like "Mar 3"
  return past.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: now.getFullYear() === past.getFullYear() ? undefined : "numeric",
  });
}

function Button() {
  const { notifications } = useNotifications();

  const openModal = () => {
    (
      document.getElementById("notificationsModal") as HTMLDialogElement
    )?.showModal();

    document.getElementById("ind")?.classList.add("hidden");
  };

  return (
    <button
      onClick={openModal}
      id="notifyButton"
      className="btn btn-ghost btn-circle"
    >
      <span className="indicator">
        {notifications && notifications?.length !== 0 ? (
          <span
            id="ind"
            className="indicator-item badge badge-xs badge-soft badge-secondary"
          >
            {notifications?.length}
          </span>
        ) : (
          <></>
        )}

        <IconBell size={20} />
      </span>
    </button>
  );
}

function Modal() {
  const { notifications, setNotifications } = useNotifications();
  const { socket } = useSocket();
  const { toast } = useToast();
  const [disabled, setDisabled] = useState(false);
  const [loading, setLoading] = useState(false);

  const respondToRequest = (
    n: FriendRequest,
    index: number,
    accept: boolean
  ) => {
    setDisabled(true);

    try {
      setDisabled(true);
      socket.emit("respond_to_request", {
        from: n.from._id,
        to: n.to._id,
        accept,
      });

      const updated = [...notifications];
      updated.splice(index, 1);
      setNotifications(updated);
      setDisabled(false);
    } catch (error) {
      toast("Could'nt complete request");
      setDisabled(false);
    }
  };

  const clear = async () => {
    setLoading(true);
    const c = await clearNotifications();

    if (typeof c === "string") {
      toast(c, "error");
      return;
    }
    setNotifications([]);
    (
      document.getElementById("notificationsModal") as HTMLDialogElement
    )?.close();

    setLoading(false);
  };

  useEffect(() => {
    const onReceive = (request: FriendRequest) => {
      document.getElementById("ind")?.classList.remove("badge-soft", "hidden");

      setNotifications((prev) => [
        ...prev.filter((n) => n.from.name !== request.from.name),
        request,
      ]);
    };
    const onRespond = (request: FriendRequest) => {
      setNotifications([...notifications, request]);
    };

    socket.on("friend_request_received", onReceive);
    socket.on("friend_request_responded", onRespond);

    return () => {
      socket.off("friend_request_received", onReceive);
      socket.off("friend_request_responded", onRespond);
    };
  }, [socket, notifications]);

  return (
    <dialog id="notificationsModal" className="modal">
      <div className="modal-box flex max-h-[80vh] flex-col p-0 items-center">
        <header className="py-4 fx w-full relative shadow-md">
          <h2 className="font-bold">Notifications</h2>
          <button
            onClick={clear}
            className="absolute right-3 focus:bg-base-200 btn-error btn btn-ghost btn-circle btn-soft"
          >
            {loading ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              <IconTrash className="text-error" size={20} />
            )}
          </button>
        </header>
        <div className="flex flex-1 overflow-y-scroll flex-col  w-full px-3 gap-4 mt-3">
          {!notifications || notifications.length === 0 ? (
            <div className="w-full opacity-65 py-4 fx">
              No new notifications
            </div>
          ) : (
            notifications
              .sort(
                (a, b) =>
                  new Date(b.updatedAt || (b.createdAt as string)).getTime() -
                  new Date(a.updatedAt || (a.createdAt as string)).getTime()
              )
              .map((n, key) =>
                n.status === "pending" ? (
                  <div key={key} className="flex flex-col py-3 px-4">
                    <span className="text-base ">
                      <Link
                        href={`/u/${n.from.name}`}
                        className="font-bold cursor-pointer text-secondary"
                      >
                        {n.from.name}
                      </Link>{" "}
                      sent you a friend request
                    </span>
                    <span className="opacity-40 text-xs">
                      {formatChatTime(n.updatedAt || (n.createdAt as string))}
                    </span>
                    <div className="space-x-2 mt-2">
                      <button
                        className="btn btn-success btn-sm btn-soft"
                        onClick={() => respondToRequest(n, key, true)}
                        disabled={disabled}
                      >
                        Accept
                      </button>
                      <button
                        className="btn btn-error btn-soft btn-sm"
                        onClick={() => respondToRequest(n, key, false)}
                        disabled={disabled}
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col italic py-3 px-4">
                    <span className="text-base ">
                      <Link
                        href={`/u/${n.to.name}`}
                        className="font-bold cursor-pointer text-secondary"
                      >
                        {n.to.name}
                      </Link>{" "}
                      <span className="opacity-50">
                        {n.status} your friend request
                      </span>
                    </span>
                    <span className="opacity-40 text-xs">
                      {formatChatTime(n.updatedAt || (n.createdAt as string))}
                    </span>
                  </div>
                )
              )
          )}
        </div>
        <form method="dialog" className="flex gap-4 mt-2 pb-2">
          <button className="btn w-16 rounded-2xl btn-soft btn-secondary">
            Close
          </button>
        </form>
      </div>
    </dialog>
  );
}

const Notifications = {
  Button,
  Modal,
};

export default Notifications;
