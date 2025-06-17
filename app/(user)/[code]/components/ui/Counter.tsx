import { useEffect, useState } from "react";

interface AnimatedCounterProps {
  from: number;
  to: number;
  duration?: number; // in milliseconds
  className?: string;
}

export default function Counter({
  from,
  to,
  duration = 1000,
  className = "",
}: AnimatedCounterProps) {
  const [count, setCount] = useState(from);

  useEffect(() => {
    let start: number;
    const increment = to - from;
    const startTime = performance.now();

    const animate = (timestamp: number) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const progress = Math.min(elapsed / duration, 1);

      setCount(Math.floor(from + increment * progress));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [from, to, duration]);

  return (
    <span className={`font-mono ${className}`}>{count.toLocaleString()}</span>
  );
}
