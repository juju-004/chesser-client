import { useSocket } from "@/context/SocketProvider";
import { IconClock, IconX } from "@tabler/icons-react";
import { IconSwords } from "@tabler/icons-react";
import React, { useEffect, useState } from "react";
import CreateForm from "../(home)/components/game/createForm";
import { User } from "@/types";
import { useRouter } from "next/navigation";
import { CLIENT_URL } from "@/config";
import { useToast } from "@/context/ToastContext";
import { useChessSounds } from "../[code]/components/ui/SoundManager";

export type ChallengeData = {
  id: string;
  from: Partial<User>;
  to: string;
  side?: "white" | "black" | "random";
  timeControl?: number; // in minutes, or a { base, increment } object
  amount?: number; // wagered amount or points
};

function Button() {
  const openModal = () => {
    (
      document.getElementById("challengeModal") as HTMLDialogElement
    )?.showModal();
  };

  return (
    <button
      onClick={openModal}
      id="cbtn"
      className="btn hidden relative btn-ghost btn-circle"
    >
      <IconSwords size={20} />
      <span className="absolute inset-0 animate-pulse bg-secondary/50 "></span>
    </button>
  );
}

function Modal() {
  const { socket } = useSocket();
  const [challenge, setChallenge] = useState<ChallengeData | null>(null);
  const router = useRouter();
  const [disabled, setDisabled] = useState(false);
  const { playSound } = useChessSounds();

  useEffect(() => {
    socket.on("challenge:received", (challenge) => {
      document.getElementById("cbtn")?.classList.remove("hidden");
      playSound("notify");
      setChallenge(challenge);
    });

    socket.on("challenge:start", (code) => {
      router.push(`${CLIENT_URL}/${code}`);
    });

    return () => {
      socket.off("challenge:received");
      socket.off("challenge:start");
    };
  }, []);

  const acceptChallenge = () => {
    setDisabled(true);
    socket.emit("challenge:accept", { id: challenge?.id });
  };

  const declineChallenge = () => {
    socket.emit("challenge:decline", { id: challenge?.id });
    document.getElementById("cbtn")?.classList.add("hidden");
  };

  return (
    <dialog id="challengeModal" className="modal">
      <div className="modal-box flex max-h-[80vh] flex-col px-2 pt-2 pb-0 gap-2 items-center">
        <div className="rounded-xl bg-black/10 overflow-hidden relative py-8 w-full fx flex-col">
          <header className="py-4 fx w-full">
            <h2 className="font-bold text-lg">
              {challenge?.from.name} sent you a challenge{" "}
            </h2>
          </header>
          <div className="fx gap-4">
            <span className="font-bold text-secondary fx gap-1">
              <IconClock /> <span>{challenge?.timeControl} mins</span>
            </span>
            |
            <span className="font-bold text-secondary fx gap-1">
              ₦{challenge?.amount}
            </span>
          </div>
          <IconSwords
            className="absolute -left-3 text-secondary/5"
            size={100}
          />
        </div>

        <div className="flex gap-4 mt-2 pb-2">
          <button
            onClick={acceptChallenge}
            disabled={disabled}
            className="btn rounded-2xl btn-soft btn-secondary"
          >
            {disabled && (
              <span className="loading loading-spinner loading-sm"></span>
            )}{" "}
            Accept
          </button>
          <form method="dialog">
            <button
              disabled={disabled}
              onClick={declineChallenge}
              className="btn rounded-2xl btn-soft btn-error"
            >
              Decline
            </button>
          </form>
        </div>
      </div>
    </dialog>
  );
}

function ModalMain() {
  const { socket } = useSocket();
  const to = localStorage.getItem("c:to");
  const [disabled, setDisabled] = useState(false);
  const [text, setText] = useState("Send");
  const { toast } = useToast();

  if (!to) return;

  const sendChallenge = async (s: string, t: number, a: number) => {
    setDisabled(true);

    socket.emit("challenge:send", { to, side: s, timeControl: t, amount: a });
    setText("Waiting for opponent...");
  };

  const closeModal = () => {
    (
      document.getElementById("challengeModalMain") as HTMLDialogElement
    )?.close();
  };

  useEffect(() => {
    socket.on("challenge:declined", () => {
      setText("Send");
      setDisabled(false);
      closeModal();
      toast("Challlenge request declined", "error");
    });

    return () => {
      socket.off("challenge:declined");
    };
  }, []);

  return (
    <dialog id={"challengeModalMain"} className="modal">
      <div className="modal-box flex !h-[calc(100vh-250px)] flex-col">
        <button
          onClick={closeModal}
          className="absolute top-0 right-0 p-3 bg-base-300/50  rounded-bl-3xl"
        >
          <IconX />
        </button>
        <header className="bg-base-300 flex items-center px-2 gap-2 py-1">
          <IconSwords className="text-accent size-[8vw]" />
          <span className="text-xl">Challenge</span>
        </header>
        <CreateForm disabled={disabled} exec={sendChallenge} btnText={text} />
      </div>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
}

const Challenge = {
  Button,
  Modal,
  ModalMain,
};

export default Challenge;
