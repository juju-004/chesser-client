"use client";

import { useEffect, useRef, useState } from "react";
import { IconCreditCard } from "@tabler/icons-react";
import axios from "axios";
import { API_URL } from "@/config";
import { useSession } from "@/context/SessionProvider";
import { useToast } from "@/context/ToastContext";
import { getWallet } from "@/lib/user";
import MenuSlider from "../../components/MenuSlider";

export default function Withdraw() {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const session = useSession();
  const { toast } = useToast();
  const [balance, setBalance] = useState<number | null | false>(null);

  const input = useRef<HTMLInputElement | null>(null);

  const handlePayment = async () => {
    setLoading(true);
  };

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

  useEffect(() => {
    input.current && input.current.focus();
  }, []);

  return (
    <MenuSlider>
      <div className="max-w-md w-full mx-auto p-6 bg-base-100">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <IconCreditCard className="w-5 h-5" />
          Withdraw
        </h2>
        {balance !== false && (
          <span className="mt-10 gap-2 mb-2 flex">
            Current Wallet:{" "}
            {balance ? (
              <span className="text-secondary">{balance.toLocaleString()}</span>
            ) : (
              <span className="loading loading-xs text-secondary"></span>
            )}
          </span>
        )}
        <div className="form-control mb-4">
          <input
            type="number"
            placeholder="max 100,000"
            className="input w-full input-bordered"
            value={amount}
            ref={input}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        <button
          className={`btn grad1 w-full ${loading && "loading"}`}
          onClick={handlePayment}
          disabled={loading || !amount || parseFloat(amount) < 100}
        >
          Withdraw
        </button>
      </div>
    </MenuSlider>
  );
}
