import { CLIENT_URL } from "@/config";
import { IconError404, IconMoodPuzzled } from "@tabler/icons-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="fx flex-col h-screen relative w-screen gap-4">
      <IconError404 className="absolute opacity-5 -z-10" size={300} />
      <IconMoodPuzzled size={100} className="text-secondary" />
      <div className="text-xl text-center  font-bold">
        The requested page <br /> does not exist
      </div>
      <Link href={CLIENT_URL} className="btn btn-ghost btn-neutral btn-soft">
        Go to /
      </Link>
    </div>
  );
}
