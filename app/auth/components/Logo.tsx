import Image from "next/image";
import React from "react";

function Logo() {
  return (
    <div className="fx h-[40vh]">
      {/* <Image
        width={200}
        height={200}
        className=""
        src={"/svg/chesserlogo1.svg"}
        alt=""
      /> */}

      <h3 className="font-jose-bold relative text-6xl">
        chesser
        <Image
          width={250}
          height={250}
          className=" absolute bottom-0 rotate-[30deg] opacity-10 "
          src={"/svg/swipe.svg"}
          alt=""
        />
        <Image
          width={250}
          height={250}
          className=" absolute -bottom-4 -rotate-12 opacity-5 "
          src={"/svg/swipe.svg"}
          alt=""
        />
      </h3>
    </div>
  );
}

export default Logo;
