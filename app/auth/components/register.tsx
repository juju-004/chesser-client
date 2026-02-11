"use client";

import React, { useState, useTransition } from "react";
import FormInput from "./form-input";
import { fetchUsername, register } from "@/lib/auth";
import { IconCircleCheckFilled, IconCircleXFilled } from "@tabler/icons-react";
import FormButton from "./form-button";
import { toast } from "sonner";
import { useSession } from "@/context/SessionProvider";
import { useRouter } from "next/navigation";

function Register({
  setMail,
}: {
  setMail: ({ mail, nv }: { mail: string; nv: boolean }) => void;
}) {
  const session = useSession();
  const router = useRouter();
  const [userNameExists, setuserNameExists] = useState(false);
  const [userfieldLoading, setUserfieldLoading] = useState(false);
  let debounceTimeout: ReturnType<typeof setTimeout>;

  const [isPending, startTransition] = useTransition();
  const [isUnamePending, startUnameTransition] = useTransition();

  const signUp = (formData: any) => {
    startTransition(async () => {
      const username = formData.get("username");
      const password = formData.get("password");
      const email = formData.get("email");

      const user = await register(username, password, email);

      if (typeof user === "string") {
        toast.error(user);
      } else if (user) {
        session.setUser(user);
        router.push("/");
      }

      // else if (user?.notVerified) {
      //   setMail({ mail: user.email, nv: true });
      // }
      // else setMail({ mail: user.email, nv: false });
      return;
    });
  };

  async function checkIfUserNameExists(v: string) {
    if (v.length <= 3) {
      userNameExists && setuserNameExists(true);
      return;
    }

    const data = await fetchUsername(v);

    if (data?.isAvail) setuserNameExists(false);
    else setuserNameExists(true);
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
    <form action={signUp} className="flex w-full flex-col pt-8">
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
            <IconCircleXFilled className="text-error" />
          ) : (
            <IconCircleCheckFilled className="text-success" />
          )}
        </span>
      </div>
      <FormInput name={"email"} placeholder={"Your email"} />
      <FormInput name={"password"} placeholder={"Your pasword"} />
      <span className="mb-6 text-center">
        <span className="opacity-70">By signing up you do consent to our</span>{" "}
        <span className="text-secondary">terms of service</span>{" "}
      </span>
      <FormButton disabled={isPending} text={"Register"} />
    </form>
  );
}

export default Register;
