import Image from "next/image";
import React from "react";

function Header({ text }: { text: string }) {
  return (
    <div className="mt-4 flex relative w-full pl-7 items-center gap-2 text-sm ">
      <Image
        className="absolute -z-10 left-0 size-24 opacity-15"
        alt=""
        width={50}
        height={50}
        src={"/svg/swipe.svg"}
      />
      {text}
    </div>
  );
}

export default Header;
