"use client";

import Header from "./components/home/Header";
import Play from "./components/home/Play";
import Wallet from "./components/home/Wallet";
import MenuSlider from "./components/MenuSlider";

export default function Home() {
  return (
    <MenuSlider className="gap-3 items-center">
      <Header text="Wallet" />
      <Wallet />
      <Header text="Play" />
      <Play />
    </MenuSlider>
  );
}
