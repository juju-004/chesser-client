"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { IconCreditCard } from "@tabler/icons-react";
import axios from "axios";
import { API_URL } from "@/config";
import { useSession } from "@/context/SessionProvider";
import { useToast } from "@/context/ToastContext";

export default function PaystackForm() {
  const [amount, setAmount] = useState("");
  const [loading, startTransition] = useTransition();
  const session = useSession();
  const { toast } = useToast();

  const input = useRef<HTMLInputElement | null>(null);

  const handlePayment = () => {
    startTransition(async () => {
      try {
        const res = await axios.post(
          `${API_URL}/v1/pay`,
          {
            email: session.user?.email,
            amount: parseFloat(amount),
          },
          { withCredentials: true }
        );

        window.location.href = res.data.authorization_url;
        return;
      } catch (err) {
        toast("Payment initiation failed.", "error");
        return;
      }
    });
  };

  useEffect(() => {
    input.current && input.current.focus();
  }, []);

  return (
    <div className="max-w-md w-full mx-auto p-6 bg-base-100">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <IconCreditCard className="w-5 h-5" />
        Pay with Paystack
      </h2>

      <div className="form-control mb-4 mt-10">
        <input
          type="number"
          placeholder="min 100"
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
        Pay Now
      </button>
    </div>
  );
}
