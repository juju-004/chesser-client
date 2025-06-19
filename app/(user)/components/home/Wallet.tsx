"use client";

import { useToast } from "@/context/ToastContext";
import { getWallet } from "@/lib/user";
import { IconEye } from "@tabler/icons-react";
import { IconEyeCancel } from "@tabler/icons-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";

function Wallet() {
  const [balance, setBalance] = useState<number | null>(null);
  const [see, setSee] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const getW = async () => {
      if (balance === null) {
        const data = await getWallet();

        if (typeof data === "string") {
          toast("failed to fetch wallet", "error");
          return;
        }
        setBalance(data?.wallet);
      }
    };

    getW();
  }, [balance]);

  return (
    <>
      <div className="bg-base-300 mx-auto rounded-2xl pb-11 flex w-[90%] flex-col items-end px-5 pt-3">
        {balance === null ? (
          <span className="loading loading-spinner opacity-40"></span>
        ) : (
          <button
            onClick={() => setSee(!see)}
            className="btn btn-ghost flex items-center gap-4 bg-white/5 px-3 text-xl font-bold"
          >
            <span>
              {see ? (
                <>
                  <span className="text-sm opacity-70">₦</span>{" "}
                  {balance.toLocaleString()}
                </>
              ) : (
                "⁎⁎⁎⁎"
              )}
            </span>
            {see ? (
              <IconEye className="opacity-40" />
            ) : (
              <IconEyeCancel className="opacity-40" />
            )}
          </button>
        )}
        {/* <div className="flex w-full justify-end">
          <Link href={"/pay"} className="btn btn-ghost bg-base-200">
            + Add money
          </Link>
        </div> */}
      </div>
    </>
  );
}

export default Wallet;
