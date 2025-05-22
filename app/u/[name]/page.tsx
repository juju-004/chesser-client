"use client";

import { fetchProfileData } from "@/lib/user";
import { useEffect, useState } from "react";
import { ProfileData } from "@/types";
import Loading from "@/app/components/Loading";
import MenuSlider from "@/app/components/MenuSlider";
import Slider from "@/app/components/Slider";
import { useSession } from "@/context/SessionProvider";
import {
  IconChevronRight,
  IconEdit,
  IconPower,
  IconUsers,
} from "@tabler/icons-react";
import Games from "./components/Games";
import { useToast } from "@/context/ToastContext";
import { logout } from "@/lib/auth";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Friends from "./components/Friends";

export default function Profile({ params }: { params: { name: string } }) {
  const [data, setData] = useState<ProfileData | null>(null);
  const session = useSession();
  const [isOpen, setisOpen] = useState<boolean | "game" | "friends">(false);
  const [logoutLoader, setlogoutLoader] = useState(false);
  const { toast } = useToast();
  const { replace } = useRouter();

  useEffect(() => {
    const loadData = async () => {
      const profileData = await fetchProfileData(params.name);
      setData(profileData as ProfileData);
    };

    loadData();
  }, [params.name]);

  if (!data) return <Loading />;
  const isUser = session.user?.id === data.id;

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
              <Friends.Page setIsOpen={() => setisOpen(false)} />
            )}
          </>
        }
      >
        <div className=" max-w-4xl mx-auto bg-base-100 min-h-screen w-full shadow-lg rounded-2xl">
          <span className="flex flex-col items-start relative px-9 py-2 bg-base-300">
            <h2 className="text-xl relative text-gray-300 flex gap-3">
              {data.name}
              {isUser && (
                <IconEdit className="absolute left-[105%]" size={15} />
              )}
            </h2>
            {isUser && (
              <span className="text-xs -mt-0.5 opacity-40">{data.email}</span>
            )}
          </span>
          <div className=" bg-base-300 text-sm text-gray-400 w-full flex px-6 pb-6 pt-2 justify-between">
            <span className="flex gap-3 ">
              Wins
              <span className="badge badge-success text-white">
                {data.wins}
              </span>
            </span>
            <span className="flex gap-3 ">
              Draws
              <span className="badge badge-neutral text-white">
                {data.draws}
              </span>
            </span>
            <span className="flex gap-3 ">
              Losses
              <span className="badge badge-error text-white">
                {data.losses}
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
                <span>{data.games}</span>
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
                {data.isFriend && (
                  <button className=" bg-base-200 mt-5 click px-6 flex text-cyan-500 justify-between py-4 gap-2">
                    Challenge
                    <Image
                      src={"/svg/battle.svg"}
                      alt=""
                      width={50}
                      height={50}
                      className="size-6 text-gray-400"
                    />
                  </button>
                )}
                <Friends.AddButton
                  id={data.id as string}
                  updateProfile={(p) =>
                    setData({ ...data, isFriend: p.isFriend })
                  }
                  isFriend={data.isFriend}
                />
              </>
            )}
          </div>
        </div>
      </Slider>
    </MenuSlider>
  );
}
