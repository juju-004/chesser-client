"use client";

import Header from "./components/Header";
import Play from "./components/Play";
import Wallet from "./components/Wallet";

export default function Home() {
  return (
    <div className="flex flex-col gap-3 ">
      <Header text="Wallet" />
      <Wallet />
      <Header text="Play" />
      <Play />
    </div>
  );
}
