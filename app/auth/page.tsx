"use client";

import React, { useState } from "react";
import Logo from "./components/Logo";
import FormInput from "./components/form-input";
import FormButton from "./components/form-button";
import { fetchUsername, login, register } from "@/lib/auth";
import { useRouter, useSearchParams } from "next/navigation";
import Mailsend from "./components/mailsend";
import { useToast } from "@/context/ToastContext";
import ForgotPass from "./components/ForgotPass";
import { useSession } from "@/context/SessionProvider";
import { IconCircleCheckFilled } from "@tabler/icons-react";

function Login() {
  const session = useSession();
  const { toast } = useToast();
  const { push } = useRouter();
  const searchParams = useSearchParams();
  const [disabled, setDisabled] = useState(false);
  const [mail, setMail] = useState<{ mail: string; nv: boolean } | null>(null);
  const [userNameExists, setuserNameExists] = useState(false);
  const [userfieldLoading, setUserfieldLoading] = useState(false);
  let debounceTimeout: ReturnType<typeof setTimeout>;

  const signin = async (formData: any) => {
    setDisabled(true);
    const password = formData.get("password");
    const nameoremail = formData.get("nameoremail");

    setTimeout(async () => {
      const user = await login(nameoremail, password);
      if (typeof user === "string") {
        toast(user, "error");
        setDisabled(false);
      } else if (user?.notVerified) {
        setMail({ mail: user.email, nv: true });
      } else if (user?.id) {
        session?.setUser(user);

        setTimeout(() => {
          const callback = searchParams.get("callback");

          callback ? push(callback) : push("/");
        }, 200);
      }
    }, 700);
  };

  const signup = async (formData: any) => {
    setDisabled(true);
    const username = formData.get("username");
    const password = formData.get("password");
    const email = formData.get("email");

    setTimeout(async () => {
      const user = await register(username, password, email);

      if (typeof user === "string") {
        toast(user, "error");
      } else if (user?.notVerified) {
        setMail({ mail: user.email, nv: true });
      } else if (user?.email) {
        setMail({ mail: user.email, nv: false });
      }
      setDisabled(false);
    }, 700);
  };

  async function checkIfUserNameExists(v: string) {
    if (v.length <= 3) {
      userNameExists && setuserNameExists(true);
      return;
    }

    const data = await fetchUsername(v);

    if (typeof data === "string") {
      if ((document.getElementById("regis") as HTMLInputElement)?.checked) {
        toast(data, "error");
      }

      setuserNameExists(true);
    } else if (data?.isAvail) setuserNameExists(false);
    else {
      if ((document.getElementById("regis") as HTMLInputElement)?.checked) {
        toast("This username has already been taken", "error");
      }

      setuserNameExists(true);
    }
  }

  function checkUsernameDebounced(username: string): void {
    !userfieldLoading && setUserfieldLoading(true);

    clearTimeout(debounceTimeout);

    debounceTimeout = setTimeout(async () => {
      await checkIfUserNameExists(username);
      setUserfieldLoading(false);
    }, 2000); // 2 seconds delay
  }

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
            <form action={signin} className="flex w-full flex-col pt-8">
              <FormInput
                type="text"
                name={"nameoremail"}
                placeholder={"Your username or email"}
              />
              <FormInput name={"password"} placeholder={"Your pasword"} />
              <FormButton text={"Sign in"} disabled={disabled} />
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
            disabled={disabled}
          />
          <div className="tab-content bg-base-100  border-base-300 rounded-3xl px-6 pb-6">
            <form action={signup} className="flex w-full flex-col pt-8">
              <div className="relative mb-6">
                <FormInput
                  onChange={(e) => checkUsernameDebounced(e.target.value)}
                  name={"username"}
                  placeholder={"Your username"}
                />
                <span className="absolute z-20 right-3 top-1/2 -translate-y-1/2">
                  {userfieldLoading ? (
                    <span className="loading loading-bars"></span>
                  ) : userNameExists ? (
                    <></>
                  ) : (
                    <IconCircleCheckFilled className="text-success" />
                  )}
                </span>
              </div>
              <FormInput name={"email"} placeholder={"Your email"} />
              <FormInput name={"password"} placeholder={"Your pasword"} />
              <span className="mb-6 text-center">
                <span className="opacity-70">
                  By signing up you do consent to our
                </span>{" "}
                <span className="text-secondary">terms of service</span>{" "}
              </span>
              <FormButton disabled={disabled} text={"Register"} />
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;
