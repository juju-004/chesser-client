import {
  IconChessBishopFilled,
  IconChessKing,
  IconX,
} from "@tabler/icons-react";
import React, { useState } from "react";
import CreateGame from "./game/createGame";
import JoinGame from "./game/JoinGame";
import BottomModal from "../BottomModal";

function Play() {
  const [createOpen, setCreateOpen] = useState<boolean>(false);
  const [joinOpen, setJoinOpen] = useState<boolean>(false);
  const items = [
    {
      text: "Create game",
      icon: <IconChessBishopFilled size={45} className={` text-primary`} />,
    },
    {
      text: "Join game",
      icon: <IconChessKing size={45} className={` text-secondary`} />,
    },
  ];

  return (
    <div className="grid w-full grid-cols-2 grid-rows-2 flex-wrap gap-4 px-3">
      {items.map((item, key) => (
        <React.Fragment key={key}>
          <label
            onClick={() => (key ? setJoinOpen(true) : setCreateOpen(true))}
            className="fx row-span-1"
          >
            <div className="active:bg-base-200/40 hover:bg-base-200/40 fx flex-col gap-4 rounded-2xl px-[5vw] py-2.5 duration-200">
              <div className="bg-base-300 fx size-[25vw] rounded-xl">
                {item.icon}
              </div>
              <span className="whitespace-nowrap">{item.text}</span>
            </div>
          </label>

          <BottomModal
            isOpen={key ? joinOpen : createOpen}
            onClose={() => (key ? setJoinOpen(false) : setCreateOpen(false))}
          >
            <div className="flex !h-[calc(100vh-300px)] mt-2 pb-5 px-2 flex-col">
              <header className="bg-base-300 flex px-1 items-center py-1">
                {item.icon}
                <span className="text-xl">{item.text}</span>
              </header>
              {key ? <JoinGame /> : <CreateGame />}
            </div>
          </BottomModal>
        </React.Fragment>
      ))}
    </div>
  );
}

export default Play;
