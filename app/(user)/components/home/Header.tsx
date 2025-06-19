import Image from "next/image";
import React from "react";

function Header({ text }: { text: string }) {
  return (
    <div className="mt-4 flex relative px-8 items-center text-sm ">
      <Image
        className="absolute -z-10 -left-2 size-36 opacity-15"
        alt=""
        width={80}
        height={80}
        src={"/svg/swipe.svg"}
      />
      {text}
    </div>
  );
}

export default Header;
