"use client";

import React, { useState, useTransition } from "react";
import Logo from "./components/Logo";
import FormInput from "./components/form-input";
import FormButton from "./components/form-button";
import { login } from "@/lib/auth";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/context/ToastContext";
import { useSession } from "@/context/SessionProvider";
import dynamic from "next/dynamic";

const ForgotPass = dynamic(() => import("./components/ForgotPass"), {
  ssr: false,
});
const Register = dynamic(() => import("./components/register"), {
  ssr: false,
});
const Mailsend = dynamic(() => import("./components/mailsend"), {
  ssr: false,
});

function Login() {
  const session = useSession();
  const { toast } = useToast();
  const { push } = useRouter();
  const searchParams = useSearchParams();
  const [mail, setMail] = useState<{ mail: string; nv: boolean } | null>(null);

  const [isPending, startTransition] = useTransition();

  const signIn = (formData: any) => {
    startTransition(async () => {
      const password = formData.get("password");
      const nameoremail = formData.get("nameoremail");

      const user = await login(nameoremail, password);

      if (typeof user === "string") {
        toast(user, "error");
        return;
      } else if (user?.notVerified) {
        setMail({ mail: user.email, nv: true });
        return;
      }

      session?.setUser(user);

      setTimeout(() => {
        const callback = searchParams.get("callback");

        callback ? push(callback) : push("/");
      }, 200);
    });
  };

  return (
    <div className="mb-20 px-4">
      <ForgotPass />
      <Logo />
      {mail ? (
        <Mailsend email={mail} />
      ) : (
        <div className="tabs max-w-lg mx-auto tabs-border justify-center">
          <input
            type="radio"
            defaultChecked
            name="my_tabs_6"
            className="tab text-md w-1/3"
            aria-label="Login"
          />
          <div className="tab-content bg-base-100 border-base-300 rounded-3xl px-6 pb-6">
            <form action={signIn} className="flex w-full flex-col pt-8">
              <FormInput
                type="text"
                name={"nameoremail"}
                placeholder={"Your username or email"}
              />
              <FormInput name={"password"} placeholder={"Your pasword"} />
              <FormButton text={"Sign in"} disabled={isPending} />
              <div className="mt-4 px-5 text-center opacity-70">
                Forgotten password?{" "}
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    (
                      document.getElementById(
                        "forgotPassModal"
                      ) as HTMLDialogElement
                    ).showModal();
                  }}
                  className="text-secondary cursor-pointer"
                >
                  Reset
                </span>
              </div>
            </form>
          </div>

          <input
            type="radio"
            name="my_tabs_6"
            id="regis"
            className="tab text-md w-1/3"
            aria-label="Register"
            disabled={isPending}
          />
          <div className="tab-content bg-base-100  border-base-300 rounded-3xl px-6 pb-6">
            <Register setMail={({ mail, nv }) => setMail({ mail, nv })} />
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;
