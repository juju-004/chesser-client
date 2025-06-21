import Image from "next/image";
import React from "react";

function Header({ text }: { text: string }) {
  return (
    <div className="mt-4 flex relative pl-12 items-center text-sm ">
      <Image
        className="absolute -z-10 left-1 size-28 opacity-15"
        alt=""
        width={70}
        height={70}
        src={"/svg/swipe.svg"}
      />
      {text}
    </div>
  );
}

export default Header;
