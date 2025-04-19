import {
  IconChessBishopFilled,
  IconChessKing,
  IconX,
} from "@tabler/icons-react";
import React from "react";
import CreateGame from "./game/createGame";
import JoinGame from "./game/JoinGame";

function Play() {
  const items = [
    {
      text: "Create game",
      id: "my_modal_3",
      icon: (size = "size-[15vw]") => (
        <IconChessBishopFilled className={`${size} text-fuchsia-600`} />
      ),
    },
    {
      text: "Join game",
      id: "my_modal_2",
      icon: (size = "size-[15vw]") => (
        <IconChessKing className={`${size} text-cyan-500`} />
      ),
    },
  ];

  const openModal = (id: string, type: "open" | "close") => {
    type === "open"
      ? (document.getElementById(id) as HTMLDialogElement)?.showModal()
      : (document.getElementById(id) as HTMLDialogElement)?.close();
  };

  return (
    <div className="grid w-full grid-cols-2 grid-rows-2 flex-wrap gap-4 px-3">
      {items.map((item, key) => (
        <React.Fragment key={key}>
          <label
            onClick={() => openModal(item.id, "open")}
            className="fx row-span-1"
          >
            <div className="active:bg-base-200/40 hover:bg-base-200/40 fx flex-col gap-4 rounded-2xl px-[5vw] py-2.5 duration-200">
              <div className="bg-base-300 fx size-[25vw] rounded-xl">
                {item.icon()}
              </div>
              <span className="whitespace-nowrap">{item.text}</span>
            </div>
          </label>

          <dialog id={item.id} className="modal">
            <div className="modal-box flex !h-[calc(100vh-250px)] flex-col">
              <button
                onClick={() => openModal(item.id, "close")}
                className="absolute top-0 right-0 p-3 bg-base-300/50  rounded-bl-3xl"
              >
                <IconX />
              </button>
              <header className="bg-base-300 flex items-center py-1">
                {item.icon("size-[10vw]")}{" "}
                <span className="text-xl">{item.text}</span>
              </header>
              {key ? <JoinGame /> : <CreateGame />}
            </div>
            <form method="dialog" className="modal-backdrop">
              <button>close</button>
            </form>
          </dialog>
        </React.Fragment>
      ))}
    </div>
  );
}

export default Play;
