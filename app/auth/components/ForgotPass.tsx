"use client";

import React, { useState } from "react";
import FormInput from "./form-input";
import FormButton from "./form-button";
import { useToast } from "@/context/ToastContext";
import { IconSend } from "@tabler/icons-react";
import { sendMail } from "@/lib/auth";

const ForgotPass = () => {
  const [disabled, setDisabled] = useState<boolean>(false);
  const [email, setEmail] = useState<string | null>(null);
  const { toast } = useToast();

  const submitAction = (formData: any) => {
    setDisabled(true);
    const password = formData.get("password2");
    const email = formData.get("email2");

    setTimeout(async () => {
      const user = await sendMail(email, password);
      if (typeof user === "string") {
        (
          document.getElementById("forgotPassModal") as HTMLDialogElement
        ).close();
        setTimeout(() => {
          toast(user, "error");
        }, 500);
      } else if (user?.email) {
        setEmail(user.email);
      }
      setDisabled(false);
    }, 700);
  };
  return (
    <dialog id="forgotPassModal" className="modal modal-bottom px-2">
      <div className="modal-box rounded-2xl mx-auto max-w-xl mb-[5vh]">
        {email ? (
          <form
            method="dialog"
            className="flex w-full flex-col items-center justify-center"
          >
            <span className="fx text-secondary bg-secondary/15 size-12 rounded-2xl">
              <IconSend className="size-8" />
            </span>
            <h3 className="mb-4 mt-1 text-lg opacity-60">Confirm your Email</h3>
            <span className="text-center">
              We have sent a password reset link to{" "}
              <a
                href="https://mail.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="link text-secondary"
              >
                {email}
              </a>
            </span>
            <button className="btn btn-lg fx font-jose-bold grad1 mt-5 w-full gap-2 rounded-xl font-light text-white disabled:opacity-75">
              Close
            </button>
          </form>
        ) : (
          <div>
            <h3 className="text-lg font-bold">ForgotPassword</h3>
            <form
              action={submitAction}
              className="flex w-full flex-col pb-3 pt-8"
            >
              <FormInput
                name={"email2"}
                type="email"
                placeholder={"Your email"}
              />
              <FormInput
                name={"password2"}
                type="password"
                placeholder={"New password"}
              />
              <FormButton disabled={disabled} text={"Submit"} />
            </form>
          </div>
        )}
      </div>
      <form className="modal-backdrop" method="dialog">
        <button className="modal-backdrop">Close</button>
      </form>
    </dialog>
  );
};

export default ForgotPass;
