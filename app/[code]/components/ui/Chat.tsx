"use client";

import { IconMessage2, IconSend2 } from "@tabler/icons-react";
import React, { useEffect, useRef } from "react";
import type { FormEvent, KeyboardEvent } from "react";

import type { Lobby, Message, Session, User } from "@/types";
import { useSession } from "@/context/SessionProvider";
import { useSocket } from "@/context/SocketProvider";
import { useRoom } from "../context/GameRoom";

interface ChatInterface {
  addMessage?: Function;
  chatMessages: Message[];
  id: string;
  setChatDot: Function;
}

function Chat({ id, addMessage, chatMessages, setChatDot }: ChatInterface) {
  const { socket } = useSocket();
  const session = useSession();
  const chatListRef = useRef<HTMLUListElement>(null);
  const { connectedUsers, isUserAPlayer } = useRoom();

  useEffect(() => {
    const chatList = chatListRef.current;
    if (!chatList) return;
    chatList.scrollTop = chatList.scrollHeight;
  }, [chatMessages]);

  function sendChat(message: string) {
    if (!session?.user || !socket || !addMessage) return;

    socket.emit("chat", message);
    addMessage({ author: session.user, message });
  }

  function chatKeyUp(e: KeyboardEvent<HTMLInputElement>) {
    if (!socket) return;
    e.preventDefault();
    if (e.key === "Enter") {
      const input = e.target as HTMLInputElement;
      if (!input.value || input.value.length == 0) return;
      sendChat(input.value);
      input.value = "";
    }
  }

  function chatClickSend(e: FormEvent<HTMLFormElement>) {
    if (!socket) return;
    e.preventDefault();

    const target = e.target as HTMLFormElement;
    const input = target.elements.namedItem("chatInput") as HTMLInputElement;
    if (!input.value || input.value.length == 0) return;
    sendChat(input.value);
    input.value = "";
  }
  return (
    <div className="drawer-side z-50">
      <label
        htmlFor={id}
        onClick={() => setChatDot && setChatDot()}
        aria-label="close sidebar"
        className="drawer-overlay"
      ></label>

      {/* ! Chat */}
      <div className="bg-base-200 text-base-content flex min-h-full w-[90%] flex-col p-4">
        <header className="flex w-full justify-center gap-1 pb-3">
          Chat <IconMessage2 className="text-accent" />
        </header>
        <div className="bg-base-300 flex h-full w-full min-w-[64px] flex-1 flex-col overflow-y-scroll rounded-lg p-4 shadow-sm">
          <ul
            className="mb-4 flex h-full flex-col gap-1 overflow-y-scroll break-words"
            ref={chatListRef}
          >
            {chatMessages.map((m, i) => {
              return (
                <React.Fragment key={i}>
                  {m.author.name === "server" ? (
                    <div className="mb-3 opacity-25 italic">{m.message}</div>
                  ) : (
                    <div
                      className={`chat  ${
                        m.author.name === session?.user?.name
                          ? "chat-start "
                          : "chat-end"
                      }`}
                    >
                      <div
                        className={`chat-bubble text-white ${
                          m.author.name === session?.user?.name
                            ? "chat-bubble-accent "
                            : "chat-bubble-neutral"
                        }`}
                      >
                        {m.message}
                      </div>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </ul>
        </div>
        {}
        {connectedUsers && (
          <div className="w-full px-2 text-xs md:px-0">
            Spectators:{" "}
            {connectedUsers.map(
              (c) => !isUserAPlayer(c.id as string) && <>{c.name}</>
            )}
          </div>
        )}
        {socket && (
          <form className="mt-5 flex px-1" onSubmit={chatClickSend}>
            <input
              type="text"
              placeholder="Chat here..."
              className="input input-bordered flex-grow rounded-2xl"
              name="chatInput"
              id="chatInput"
              onKeyUp={chatKeyUp}
              required
            />
            <button
              className="btn btn-square ml-1 rounded-2xl bg-accent"
              type="submit"
            >
              <IconSend2 />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default Chat;
