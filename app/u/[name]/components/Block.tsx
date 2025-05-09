"use client";

import { useToast } from "@/context/ToastContext";
import { blockUser, unBlockUser } from "@/lib/user";
import { ProfileData } from "@/types";
import { IconBan } from "@tabler/icons-react";
import clsx from "clsx";
import { useState } from "react";

export const Block = ({
  updateProfile,
  isBlocked,
  id,
}: {
  updateProfile: (p: ProfileData) => void;
  isBlocked?: boolean;
  id: string;
}) => {
  const { toast } = useToast();
  const [disabled, setDisabled] = useState(false);

  console.log(isBlocked);

  const updateBlockedUser = async () => {
    if (disabled) return;
    setDisabled(true);
    const g = isBlocked ? await unBlockUser(id) : await blockUser(id);

    console.log(g);

    setDisabled(false);
    if (!g || typeof g === "string") {
      toast(g || "Something went wrong", "error");
      return;
    }

    updateProfile(g);
  };

  return (
    <button
      onClick={updateBlockedUser}
      className={clsx(
        "bg-base-200 px-6 flex click justify-between py-4 gap-2",
        isBlocked ? "text-gray-400" : "text-error"
      )}
    >
      {isBlocked ? (
        <>
          UnBlock
          <IconBan size={18} />
        </>
      ) : (
        <>
          Block
          <IconBan size={18} />
        </>
      )}
    </button>
  );
};
