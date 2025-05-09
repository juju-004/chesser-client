"use client";

import Wallet from "./components/Wallet";
import Header from "./components/Header";
import Play from "./components/Play";
import Slider from "../components/MenuSlider";

export default function Home() {
  return (
    <Slider>
      <Header text="Wallet" />
      <Wallet />
      <Header text="Play" />
      <Play />
    </Slider>
  );
}
