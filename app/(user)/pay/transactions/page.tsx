"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
  IconCreditCard,
  IconX,
  IconLoader,
  IconCheck,
  IconClock,
} from "@tabler/icons-react";
import { API_URL } from "@/config";
import clsx from "clsx";
import MenuSlider from "../../components/MenuSlider";

export type Transaction = {
  _id?: string;
  user?: string; // or `User` type if populated
  amount?: number;
  reference?: string;
  status?: string;
  verified?: boolean;
  channel?: string;
  gateway_response?: string;
  paid_at?: string;
  createdAt: string;
  updatedAt: string;
};

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = async () => {
    try {
      const res = await axios.get(`${API_URL}/v1/pay/transactions`, {
        withCredentials: true,
      });

      setTransactions([...res.data]);
    } catch (err) {
      console.error("Failed to fetch transactions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  return (
    <MenuSlider>
      <div className="p-4 w-full max-w-4xl mx-auto">
        {loading ? (
          <div className="flex justify-center loading loading-dots loading-lg items-center h-40"></div>
        ) : (
          <div className="grid gap-4 pb-16">
            {transactions.map((tx) =>
              tx.verified ? (
                <div
                  key={tx._id}
                  className={clsx(
                    "card bg-base-100 rounded-none shadow-xl border-l-4"
                  )}
                  style={{
                    borderColor:
                      tx.status === "success" ? "#22c55e" : "#f43f5e",
                  }}
                >
                  <div className="card-body">
                    <div className="flex justify-between w-full">
                      <h2 className="card-title">
                        <IconCreditCard size={24} className="opacity-50" />₦
                        {tx.amount}
                      </h2>

                      <span className="opacity-70">{tx.reference}</span>
                    </div>
                    <p>{new Date(tx.createdAt).toLocaleString()}</p>
                    <div className="badge badge-outline">
                      {tx.status === "success" ? (
                        <span className="text-success flex items-center gap-1">
                          <IconCheck size={16} /> Success
                        </span>
                      ) : (
                        <span className="text-error flex items-center gap-1">
                          <IconX size={16} /> Failed
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <Pending
                  updateTransactions={(t) => setTransactions(t)}
                  tx={tx}
                />
              )
            )}
          </div>
        )}
      </div>
    </MenuSlider>
  );
};

const Pending = ({
  tx,
  updateTransactions,
}: {
  tx: Transaction;
  updateTransactions: (t: Transaction[]) => void;
}) => {
  useEffect(() => {
    const reference = new URLSearchParams(window.location.search).get(
      "reference"
    );
    if (reference) {
      axios
        .get(`${API_URL}/v1/pay/${tx.reference}`, { withCredentials: true })
        .then((res) => {
          updateTransactions(res.data);
        })
        .catch(() => {});
    }
  }, []);

  return (
    <div
      key={tx._id}
      className={
        "card bg-base-100 border-yellow-400 rounded-none shadow-xl border-l-4"
      }
    >
      <div className="card-body">
        <h2 className="card-title">
          <IconCreditCard size={24} className="opacity-50" />₦{tx.amount}
        </h2>
        <p>Ref: {tx.reference}</p>
        <p>Date: {new Date(tx.createdAt).toLocaleString()}</p>
        <div className="badge badge-outline">
          <span className="text-warning flex items-center gap-1">
            <IconClock size={16} /> Pending
          </span>
        </div>
      </div>
    </div>
  );
};

export default TransactionsPage;
