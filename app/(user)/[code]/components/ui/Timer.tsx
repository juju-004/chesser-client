"use client";

import { useEffect, useRef, useCallback } from "react";
import { useChessSounds } from "./SoundManager";

interface ChessTimerProps {
  color: "white" | "black";
  initialTime?: number;
  lowTimeThreshold?: number;
  isActive: boolean;
  timerStarted?: boolean;
  time: number;
}

export const ChessTimer = ({
  color,
  isActive,
  time,
  lowTimeThreshold = 30000,
}: ChessTimerProps) => {
  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    if (ms < 10000) {
      const tenths = Math.floor((ms % 1000) / 100); // One digit
      return (
        <>
          {minutes}:{seconds.toString().padStart(2, "0")}
          <span className="text-sm align-baseline">.{tenths}</span>
        </>
      );
    } else {
      return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    }
  };

  return (
    <div
      className={`timer ${color} ${isActive ? "active" : ""} ${
        time <= lowTimeThreshold ? "low-time" : ""
      }`}
    >
      <div className="time-display">{formatTime(time)}</div>
    </div>
  );
};

export const ActiveChessTimer = ({
  color,
  isActive,
  timerStarted,
  time,
  lowTimeThreshold = 30000,
}: ChessTimerProps) => {
  const { playSound } = useChessSounds();
  const lowtimeSound = useRef(false);

  const formatTime = useCallback((ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    if (ms < 10000) {
      const tenths = Math.floor((ms % 1000) / 100); // One digit
      return (
        <>
          {minutes}:{seconds.toString().padStart(2, "0")}
          <span className="text-sm align-baselinee">.{tenths}</span>
        </>
      );
    } else {
      return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    }
  }, []);

  useEffect(() => {
    if (time <= lowTimeThreshold && !lowtimeSound.current) {
      playSound("lowTime");
      lowtimeSound.current = true;
    }
  }, [time]);

  return (
    <div
      className={`timer ${color} ${isActive && timerStarted ? "active" : ""} ${
        time <= lowTimeThreshold ? "low-time" : ""
      }`}
    >
      <div className="time-display">{formatTime(time)}</div>
    </div>
  );
};
