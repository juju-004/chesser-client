"use client";

import { useEffect, useRef, useState } from "react";
import { IconSearch } from "@tabler/icons-react";
import MenuSlider from "../components/MenuSlider";
import { IconCircleFilled } from "@tabler/icons-react";
import { fetchPlayersByName } from "@/lib/user";
import { ProfileData } from "@/types";
import Link from "next/link";

export default function PlayerSearch() {
  const [search, setSearch] = useState("");
  const [filteredPlayers, setFilteredPlayers] = useState<ProfileData[]>([]);
  const input = useRef<HTMLLabelElement | null>(null);

  const getPlayersByName = async (name: string) => {
    const users = await fetchPlayersByName(name);

    setFilteredPlayers(users);
  };

  useEffect(() => {
    let ms = "";

    input.current && input.current.focus();

    setInterval(() => {
      if (ms === search) return;
      ms = search;
      search.length ? getPlayersByName(search) : setFilteredPlayers([]);
    }, 3000);
  }, [search]);

  return (
    <MenuSlider>
      <div className=" max-w-2xl py-4 w-full mx-auto">
        {/* Search bar */}
        <div className="px-6 form-control mb-6 w-full">
          <label
            ref={input}
            className="input input-bordered !outline-0 !ring-0 w-full flex items-center gap-2"
          >
            <IconSearch className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search players"
              className="grow"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
        </div>

        {/* Player Cards */}
        <div className="grid ">
          {filteredPlayers.length ? (
            filteredPlayers.map((player, key) => (
              <Link
                href={`/u/${player.name}`}
                key={key}
                className="card click odd:bg-base-200 rounded-none"
              >
                <div className="card-body py-5 flex flex-row items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h2 className="card-title font-normal text-base">
                      <IconCircleFilled
                        className={`w-3 rotate-45 h-3 ${
                          player.online ? "text-green-500" : "text-gray-600"
                        }`}
                      />
                      {player.name}
                    </h2>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="text-center mt-1.5 opacity-40">
              No results found
            </div>
          )}
        </div>
      </div>
    </MenuSlider>
  );
}
