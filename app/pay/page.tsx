"use client";

import { useEffect, useRef, useState } from "react";
import { IconCreditCard } from "@tabler/icons-react";
import axios from "axios";
import { API_URL } from "@/config";
import { useSession } from "@/context/SessionProvider";
import MenuSlider from "../components/MenuSlider";
import { useToast } from "@/context/ToastContext";

export default function PaystackForm() {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const session = useSession();
  const { toast } = useToast();

  const input = useRef<HTMLInputElement | null>(null);

  const handlePayment = async () => {
    setLoading(true);
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
    } catch (err) {
      toast("Payment initiation failed.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    input.current && input.current.focus();
  }, []);

  return (
    <MenuSlider>
      <div className="max-w-md w-full mx-auto p-6 bg-base-100">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <IconCreditCard className="w-5 h-5" />
          Pay with Paystack
        </h2>

        <div className="form-control mb-4 mt-10">
          <input
            type="number"
            placeholder="1000"
            className="input input-bordered"
            value={amount}
            ref={input}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        <button
          className={`btn btn-primary w-full ${loading && "loading"}`}
          onClick={handlePayment}
          disabled={loading || !amount}
        >
          Pay Now
        </button>
      </div>
    </MenuSlider>
  );
}
