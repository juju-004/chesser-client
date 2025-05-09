"use client";

import MenuSlider from "@/app/components/MenuSlider";
import Slider from "@/app/components/Slider";
import { useSession } from "@/context/SessionProvider";
import { ProfileData } from "@/types";
import {
  IconChevronRight,
  IconEdit,
  IconPower,
  IconUsers,
} from "@tabler/icons-react";
import React, { useState } from "react";
import Games from "./components/Games";
import { useToast } from "@/context/ToastContext";
import { logout } from "@/lib/auth";
import { useRouter } from "next/navigation";
import Subnav from "@/app/components/Subnav";
import Friends, { FriendButton } from "./components/Friends";
import { Block } from "./components/Block";

interface Profile {
  data: ProfileData;
}

export default function Profile({ data }: Profile) {
  const [profile, setProfile] = useState<ProfileData>(data);
  const session = useSession();
  const [isOpen, setisOpen] = useState<boolean | "game" | "friends">(false);
  const [logoutLoader, setlogoutLoader] = useState(false);
  const { toast } = useToast();
  const { replace } = useRouter();

  const isUser = session.user?.id === profile.id;

  const back = () => {
    window.history.back();
  };

  const signOut = () => {
    setlogoutLoader(true);

    setTimeout(async () => {
      const user = await logout();
      if (typeof user === "string") {
        toast(user, "error");
        setlogoutLoader(false);
        return;
      }

      session?.setUser(null);
      replace("/auth");
    }, 300);
  };

  return (
    <MenuSlider navClass="bg-base-300">
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
              <Friends setIsOpen={() => setisOpen(false)} />
            )}
          </>
        }
      >
        <div className=" max-w-4xl mx-auto bg-base-100 min-h-screen w-full shadow-lg rounded-2xl">
          <Subnav
            text={
              <span className="flex flex-col">
                <h2 className="text-xl relative text-gray-300 flex gap-3">
                  {profile.name}
                  {isUser && (
                    <IconEdit className="absolute left-[105%]" size={15} />
                  )}
                </h2>
                {isUser && (
                  <span className="text-xs -mt-0.5 opacity-40">
                    {profile.email}
                  </span>
                )}
              </span>
            }
            onClick={back}
          />
          <div className=" bg-base-300 text-sm text-gray-400 w-full flex px-6 pb-6 pt-2 justify-between">
            <span className="flex gap-3 ">
              Wins
              <span className="badge badge-success text-white">
                {profile.wins}
              </span>
            </span>
            <span className="flex gap-3 ">
              Draws
              <span className="badge badge-neutral text-white">
                {profile.draws}
              </span>
            </span>
            <span className="flex gap-3 ">
              Losses
              <span className="badge badge-error text-white">
                {profile.losses}
              </span>
            </span>
          </div>

          <div className="flex gap-2 p-6 flex-col">
            <button
              onClick={() => setisOpen("game")}
              className=" bg-base-200 px-6 flex justify-between py-4 gap-2"
            >
              <span>Games</span>

              <span className="flex gap-2 items-center">
                <span>{profile.games}</span>
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
                  {logoutLoader ? (
                    <span className="loading loading-spinner loading-xs"></span>
                  ) : (
                    <IconPower size={18} />
                  )}
                </button>
              </>
            ) : (
              <>
                <FriendButton
                  id={profile.id as string}
                  updateProfile={(p) =>
                    setProfile({ ...profile, isFriend: p.isFriend })
                  }
                  isFriend={profile.isFriend}
                />
                <Block
                  id={profile.id as string}
                  updateProfile={(p) =>
                    setProfile({ ...profile, isBlocked: p.isBlocked })
                  }
                  isBlocked={profile.isBlocked}
                />
              </>
            )}
          </div>
        </div>
      </Slider>
    </MenuSlider>
  );
}
