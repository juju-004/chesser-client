"use client";

import {  } from "@/context/ToastContext";
import { sendMail } from "@/lib/auth";
import { IconSend } from "@tabler/icons-react";
import React, { useEffect, useState } from "react";

function Mailsend({ email }: { email: { mail: string; nv: boolean } }) {
  const [time, setTime] = useState<number>(email.nv ? 0 : 60);
  const { toast } = ();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (time === 0) return; // Stop the timer when it reaches 0

    // Set up the interval to decrement the time every second
    const interval = setInterval(() => {
      setTime((prevTime) => prevTime - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [time]);

  const submitAction = async () => {
    setLoading(true);

    setTimeout(async () => {
      const { mail } = email;
      const data = await sendMail(mail);
      if (typeof data === "string") {
        toast(data, "error");
      } else if (data?.email) {
        toast("Mail sent successfully", "success");

        setTime(60);
      }

      setLoading(false);
    }, 1000);
  };

  return (
    <div className="fx mx-auto bg-base-300/40 shadow-md mt-12 w-full max-w-md flex-col rounded-3xl px-8 pb-6 text-center">
      <span className="fx text-secondary bg-secondary/15 h-16 w-16 -translate-y-1/2 rounded-2xl">
        <IconSend className="size-8" />
      </span>
      <div>
        Please click on the verification link sent to{" "}
        <a
          href="https://mail.google.com"
          target="_blank"
          rel="noopener noreferrer"
          className="link text-sky-400"
        >
          {email.mail}
        </a>{" "}
        to activate your account
      </div>
      <button
        disabled={loading ? true : time ? true : false}
        className={`btn btn-soft btn-secondary fx disabled:btn-neutral mt-3 disabled:text-white/40`}
        onClick={submitAction}
      >
        {loading && (
          <span className="loading loading-spinner loading-sm mr-0.5"></span>
        )}{" "}
        Resend {time ? `in ${time}s` : ""}
      </button>
    </div>
  );
}

export default Mailsend;
