import { verifyMail } from "@/lib/auth";
import { IconMailCheck } from "@tabler/icons-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import React from "react";

async function VerifyToken({ params }: { params: { token: string } }) {
  const data = await verifyMail(params.token.trim());

  if (!data.message) notFound();

  return (
    <div className="fx h-screen w-screen flex-col px-7 text-xl">
      <span className="bg-success/5 fx mb-3 size-20 rounded-full">
        <IconMailCheck size={40} className="text-success" />
      </span>
      <h3 className="text-succe mb-3 text-lg">{data.message}</h3>
      <Link className="btn rounded-xl font-light text-white/55" href={"/auth"}>
        back to login
      </Link>
    </div>
  );
}

export default VerifyToken;
